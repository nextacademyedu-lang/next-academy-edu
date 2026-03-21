import { safeErrorMessage, trimTo } from './utils.ts';

type TwentyResourceKey = 'contacts' | 'companies' | 'leads' | 'deals';

interface TwentyClientOptions {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
}

interface TwentyUpsertResult {
  id: string | null;
  raw: unknown;
}

function getDefaultResources(): Record<TwentyResourceKey, string> {
  return {
    contacts: process.env.TWENTY_RESOURCE_CONTACTS || 'people',
    companies: process.env.TWENTY_RESOURCE_COMPANIES || 'companies',
    leads: process.env.TWENTY_RESOURCE_LEADS || 'leads',
    deals: process.env.TWENTY_RESOURCE_DEALS || 'opportunities',
  };
}

function ensureLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function extractRecordId(record: unknown): string | null {
  if (!record || typeof record !== 'object') return null;

  const candidates = ['id', 'recordId', '_id', 'uuid'];
  for (const key of candidates) {
    const value = (record as Record<string, unknown>)[key];
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
  }
  return null;
}

function extractRecordFromResponse(payload: unknown): unknown {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] ?? null;
  if (typeof payload !== 'object') return null;

  const obj = payload as Record<string, unknown>;
  if (obj.data && typeof obj.data === 'object') {
    if (Array.isArray(obj.data)) return obj.data[0] ?? null;

    const dataObj = obj.data as Record<string, unknown>;
    if (extractRecordId(dataObj)) return dataObj;

    // Twenty often wraps records as data.createPerson / data.updateOpportunity / ...
    for (const value of Object.values(dataObj)) {
      if (Array.isArray(value)) {
        const first = value[0];
        if (first && typeof first === 'object') return first;
      } else if (value && typeof value === 'object') {
        return value;
      }
    }

    return dataObj;
  }
  if (obj.item && typeof obj.item === 'object') return obj.item;
  if (obj.record && typeof obj.record === 'object') return obj.record;
  if (obj.doc && typeof obj.doc === 'object') return obj.doc;
  return obj;
}

function extractListFromResponse(payload: unknown): unknown[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  if (obj.data && typeof obj.data === 'object') {
    const data = obj.data as Record<string, unknown>;
    if (Array.isArray(data)) return data;
    for (const value of Object.values(data)) {
      if (Array.isArray(value)) return value;
    }
  }

  const listCandidates = ['data', 'items', 'records', 'docs', 'results'];
  for (const key of listCandidates) {
    const value = obj[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function extractPrimaryEmail(record: unknown): string | null {
  if (!record || typeof record !== 'object') return null;
  const emails = (record as Record<string, unknown>).emails;
  if (!emails || typeof emails !== 'object') return null;
  const primary = (emails as Record<string, unknown>).primaryEmail;
  return typeof primary === 'string' ? primary : null;
}

export class TwentyClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(options: TwentyClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs ?? 15000;
  }

  getResourcePath(resource: TwentyResourceKey): string {
    const value = getDefaultResources()[resource];
    return value.replace(/^\/+/, '');
  }

  private async request(method: string, path: string, body?: unknown): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}${ensureLeadingSlash(path)}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      const text = await res.text();
      const data = text ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })() : null;

      if (!res.ok) {
        const message = trimTo(
          typeof data === 'string'
            ? data
            : JSON.stringify(data),
          1000,
        );
        throw new Error(
          `Twenty API ${method} ${path} failed (${res.status}): ${message || res.statusText}`,
        );
      }

      return data;
    } catch (error) {
      throw new Error(`Twenty request error: ${safeErrorMessage(error)}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async findByExternalId(resourcePath: string, externalId: string): Promise<unknown | null> {
    const encoded = encodeURIComponent(externalId);
    const candidates = [
      `/rest/${resourcePath}?filter[externalId][eq]=${encoded}`,
      `/rest/${resourcePath}?where[externalId][equals]=${encoded}`,
      `/rest/${resourcePath}?externalId=${encoded}`,
    ];

    for (const path of candidates) {
      try {
        const result = await this.request('GET', path);
        const list = extractListFromResponse(result);
        if (list.length > 0) return list[0];
      } catch (error) {
        // Only swallow 404 / query-shape errors — rethrow transient failures
        const msg = safeErrorMessage(error);
        if (msg.includes('404') || msg.includes('400') || msg.includes('not found')) {
          continue;
        }
        throw error;
      }
    }

    return null;
  }

  private async createRecord(resourcePath: string, payload: Record<string, unknown>): Promise<TwentyUpsertResult> {
    const raw = await this.request('POST', `/rest/${resourcePath}`, payload);
    const record = extractRecordFromResponse(raw);
    return {
      id: extractRecordId(record),
      raw,
    };
  }

  private async updateRecord(resourcePath: string, id: string, payload: Record<string, unknown>): Promise<TwentyUpsertResult> {
    const raw = await this.request('PATCH', `/rest/${resourcePath}/${id}`, payload);
    const record = extractRecordFromResponse(raw);
    return {
      id: extractRecordId(record) ?? id,
      raw,
    };
  }

  async upsert(
    resource: TwentyResourceKey,
    externalId: string,
    payload: Record<string, unknown>,
  ): Promise<TwentyUpsertResult> {
    const resourcePath = this.getResourcePath(resource);

    const existing = await this.findByExternalId(resourcePath, externalId);
    const existingId = extractRecordId(existing);
    if (existingId) {
      return this.updateRecord(resourcePath, existingId, payload);
    }

    // Some workspaces expose a dedicated upsert endpoint
    try {
      const raw = await this.request('POST', `/rest/${resourcePath}/upsert`, {
        externalId,
        data: payload,
      });
      const record = extractRecordFromResponse(raw);
      const recordId = extractRecordId(record);
      if (recordId) {
        return { id: recordId, raw };
      }
    } catch {
      // Fall back to create flow
    }

    try {
      return await this.createRecord(resourcePath, payload);
    } catch (createError) {
      // Handle potential race condition (created by another worker between find + create)
      const existingAfterRace = await this.findByExternalId(resourcePath, externalId);
      const existingAfterRaceId = extractRecordId(existingAfterRace);
      if (existingAfterRaceId) {
        return this.updateRecord(resourcePath, existingAfterRaceId, payload);
      }
      throw createError;
    }
  }

  async create(
    resource: TwentyResourceKey,
    payload: Record<string, unknown>,
  ): Promise<TwentyUpsertResult> {
    const resourcePath = this.getResourcePath(resource);
    return this.createRecord(resourcePath, payload);
  }

  async updateById(
    resource: TwentyResourceKey,
    id: string,
    payload: Record<string, unknown>,
  ): Promise<TwentyUpsertResult> {
    const resourcePath = this.getResourcePath(resource);
    return this.updateRecord(resourcePath, id, payload);
  }

  async findPersonByPrimaryEmail(email: string): Promise<string | null> {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return null;
    if (this.getResourcePath('contacts') !== 'people') return null;

    const raw = await this.request('GET', '/rest/people?limit=200');
    const people = extractListFromResponse(raw);
    for (const person of people) {
      const primary = extractPrimaryEmail(person)?.trim().toLowerCase();
      if (primary && primary === normalized) {
        const id = extractRecordId(person);
        if (id) return id;
      }
    }

    return null;
  }
}

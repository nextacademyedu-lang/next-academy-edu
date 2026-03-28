import type { APIRequestContext } from '@playwright/test';

type RelationId = number | string;

type JsonRecord = Record<string, unknown>;

type ApiResult<T = unknown> = {
  status: number;
  data: T;
};

const BASE_URL = process.env.E2E_BASE_URL || 'https://nextacademyedu.com';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '';

let cachedAdminToken: string | null = null;

function ensureAdminEnv() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Missing E2E_ADMIN_EMAIL or E2E_ADMIN_PASSWORD env vars.');
  }
}

function relationToId(value: unknown): RelationId | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : trimmed;
  }
  if (value && typeof value === 'object' && 'id' in value) {
    return relationToId((value as { id?: unknown }).id);
  }
  return null;
}

async function parseApiResponse<T>(res: Awaited<ReturnType<APIRequestContext['fetch']>>): Promise<ApiResult<T>> {
  const text = await res.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  return {
    status: res.status(),
    data: data as T,
  };
}

function joinUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
}

export function getBaseUrl(): string {
  return BASE_URL;
}

export async function getAdminToken(apiContext: APIRequestContext): Promise<string> {
  ensureAdminEnv();
  if (cachedAdminToken) return cachedAdminToken;

  const maxAttempts = 8;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const res = await apiContext.post(joinUrl('/api/users/login'), {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    const parsed = await parseApiResponse<{ token?: string }>(res);

    if (parsed.status === 200 && parsed.data?.token) {
      cachedAdminToken = parsed.data.token;
      return cachedAdminToken;
    }

    const isRetryable = parsed.status === 429 || parsed.status >= 500;
    if (!isRetryable || attempt === maxAttempts) {
      throw new Error(`Failed to get admin token (status ${parsed.status})`);
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
  }

  throw new Error('Failed to get admin token');
}

export async function loginUser(
  apiContext: APIRequestContext,
  email: string,
  password: string,
): Promise<string> {
  const maxAttempts = 8;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const res = await apiContext.post(joinUrl('/api/users/login'), {
      data: { email, password },
    });
    const parsed = await parseApiResponse<{ token?: string }>(res);

    if (parsed.status === 200 && parsed.data?.token) {
      return parsed.data.token;
    }

    const isRetryable = parsed.status === 429 || parsed.status >= 500;
    if (!isRetryable || attempt === maxAttempts) {
      throw new Error(`Failed to login user ${email} (status ${parsed.status})`);
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
  }

  throw new Error(`Failed to login user ${email}`);
}

export async function adminRequest<T = unknown>(
  apiContext: APIRequestContext,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: JsonRecord,
): Promise<ApiResult<T>> {
  const token = await getAdminToken(apiContext);

  const res = await apiContext.fetch(joinUrl(path), {
    method,
    headers: {
      Authorization: `JWT ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { data: body } : {}),
  });

  return parseApiResponse<T>(res);
}

export async function userRequest<T = unknown>(
  apiContext: APIRequestContext,
  token: string,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  body?: JsonRecord,
): Promise<ApiResult<T>> {
  const res = await apiContext.fetch(joinUrl(path), {
    method,
    headers: {
      Authorization: `JWT ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { data: body } : {}),
  });

  return parseApiResponse<T>(res);
}

export async function queryCollection(
  apiContext: APIRequestContext,
  collection: string,
  query: string,
): Promise<{ docs: JsonRecord[]; totalDocs?: number }> {
  const safeQuery = query.startsWith('?') ? query.slice(1) : query;
  const result = await adminRequest<{ docs?: JsonRecord[]; totalDocs?: number }>(
    apiContext,
    'GET',
    `/api/${collection}?${safeQuery}`,
  );

  if (result.status !== 200) {
    throw new Error(`Query failed for ${collection} (status ${result.status})`);
  }

  return {
    docs: result.data?.docs || [],
    totalDocs: result.data?.totalDocs,
  };
}

export async function createDocumentAsAdmin(
  apiContext: APIRequestContext,
  collection: string,
  data: JsonRecord,
): Promise<JsonRecord> {
  const result = await adminRequest<{ doc?: JsonRecord }>(
    apiContext,
    'POST',
    `/api/${collection}`,
    data,
  );

  if (result.status !== 200 && result.status !== 201) {
    throw new Error(`Failed to create ${collection} (status ${result.status})`);
  }

  if (!result.data?.doc) throw new Error(`No doc returned when creating ${collection}`);
  return result.data.doc;
}

export async function updateDocumentAsAdmin(
  apiContext: APIRequestContext,
  collection: string,
  id: RelationId,
  data: JsonRecord,
): Promise<JsonRecord> {
  const result = await adminRequest<{ doc?: JsonRecord }>(
    apiContext,
    'PATCH',
    `/api/${collection}/${id}`,
    data,
  );

  if (result.status !== 200) {
    throw new Error(`Failed to update ${collection}/${id} (status ${result.status})`);
  }

  if (!result.data?.doc) throw new Error(`No doc returned when updating ${collection}/${id}`);
  return result.data.doc;
}

export async function deleteDocumentAsAdmin(
  apiContext: APIRequestContext,
  collection: string,
  id: RelationId,
): Promise<void> {
  const result = await adminRequest(apiContext, 'DELETE', `/api/${collection}/${id}`);
  if (result.status !== 200 && result.status !== 204 && result.status !== 404) {
    throw new Error(`Failed to delete ${collection}/${id} (status ${result.status})`);
  }
}

export async function waitForVerificationCode(
  apiContext: APIRequestContext,
  email: string,
  attempts = 15,
  intervalMs = 1000,
): Promise<string> {
  const normalized = email.trim().toLowerCase();

  for (let i = 0; i < attempts; i += 1) {
    const result = await queryCollection(
      apiContext,
      'verification-codes',
      `where[email][equals]=${encodeURIComponent(normalized)}&sort=-createdAt&limit=1`,
    );

    const code = result.docs[0]?.code;
    if (typeof code === 'string' && code.length === 6) return code;

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Verification code not found for ${normalized}`);
}

async function deleteByInstructor(
  apiContext: APIRequestContext,
  collection: string,
  instructorId: RelationId,
): Promise<number> {
  try {
    const docsResult = await queryCollection(
      apiContext,
      collection,
      `where[instructor][equals]=${encodeURIComponent(String(instructorId))}&limit=200&depth=0`,
    );

    let deleted = 0;
    for (const doc of docsResult.docs) {
      const id = relationToId(doc.id);
      if (id === null) continue;
      try {
        await deleteDocumentAsAdmin(apiContext, collection, id);
        deleted += 1;
      } catch {
        // Cleanup best effort only.
      }
    }
    return deleted;
  } catch {
    return 0;
  }
}

export async function cleanupRunId(apiContext: APIRequestContext, runId: string) {
  const runIdToken = runId.toLowerCase();

  const summary: Record<string, number> = {
    users: 0,
    instructors: 0,
    verificationCodes: 0,
    consultationTypes: 0,
    consultationAvailability: 0,
    programSubmissions: 0,
    instructorBlockedDates: 0,
    consultationSlots: 0,
  };

  const usersResult = await queryCollection(
    apiContext,
    'users',
    `where[email][contains]=${encodeURIComponent(runIdToken)}&limit=200&depth=0`,
  );

  const instructorsResult = await queryCollection(
    apiContext,
    'instructors',
    `where[email][contains]=${encodeURIComponent(runIdToken)}&limit=200&depth=0`,
  );

  const instructorIds = new Set<RelationId>();

  for (const user of usersResult.docs) {
    const linked = relationToId(user.instructorId);
    if (linked !== null) instructorIds.add(linked);
  }

  for (const instructor of instructorsResult.docs) {
    const id = relationToId(instructor.id);
    if (id !== null) instructorIds.add(id);
  }

  for (const instructorId of instructorIds) {
    summary.consultationTypes += await deleteByInstructor(apiContext, 'consultation-types', instructorId);
    summary.consultationAvailability += await deleteByInstructor(apiContext, 'consultation-availability', instructorId);
    summary.programSubmissions += await deleteByInstructor(apiContext, 'instructor-program-submissions', instructorId);
    summary.instructorBlockedDates += await deleteByInstructor(apiContext, 'instructor-blocked-dates', instructorId);
    summary.consultationSlots += await deleteByInstructor(apiContext, 'consultation-slots', instructorId);
  }

  for (const instructor of instructorsResult.docs) {
    const id = relationToId(instructor.id);
    if (id === null) continue;
    try {
      await deleteDocumentAsAdmin(apiContext, 'instructors', id);
      summary.instructors += 1;
    } catch {
      // Cleanup best effort only.
    }
  }

  for (const user of usersResult.docs) {
    const id = relationToId(user.id);
    if (id === null) continue;
    try {
      await deleteDocumentAsAdmin(apiContext, 'users', id);
      summary.users += 1;
    } catch {
      // Cleanup best effort only.
    }
  }

  const codesResult = await queryCollection(
    apiContext,
    'verification-codes',
    `where[email][contains]=${encodeURIComponent(runIdToken)}&limit=200&depth=0`,
  );

  for (const code of codesResult.docs) {
    const id = relationToId(code.id);
    if (id === null) continue;
    try {
      await deleteDocumentAsAdmin(apiContext, 'verification-codes', id);
      summary.verificationCodes += 1;
    } catch {
      // Cleanup best effort only.
    }
  }

  return summary;
}

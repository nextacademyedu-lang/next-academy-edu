import type { PayloadRequest } from 'payload';

/**
 * Safely cast a Web API Request to PayloadRequest.
 * This replaces the scattered `req as any` pattern throughout the codebase.
 * 
 * Usage: 
 *   const payloadReq = asPayloadRequest(req);
 *   await payload.find({ req: payloadReq, ... });
 */
export function asPayloadRequest(req: Request): PayloadRequest {
  return req as unknown as PayloadRequest;
}

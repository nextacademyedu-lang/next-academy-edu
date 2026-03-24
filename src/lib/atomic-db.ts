import { getPayload } from 'payload';
import config from '@payload-config';
import { sql } from 'drizzle-orm';

type DrizzleInstance = { execute: (query: ReturnType<typeof sql>) => Promise<unknown> };

/**
 * Get a raw Drizzle instance from Payload for atomic SQL operations.
 *
 * Use this ONLY when you need atomic increments / decrements that cannot
 * have TOCTOU races (e.g. `paidAmount`, `currentUses`, `currentEnrollments`).
 */
async function getDrizzle(): Promise<DrizzleInstance> {
  const payload = await getPayload({ config });
  // Payload CMS v3 with @payloadcms/db-postgres exposes payload.db.drizzle
  return (payload.db as unknown as { drizzle: DrizzleInstance }).drizzle;
}

/**
 * Atomically increment a numeric column and return the new value.
 *
 * Uses `UPDATE ... SET col = col + delta RETURNING col` to avoid TOCTOU.
 * Returns the new value of the column, or null if the row was not found.
 *
 * @param table   - Postgres table name (Payload uses collection slug, e.g. "bookings", "rounds", "discount_codes")
 * @param id      - Row ID (number)
 * @param column  - Column name to increment (e.g. "paid_amount", "current_enrollments")
 * @param delta   - Amount to add (can be negative for decrement)
 * @returns The new value after increment, or null if no row matched.
 */
export async function atomicIncrement(
  table: string,
  id: number | string,
  column: string,
  delta: number,
): Promise<number | null> {
  const db = await getDrizzle();
  const result = await db.execute(
    sql.raw(
      `UPDATE "${table}" SET "${column}" = COALESCE("${column}", 0) + ${delta} WHERE id = ${Number(id)} RETURNING "${column}"`,
    ),
  );
  const rows = (result as unknown as { rows?: Array<Record<string, number>> })?.rows;
  if (!rows || rows.length === 0) return null;
  return rows[0][column] ?? null;
}

/**
 * Atomically increment a counter only if the result stays below a ceiling.
 *
 * Perfect for capacity checks: increment `current_enrollments` only if
 * `current_enrollments + delta <= ceiling`.
 *
 * Returns the new value, or null if the ceiling was already reached
 * (meaning no row was updated).
 */
export async function atomicIncrementWithCeiling(
  table: string,
  id: number | string,
  column: string,
  delta: number,
  ceilingColumn: string,
): Promise<number | null> {
  const db = await getDrizzle();
  const result = await db.execute(
    sql.raw(
      `UPDATE "${table}" SET "${column}" = COALESCE("${column}", 0) + ${delta} WHERE id = ${Number(id)} AND COALESCE("${column}", 0) + ${delta} <= "${ceilingColumn}" RETURNING "${column}"`,
    ),
  );
  const rows = (result as unknown as { rows?: Array<Record<string, number>> })?.rows;
  if (!rows || rows.length === 0) return null;
  return rows[0][column] ?? null;
}

/**
 * Atomically increment a counter only if the result stays below a max value.
 *
 * Same as atomicIncrementWithCeiling but the ceiling is a literal number,
 * not another column. Useful for discount code maxUses checks.
 *
 * Returns the new value, or null if limit was already reached.
 */
export async function atomicIncrementWithLimit(
  table: string,
  id: number | string,
  column: string,
  delta: number,
  maxValue: number,
): Promise<number | null> {
  const db = await getDrizzle();
  const result = await db.execute(
    sql.raw(
      `UPDATE "${table}" SET "${column}" = COALESCE("${column}", 0) + ${delta} WHERE id = ${Number(id)} AND COALESCE("${column}", 0) + ${delta} <= ${maxValue} RETURNING "${column}"`,
    ),
  );
  const rows = (result as unknown as { rows?: Array<Record<string, number>> })?.rows;
  if (!rows || rows.length === 0) return null;
  return rows[0][column] ?? null;
}

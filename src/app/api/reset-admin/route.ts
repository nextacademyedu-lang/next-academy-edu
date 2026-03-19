/**
 * EMERGENCY: Direct DB status check and lockout reset.
 * GET /api/reset-admin → check admin account state
 * POST /api/reset-admin → reset lockout (requires secret)
 * 
 * This uses raw SQL to bypass Payload ORM issues.
 * DELETE THIS FILE after use.
 */
import { getPayload } from 'payload';
import config from '@payload-config';
import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    // Check for secret in query params for safety
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    
    if (!secret || secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Secret required as ?secret=xxx' }, { status: 403 });
    }

    const payload = await getPayload({ config });
    const db = payload.db.drizzle;

    // Check user state with raw SQL
    const result = await db.execute(
      sql`SELECT id, email, role, "login_attempts", "lock_until", "locked_until" FROM users WHERE email = 'nextacademyedu@gmail.com' LIMIT 1` as unknown as Parameters<typeof db.execute>[0]
    );

    return NextResponse.json({
      status: 'ok',
      user: result.rows?.[0] ?? 'No user found',
      debug: {
        resultType: typeof result,
        hasRows: 'rows' in result,
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret } = body;

    if (!secret || secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
    }

    const payload = await getPayload({ config });
    const db = payload.db.drizzle;

    // Step 1: Reset lockout via raw SQL
    await db.execute(
      sql`UPDATE users SET login_attempts = 0, lock_until = NULL, locked_until = NULL WHERE email = 'nextacademyedu@gmail.com'` as unknown as Parameters<typeof db.execute>[0]
    );

    // Step 2: Check updated state
    const result = await db.execute(
      sql`SELECT id, email, role, "login_attempts", "lock_until", "locked_until" FROM users WHERE email = 'nextacademyedu@gmail.com' LIMIT 1` as unknown as Parameters<typeof db.execute>[0]
    );

    return NextResponse.json({
      success: true,
      message: 'Lockout reset. Try logging in again with your password.',
      user: result.rows?.[0] ?? 'check DB manually',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

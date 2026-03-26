/**
 * GET /api/google/callback
 *
 * Google redirects here after admin consents to Calendar API access.
 * Exchanges the code for tokens and displays the refresh token
 * so the admin can store it in GOOGLE_REFRESH_TOKEN env var.
 */
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/google-auth.ts';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  if (errorParam) {
    return NextResponse.json(
      { error: `Google authorization failed: ${errorParam}` },
      { status: 400 },
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: 'Missing authorization code' },
      { status: 400 },
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    // Return a simple page showing the refresh token
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <title>Google Calendar Connected</title>
        <style>
          body { font-family: system-ui; padding: 2rem; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; }
          .card { background: #1e293b; padding: 2rem; border-radius: 12px; }
          h1 { color: #22c55e; }
          .token-box { background: #0f172a; padding: 1rem; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 0.85rem; margin: 1rem 0; border: 1px solid #334155; }
          .warning { color: #fbbf24; font-size: 0.9rem; }
          code { background: #334155; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>✅ تم ربط Google Calendar بنجاح</h1>
          <p>أضف هذا الرمز كمتغير بيئة:</p>
          <p><code>GOOGLE_REFRESH_TOKEN</code></p>
          <div class="token-box">${tokens.refresh_token || '(no refresh token — revoke and try again)'}</div>
          <p class="warning">⚠️ انسخ هذا الرمز واحفظه — لن يظهر مرة أخرى.</p>
          <p>بعد الإضافة، أعد تشغيل السيرفر.</p>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    console.error('[google/callback] Token exchange error:', err);
    return NextResponse.json(
      { error: 'Failed to exchange code for tokens' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { reconcilePaymentsWindow } from '@/lib/payment-reconciliation';
import { sendReconciliationAlert } from '@/lib/email';

/**
 * Daily Payment Reconciliation Cron
 * GET /api/cron/reconcile-payments
 * 
 * Frequency: Every morning at 6 AM
 * Window: Checks last 48 hours for discrepancies
 */
export async function GET(req: NextRequest) {
  // ── 1. Auth check ─────────────────────────────────────
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - 48 * 60 * 60 * 1000); // 48h window

    console.log(`[cron/reconcile] Starting reconciliation from ${fromDate.toISOString()} to ${toDate.toISOString()}`);

    // ── 2. Run reconciliation ─────────────────────────────
    const result = await reconcilePaymentsWindow(fromDate, toDate);

    // ── 3. Handle mismatches ──────────────────────────────
    if (result.mismatches.length > 0) {
      console.warn(`[cron/reconcile] Found ${result.mismatches.length} mismatches. Sending alert...`);
      await sendReconciliationAlert({
        mismatches: result.mismatches,
        windowStart: fromDate.toLocaleString(),
        windowEnd: toDate.toLocaleString(),
      });
    }

    console.log(`[cron/reconcile] Done: checked=${result.checked}, matched=${result.matched}, mismatches=${result.mismatches.length}, errors=${result.errors.length}`);

    return NextResponse.json({
      success: true,
      summary: {
        checked: result.checked,
        matched: result.matched,
        mismatches: result.mismatches.length,
        errors: result.errors.length,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
    });

  } catch (err) {
    console.error('[cron/reconcile] Fatal job failure:', err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Internal Server Error' 
    }, { status: 500 });
  }
}

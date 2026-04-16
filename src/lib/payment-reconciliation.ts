import { getPayload } from 'payload';
import config from '@payload-config';

export interface PaymentMismatch {
  internalId: string;
  gatewayId: string;
  internalStatus: string;
  gatewayStatus: string;
  amount: number;
  reason: string;
}

export interface ReconciliationResult {
  checked: number;
  matched: number;
  mismatches: PaymentMismatch[];
  errors: string[];
}

/**
 * Reconciles payments within a given date window.
 * Default is last 48 hours.
 */
export async function reconcilePaymentsWindow(
  fromDate: Date,
  toDate: Date
): Promise<ReconciliationResult> {
  const payload = await getPayload({ config });
  const result: ReconciliationResult = {
    checked: 0,
    matched: 0,
    mismatches: [],
    errors: [],
  };

  try {
    // 1. Fetch payments updated/created in the window
    // We filter by paymentMethod 'paymob' as requested
    const payments = await payload.find({
      collection: 'payments',
      where: {
        paymentMethod: { equals: 'paymob' },
        and: [
          { updatedAt: { greater_than: fromDate.toISOString() } },
          { updatedAt: { less_than: toDate.toISOString() } },
        ],
      },
      limit: 500,
      overrideAccess: true,
    });

    for (const doc of payments.docs) {
      result.checked++;
      const paymentId = String(doc.id);
      const transactionId = doc.transactionId;
      const orderId = doc.paymobOrderId;

      if (!transactionId && !orderId) {
        // No way to check with gateway yet
        continue;
      }

      try {
        // 2. Fetch status from gateway
        // We prioritize transactionId if available, otherwise orderId status check
        // Using Paymob Transaction Retrieval API:
        // GET https://accept.paymob.com/api/acceptance/transactions/{id}/
        
        let gatewayStatus = 'unknown';
        let gatewaySuccess = false;
        let gatewayAmount = 0;
        let gatewayId = transactionId || orderId || '';

        if (transactionId) {
          const res = await fetch(`https://accept.paymob.com/api/acceptance/transactions/${transactionId}/`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${process.env.PAYMOB_API_KEY}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            gatewaySuccess = data.success === true || data.success === 'true';
            gatewayStatus = gatewaySuccess ? 'paid' : 'failed';
            gatewayAmount = (data.amount_cents || 0) / 100;
          } else {
            const errText = await res.text();
            throw new Error(`Paymob API error: ${res.status} ${errText}`);
          }
        } else {
          // If no transactionId but we have orderId, user might have initiated but not finished,
          // or webhook failed. In a real scenario, we'd list transactions for orderId.
          // For now, if no transactionId is found in DB, we mark as pending check unless we find it in gateway.
          continue; 
        }

        // 3. Compare statuses
        const internalPaid = doc.status === 'paid';
        const amountMatch = Math.abs(gatewayAmount - (doc.amount || 0)) < 0.01;

        if (internalPaid === gatewaySuccess && amountMatch) {
          // Matched
          await payload.update({
            collection: 'payments',
            id: paymentId,
            data: { reconciliationStatus: 'matched' } as any,
            overrideAccess: true,
          });
          result.matched++;
        } else {
          // Mismatch
          const reason = !amountMatch 
            ? `Amount mismatch: Internal ${doc.amount}, Gateway ${gatewayAmount}`
            : `Status mismatch: Internal ${doc.status}, Gateway ${gatewayStatus}`;
            
          await payload.update({
            collection: 'payments',
            id: paymentId,
            data: { reconciliationStatus: 'mismatch' } as any,
            overrideAccess: true,
          });

          
          result.mismatches.push({
            internalId: paymentId,
            gatewayId,
            internalStatus: doc.status,
            gatewayStatus,
            amount: doc.amount,
            reason,
          });
        }

        // Rate limiting grace
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[reconciliation] Error checking payment ${paymentId}:`, msg);
        result.errors.push(`Payment ${paymentId}: ${msg}`);
      }
    }

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[reconciliation] Fatal error:`, msg);
    result.errors.push(`Fatal error: ${msg}`);
  }

  return result;
}

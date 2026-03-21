export const LIFE_CYCLE_TO_CRM_STAGE: Record<string, string> = {
  lead: 'lead',
  prospect: 'prospect',
  customer: 'customer',
  repeat: 'repeat_customer',
};

export const BOOKING_STATUS_TO_DEAL_STAGE: Record<string, string> = {
  reserved: 'pending_payment',
  pending: 'pending_payment',
  confirmed: 'paid',
  completed: 'completed',
  cancelled: 'lost',
  refunded: 'refunded',
  payment_failed: 'payment_failed',
  cancelled_overdue: 'lost_overdue',
};

export const PAYMENT_STATUS_TO_DEAL_STAGE: Record<string, string> = {
  pending: 'pending_payment',
  paid: 'paid',
  overdue: 'at_risk_overdue',
  failed: 'payment_failed',
  refunded: 'refunded',
};

export const CONSULTATION_STATUS_TO_DEAL_STAGE: Record<string, string> = {
  pending: 'pending_payment',
  confirmed: 'paid',
  completed: 'completed',
  cancelled: 'lost',
  no_show: 'lost_no_show',
};

export function mapLifecycleStage(stage: string | null | undefined): string {
  if (!stage) return 'lead';
  return LIFE_CYCLE_TO_CRM_STAGE[stage] ?? 'lead';
}

export function mapBookingStatusToDealStage(status: string | null | undefined): string {
  if (!status) return 'pending_payment';
  return BOOKING_STATUS_TO_DEAL_STAGE[status] ?? 'pending_payment';
}

export function mapPaymentStatusToDealStage(status: string | null | undefined): string {
  if (!status) return 'pending_payment';
  return PAYMENT_STATUS_TO_DEAL_STAGE[status] ?? 'pending_payment';
}

export function mapConsultationStatusToDealStage(
  status: string | null | undefined,
  paymentStatus?: string | null,
): string {
  if (paymentStatus === 'paid') return 'paid';
  if (paymentStatus === 'refunded') return 'refunded';
  if (!status) return 'pending_payment';
  return CONSULTATION_STATUS_TO_DEAL_STAGE[status] ?? 'pending_payment';
}


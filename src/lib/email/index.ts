/**
 * Barrel re-export — preserves `@/lib/email` import path.
 *
 * 37 template functions + 2 legacy aliases (39 total).
 */

// ── Core utilities (not re-exported — internal only) ─────────────────────────
// email-core.ts exports: send, buildEmailLayout, greeting, APP_URL, Locale, etc.

// ── Template modules ─────────────────────────────────────────────────────────

export {
  sendOtpVerificationCode,
  sendWelcome,
  sendEmailVerification,
  sendPasswordReset,
  sendAccountDeletionConfirm,
  sendAccountDeleted,
  sendEmailChanged,
  sendSecurityAlert,
} from './auth-emails';

export {
  sendBookingConfirmation,
  sendBookingCancelled,
  sendRoundCancelled,
  sendReviewRequest,
  sendReviewReminder,
  sendWaitlistSpotAvailable,
  sendCertificateReady,
  sendRoundReminder3d,
  sendRoundReminder1d,
} from './booking-emails';

export {
  sendPaymentReceipt,
  sendInstallmentRequestReceived,
  sendInstallmentApproved,
  sendInstallmentRejected,
  sendPaymentReminder,
  sendPaymentOverdue,
  sendRefundApproved,
  sendRefundRejected,
  sendInstallmentApprovalExpiring,
} from './payment-emails';

export {
  sendConsultationConfirmed,
  sendConsultationReminder24h,
  sendConsultationReminder1h,
  sendConsultationCancelled,
  sendInactiveUser,
  sendNewProgramAnnouncement,
} from './engagement-emails';

export {
  sendInstructorOnboardingSubmitted,
  sendInstructorProfileApproved,
  sendInstructorProfileRejected,
  sendInstructorProgramApproved,
  sendInstructorProgramRejected,
} from './instructor-emails';

// ── Legacy aliases (backward compatibility) ──────────────────────────────────

import { sendWaitlistSpotAvailable } from './booking-emails';
import { sendPaymentOverdue } from './payment-emails';

/** @deprecated Use sendWaitlistSpotAvailable instead */
export async function sendWaitlistNotification(data: {
  to: string;
  userName: string;
  programTitle: string;
  roundId: string;
  expiresAt: string;
}): Promise<void> {
  return sendWaitlistSpotAvailable(data);
}

/** @deprecated Use sendPaymentOverdue instead */
export async function sendOverdueNotification(data: {
  to: string;
  userName: string;
  programTitle: string;
  amount: number;
  bookingId: string;
}): Promise<void> {
  return sendPaymentOverdue(data);
}

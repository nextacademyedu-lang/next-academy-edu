/**
 * Typed bilingual dictionary for all email templates.
 *
 * Every template group is keyed by function name (minus "send" prefix).
 * Dynamic strings use arrow-function interpolation.
 */

// ─── String shape per template ───────────────────────────────────────────────

export interface EmailStrings {
  /** Shared */
  greeting: (name: string) => string;
  footer: string;
  unsubscribe: string;
  allRightsReserved: string;
  currency: string;

  /** Auth — 7 templates */
  welcome: {
    subject: string;
    title: string;
    body: string;
    cta: string;
  };
  emailVerification: {
    subject: string;
    title: string;
    body: string;
    cta: string;
    expiry: string;
  };
  passwordReset: {
    subject: string;
    title: string;
    body: string;
    cta: string;
    expiry: string;
    ignore: string;
  };
  accountDeletionConfirm: {
    subject: string;
    title: string;
    body: string;
    cta: string;
    warning: string;
    ignore: string;
  };
  accountDeleted: {
    subject: string;
    title: string;
    body: string;
    contact: string;
    cta: string;
  };
  emailChanged: {
    subject: string;
    title: string;
    body: (newEmail: string) => string;
    notYou: string;
    cta: string;
  };
  securityAlert: {
    subject: string;
    title: string;
    body: string;
    details: string;
    notYou: string;
    cta: string;
    labelAction: string;
    labelDevice: string;
    labelIp: string;
    labelTime: string;
  };

  /** Booking — 9 templates */
  bookingConfirmation: {
    subject: (program: string) => string;
    title: string;
    body: string;
    cta: string;
    labelProgram: string;
    labelBookingCode: string;
    labelAmountPaid: string;
    labelStartDate: string;
  };
  bookingCancelled: {
    subject: (program: string) => string;
    title: string;
    body: (program: string) => string;
    labelReason: string;
    cta: string;
    labelProgram: string;
    labelBookingCode: string;
  };
  roundCancelled: {
    subject: (program: string) => string;
    title: string;
    body: (program: string, date: string) => string;
    alternatives: string;
    cta: string;
  };
  reviewRequest: {
    subject: (program: string) => string;
    title: string;
    body: (program: string) => string;
    cta: string;
  };
  reviewReminder: {
    subject: (program: string) => string;
    title: string;
    body: (program: string) => string;
    cta: string;
  };
  waitlistSpotAvailable: {
    subject: (program: string) => string;
    title: string;
    body: (program: string) => string;
    alert: string;
    cta: string;
    labelProgram: string;
    labelExpires: string;
  };
  certificateReady: {
    subject: (program: string) => string;
    title: string;
    body: (program: string) => string;
    cta: string;
  };
  roundReminder3d: {
    subject: (program: string) => string;
    title: string;
    body: (program: string, date: string) => string;
    cta: string;
  };
  roundReminder1d: {
    subject: (program: string) => string;
    title: string;
    body: (program: string) => string;
    cta: string;
  };

  /** Payment — 9 templates */
  paymentReceipt: {
    subject: (amount: number) => string;
    title: string;
    body: string;
    labelProgram: string;
    labelAmount: string;
    labelPaymentMethod: string;
    labelTransactionId: string;
  };
  installmentRequestReceived: {
    subject: string;
    title: string;
    body: (program: string) => string;
    labelProgram: string;
  };
  installmentApproved: {
    subject: string;
    title: string;
    body: (program: string) => string;
    cta: string;
  };
  installmentRejected: {
    subject: string;
    title: string;
    body: (program: string) => string;
    labelReason: string;
    fullPayNote: string;
    cta: string;
  };
  paymentReminder: {
    subject: string;
    title: string;
    body: string;
    cta: string;
    labelProgram: string;
    labelAmountDue: string;
    labelDueDate: string;
  };
  paymentOverdue: {
    subject: string;
    title: string;
    body: string;
    alert: string;
    cta: string;
    labelProgram: string;
    labelOverdueAmount: string;
  };
  refundApproved: {
    subject: string;
    title: string;
    body: (amount: number, currency: string, program: string) => string;
    transfer: string;
    labelProgram: string;
    labelRefundAmount: string;
  };
  refundRejected: {
    subject: string;
    title: string;
    body: (program: string) => string;
    labelReason: string;
    cta: string;
  };
  installmentApprovalExpiring: {
    subject: string;
    title: string;
    body: (program: string) => string;
    alert: string;
    cta: string;
  };

  /** Engagement — 6 templates */
  consultationConfirmed: {
    subject: (instructor: string) => string;
    title: string;
    body: (instructor: string) => string;
    cta: string;
    labelConsultant: string;
    labelDate: string;
    labelTime: string;
    labelDuration: string;
  };
  consultationReminder24h: {
    subject: (time: string) => string;
    title: string;
    body: (instructor: string, time: string) => string;
    cta: string;
  };
  consultationReminder1h: {
    subject: string;
    title: string;
    body: string;
    cta: string;
  };
  consultationCancelled: {
    subject: string;
    title: string;
    body: (instructor: string, date: string) => string;
    labelReason: string;
    cta: string;
  };
  inactiveUser: {
    subject: string;
    title: string;
    body: string;
    cta: string;
  };
  newProgramAnnouncement: {
    subject: (program: string) => string;
    title: (program: string) => string;
    body: (program: string) => string;
    cta: string;
  };
}

// ─── Arabic strings ──────────────────────────────────────────────────────────

const ar: EmailStrings = {
  greeting: (name) => `أهلاً ${name} 👋`,
  footer: 'مع أطيب التحيات،\nفريق نيكست أكاديمي',
  unsubscribe: 'إلغاء الاشتراك',
  allRightsReserved: '© جميع الحقوق محفوظة — نيكست أكاديمي',
  currency: 'ج.م',

  // Auth
  welcome: {
    subject: '🎉 أهلاً بك في نيكست أكاديمي!',
    title: 'مرحباً بك في نيكست أكاديمي! 🎉',
    body: 'يسعدنا انضمامك لنا. استكشف البرامج المتاحة وابدأ رحلة التعلم الخاصة بك.',
    cta: 'تصفح البرامج',
  },
  emailVerification: {
    subject: '📧 تأكيد البريد الإلكتروني',
    title: 'تأكيد بريدك الإلكتروني 📧',
    body: 'اضغط على الزر لتأكيد بريدك الإلكتروني. الرابط صالح لمدة 24 ساعة.',
    cta: 'تأكيد البريد',
    expiry: 'الرابط صالح لمدة 24 ساعة فقط.',
  },
  passwordReset: {
    subject: '🔑 إعادة تعيين كلمة المرور',
    title: 'إعادة تعيين كلمة المرور 🔑',
    body: 'طلبت إعادة تعيين كلمة المرور. اضغط على الزر.',
    cta: 'إعادة تعيين كلمة المرور',
    expiry: 'الرابط صالح لمدة ساعة واحدة فقط.',
    ignore: 'لم تطلب هذا؟ تجاهل هذا الإيميل.',
  },
  accountDeletionConfirm: {
    subject: '⚠️ تأكيد حذف الحساب',
    title: 'تأكيد حذف الحساب ⚠️',
    body: 'طلبت حذف حسابك. اضغط على الزر للتأكيد.',
    cta: 'تأكيد الحذف',
    warning: 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.',
    ignore: 'لم تطلب هذا؟ تجاهل هذا الإيميل — حسابك آمن.',
  },
  accountDeleted: {
    subject: '✅ تم حذف حسابك',
    title: 'تم حذف حسابك',
    body: 'تم حذف حسابك في نيكست أكاديمي بنجاح. سنفتقدك!',
    contact: 'لو عندك أي استفسار، تواصل معنا.',
    cta: 'تواصل معنا',
  },
  emailChanged: {
    subject: '📧 تم تغيير البريد الإلكتروني',
    title: 'تم تغيير بريدك الإلكتروني',
    body: (newEmail) => `تم تغيير البريد الإلكتروني الخاص بحسابك إلى ${newEmail}.`,
    notYou: 'لو مش أنت اللي عملت ده، تواصل معنا فوراً.',
    cta: 'تواصل معنا',
  },
  securityAlert: {
    subject: '🔒 تنبيه أمني — نشاط غير معتاد',
    title: 'تنبيه أمني 🔒',
    body: 'لاحظنا نشاط غير معتاد على حسابك.',
    details: 'تفاصيل النشاط:',
    notYou: 'لو مش أنت، غيّر كلمة سرك فوراً.',
    cta: 'تأمين الحساب',
    labelAction: 'النشاط',
    labelDevice: 'الجهاز',
    labelIp: 'عنوان IP',
    labelTime: 'الوقت',
  },

  // Booking
  bookingConfirmation: {
    subject: (p) => `✅ تم تأكيد حجزك — ${p}`,
    title: 'تم تأكيد حجزك! 🎉',
    body: 'يسعدنا إخبارك بأن حجزك تم تأكيده بنجاح.',
    cta: 'عرض تفاصيل الحجز',
    labelProgram: 'البرنامج',
    labelBookingCode: 'رقم الحجز',
    labelAmountPaid: 'المبلغ المدفوع',
    labelStartDate: 'تاريخ البدء',
  },
  bookingCancelled: {
    subject: (p) => `❌ تم إلغاء حجزك — ${p}`,
    title: 'تم إلغاء الحجز',
    body: (p) => `تم إلغاء حجزك في ${p}.`,
    labelReason: 'السبب',
    cta: 'تصفح البرامج',
    labelProgram: 'البرنامج',
    labelBookingCode: 'رقم الحجز',
  },
  roundCancelled: {
    subject: (p) => `❌ للأسف الجولة اتلغت — ${p}`,
    title: 'تم إلغاء الجولة',
    body: (p, d) => `نعتذر عن إلغاء الجولة الخاصة ببرنامج ${p} المقررة يوم ${d}.`,
    alternatives: 'سنتواصل معك بخصوص البدائل المتاحة.',
    cta: 'تصفح البرامج',
  },
  reviewRequest: {
    subject: (p) => `⭐ قيّم تجربتك في ${p}`,
    title: 'رأيك يهمنا! ⭐',
    body: (p) => `خلصت برنامج ${p}! عاملك إيه؟ شاركنا رأيك.`,
    cta: 'قيّم الآن',
  },
  reviewReminder: {
    subject: (p) => `⭐ رأيك يهمنا — قيّم ${p}`,
    title: 'لسه منتظرين رأيك ⭐',
    body: (p) => `رأيك في ${p} يساعد طلاب تانيين يختاروا. خد دقيقة وشاركنا.`,
    cta: 'قيّم الآن',
  },
  waitlistSpotAvailable: {
    subject: (p) => `🎉 مكان متاح في ${p}!`,
    title: 'مكان متاح الآن! 🎉',
    body: (p) => `أصبح متاحاً مكان في ${p} الذي كنت تنتظره.`,
    alert: 'هذا العرض محدود — احجز مكانك قبل انتهاء المهلة',
    cta: 'احجز الآن',
    labelProgram: 'البرنامج',
    labelExpires: 'ينتهي العرض',
  },
  certificateReady: {
    subject: (p) => `🎓 شهادتك جاهزة! — ${p}`,
    title: 'مبروك! شهادتك جاهزة 🎓',
    body: (p) => `مبروك على إتمام برنامج ${p}! شهادتك جاهزة للتحميل.`,
    cta: 'حمّل الشهادة',
  },
  roundReminder3d: {
    subject: (p) => `📅 الجولة بتبدأ بعد 3 أيام — ${p}`,
    title: 'الجولة بتبدأ قريب! 📅',
    body: (p, d) => `جولة ${p} بتبدأ يوم ${d}. جهز نفسك!`,
    cta: 'عرض التفاصيل',
  },
  roundReminder1d: {
    subject: (p) => `📅 بكرة! جهز نفسك لـ ${p}`,
    title: 'بكرة بتبدأ! 🚀',
    body: (p) => `بكرة! ${p} بيبدأ. جهز نفسك! 💪`,
    cta: 'عرض التفاصيل',
  },

  // Payment
  paymentReceipt: {
    subject: (a) => `إيصال الدفع — ${a} ج.م`,
    title: 'إيصال الدفع',
    body: 'تم استلام دفعتك بنجاح.',
    labelProgram: 'البرنامج',
    labelAmount: 'المبلغ',
    labelPaymentMethod: 'طريقة الدفع',
    labelTransactionId: 'رقم العملية',
  },
  installmentRequestReceived: {
    subject: 'تم استلام طلب التقسيط',
    title: 'تم استلام طلبك',
    body: (p) => `تم استلام طلب التقسيط الخاص ببرنامج ${p}. سنراجعه ونرد عليك خلال 48 ساعة.`,
    labelProgram: 'البرنامج',
  },
  installmentApproved: {
    subject: '✅ تم الموافقة على طلب التقسيط',
    title: 'تم الموافقة! ✅',
    body: (p) => `تمت الموافقة على طلب التقسيط الخاص ببرنامج ${p}. أكمل الحجز خلال 7 أيام.`,
    cta: 'أكمل الحجز',
  },
  installmentRejected: {
    subject: '❌ لم يتم قبول طلب التقسيط',
    title: 'لم يتم قبول الطلب',
    body: (p) => `نعتذر، لم يتم قبول طلب التقسيط الخاص ببرنامج ${p}.`,
    labelReason: 'السبب',
    fullPayNote: 'يمكنك الدفع الكامل أو التواصل معنا للمساعدة.',
    cta: 'تواصل معنا',
  },
  paymentReminder: {
    subject: '⏰ تذكير: قسط مستحق بعد 3 أيام',
    title: 'تذكير بموعد القسط',
    body: 'نذكرك بأن موعد سداد القسط القادم اقترب.',
    cta: 'ادفع الآن',
    labelProgram: 'البرنامج',
    labelAmountDue: 'المبلغ المستحق',
    labelDueDate: 'تاريخ الاستحقاق',
  },
  paymentOverdue: {
    subject: '⚠️ قسط متأخر — ادفع دلوقتي',
    title: 'قسط متأخر السداد',
    body: 'لديك قسط متأخر السداد. يرجى السداد في أقرب وقت لتجنب تعليق الوصول للبرنامج.',
    alert: 'قد يتم تعليق وصولك للبرنامج في حالة عدم السداد',
    cta: 'سدد الآن',
    labelProgram: 'البرنامج',
    labelOverdueAmount: 'المبلغ المتأخر',
  },
  refundApproved: {
    subject: '✅ تم الموافقة على طلب الاسترداد',
    title: 'تم الموافقة على الاسترداد ✅',
    body: (a, c, p) => `تمت الموافقة على طلب استرداد مبلغ ${a} ${c} الخاص ببرنامج ${p}.`,
    transfer: 'سيتم تحويل المبلغ خلال 5-10 أيام عمل.',
    labelProgram: 'البرنامج',
    labelRefundAmount: 'مبلغ الاسترداد',
  },
  refundRejected: {
    subject: '❌ تم رفض طلب الاسترداد',
    title: 'تم رفض طلب الاسترداد',
    body: (p) => `لم يتم قبول طلب الاسترداد الخاص ببرنامج ${p}.`,
    labelReason: 'السبب',
    cta: 'تواصل معنا',
  },
  installmentApprovalExpiring: {
    subject: '⏰ موافقة التقسيط بتنتهي بعد يومين!',
    title: 'موافقة التقسيط بتنتهي قريب ⏰',
    body: (p) => `موافقة التقسيط الخاصة ببرنامج ${p} بتنتهي بعد يومين. أكمل الحجز قبل ما تنتهي.`,
    alert: 'الموافقة ستنتهي خلال 48 ساعة',
    cta: 'أكمل الحجز',
  },

  // Engagement
  consultationConfirmed: {
    subject: (n) => `✅ تم حجز الاستشارة — ${n}`,
    title: 'تم تأكيد الاستشارة! ✅',
    body: (n) => `تم حجز استشارتك مع ${n}.`,
    cta: 'رابط الاجتماع',
    labelConsultant: 'المستشار',
    labelDate: 'التاريخ',
    labelTime: 'الوقت',
    labelDuration: 'المدة',
  },
  consultationReminder24h: {
    subject: (t) => `⏰ استشارتك بكرة الساعة ${t}`,
    title: 'تذكير: استشارتك بكرة',
    body: (n, t) => `تذكير بأن استشارتك مع ${n} بكرة الساعة ${t}.`,
    cta: 'رابط الاجتماع',
  },
  consultationReminder1h: {
    subject: '🔔 استشارتك بعد ساعة!',
    title: 'استشارتك بعد ساعة! 🔔',
    body: 'جهز نفسك! استشارتك بتبدأ بعد ساعة.',
    cta: 'ادخل الآن',
  },
  consultationCancelled: {
    subject: '❌ تم إلغاء الاستشارة',
    title: 'تم إلغاء الاستشارة',
    body: (n, d) => `تم إلغاء استشارتك مع ${n} المقررة يوم ${d}.`,
    labelReason: 'السبب',
    cta: 'احجز موعد جديد',
  },
  inactiveUser: {
    subject: '🔔 وحشتنا! شوف البرامج الجديدة',
    title: 'وحشتنا! 🔔',
    body: 'مر وقت من آخر زيارة ليك. عندنا برامج جديدة ممكن تعجبك!',
    cta: 'تصفح البرامج',
  },
  newProgramAnnouncement: {
    subject: (p) => `🆕 برنامج جديد: ${p}`,
    title: (p) => `برنامج جديد: ${p} 🆕`,
    body: (p) => `عندنا برنامج جديد: ${p}!`,
    cta: 'اعرف أكتر',
  },
};

// ─── English strings ─────────────────────────────────────────────────────────

const en: EmailStrings = {
  greeting: (name) => `Hi ${name} 👋`,
  footer: 'Best regards,\nNext Academy Team',
  unsubscribe: 'Unsubscribe',
  allRightsReserved: '© All rights reserved — Next Academy',
  currency: 'EGP',

  // Auth
  welcome: {
    subject: '🎉 Welcome to Next Academy!',
    title: 'Welcome to Next Academy! 🎉',
    body: "We're thrilled to have you on board. Explore our programs and start your learning journey.",
    cta: 'Browse Programs',
  },
  emailVerification: {
    subject: '📧 Verify Your Email',
    title: 'Verify Your Email 📧',
    body: 'Click the button below to verify your email address. The link is valid for 24 hours.',
    cta: 'Verify Email',
    expiry: 'This link is valid for 24 hours only.',
  },
  passwordReset: {
    subject: '🔑 Reset Your Password',
    title: 'Reset Your Password 🔑',
    body: 'You requested a password reset. Click the button below.',
    cta: 'Reset Password',
    expiry: 'This link is valid for 1 hour only.',
    ignore: "Didn't request this? Ignore this email.",
  },
  accountDeletionConfirm: {
    subject: '⚠️ Confirm Account Deletion',
    title: 'Confirm Account Deletion ⚠️',
    body: 'You requested to delete your account. Click the button to confirm.',
    cta: 'Confirm Deletion',
    warning: 'This action is irreversible. All your data will be permanently deleted.',
    ignore: "Didn't request this? Ignore this email — your account is safe.",
  },
  accountDeleted: {
    subject: '✅ Your Account Has Been Deleted',
    title: 'Account Deleted',
    body: 'Your Next Academy account has been successfully deleted. We will miss you!',
    contact: 'If you have any questions, feel free to contact us.',
    cta: 'Contact Us',
  },
  emailChanged: {
    subject: '📧 Email Address Changed',
    title: 'Email Address Changed',
    body: (newEmail) => `Your account email has been changed to ${newEmail}.`,
    notYou: "If this wasn't you, contact us immediately.",
    cta: 'Contact Us',
  },
  securityAlert: {
    subject: '🔒 Security Alert — Unusual Activity',
    title: 'Security Alert 🔒',
    body: 'We noticed unusual activity on your account.',
    details: 'Activity details:',
    notYou: "If this wasn't you, change your password immediately.",
    cta: 'Secure Account',
    labelAction: 'Action',
    labelDevice: 'Device',
    labelIp: 'IP Address',
    labelTime: 'Time',
  },

  // Booking
  bookingConfirmation: {
    subject: (p) => `✅ Booking Confirmed — ${p}`,
    title: 'Booking Confirmed! 🎉',
    body: "We're happy to let you know your booking has been confirmed.",
    cta: 'View Booking Details',
    labelProgram: 'Program',
    labelBookingCode: 'Booking Code',
    labelAmountPaid: 'Amount Paid',
    labelStartDate: 'Start Date',
  },
  bookingCancelled: {
    subject: (p) => `❌ Booking Cancelled — ${p}`,
    title: 'Booking Cancelled',
    body: (p) => `Your booking for ${p} has been cancelled.`,
    labelReason: 'Reason',
    cta: 'Browse Programs',
    labelProgram: 'Program',
    labelBookingCode: 'Booking Code',
  },
  roundCancelled: {
    subject: (p) => `❌ Round Cancelled — ${p}`,
    title: 'Round Cancelled',
    body: (p, d) => `We're sorry to inform you that the round for ${p} scheduled on ${d} has been cancelled.`,
    alternatives: 'We will contact you about available alternatives.',
    cta: 'Browse Programs',
  },
  reviewRequest: {
    subject: (p) => `⭐ Rate Your Experience with ${p}`,
    title: 'Your Feedback Matters! ⭐',
    body: (p) => `You've completed ${p}! How was your experience? Share your feedback.`,
    cta: 'Rate Now',
  },
  reviewReminder: {
    subject: (p) => `⭐ We'd Love Your Feedback — Rate ${p}`,
    title: 'Still Waiting for Your Review ⭐',
    body: (p) => `Your review of ${p} helps other students decide. Take a minute to share.`,
    cta: 'Rate Now',
  },
  waitlistSpotAvailable: {
    subject: (p) => `🎉 Spot Available in ${p}!`,
    title: 'Spot Available Now! 🎉',
    body: (p) => `A spot has opened up in ${p} that you were waiting for.`,
    alert: 'This offer is limited — book your spot before it expires',
    cta: 'Book Now',
    labelProgram: 'Program',
    labelExpires: 'Offer Expires',
  },
  certificateReady: {
    subject: (p) => `🎓 Your Certificate is Ready! — ${p}`,
    title: 'Congratulations! Your Certificate is Ready 🎓',
    body: (p) => `Congratulations on completing ${p}! Your certificate is ready to download.`,
    cta: 'Download Certificate',
  },
  roundReminder3d: {
    subject: (p) => `📅 Round Starts in 3 Days — ${p}`,
    title: 'Round Starting Soon! 📅',
    body: (p, d) => `The ${p} round starts on ${d}. Get ready!`,
    cta: 'View Details',
  },
  roundReminder1d: {
    subject: (p) => `📅 Tomorrow! Get Ready for ${p}`,
    title: 'Starting Tomorrow! 🚀',
    body: (p) => `Tomorrow! ${p} begins. Get ready! 💪`,
    cta: 'View Details',
  },

  // Payment
  paymentReceipt: {
    subject: (a) => `Payment Receipt — EGP ${a}`,
    title: 'Payment Receipt',
    body: 'Your payment has been received successfully.',
    labelProgram: 'Program',
    labelAmount: 'Amount',
    labelPaymentMethod: 'Payment Method',
    labelTransactionId: 'Transaction ID',
  },
  installmentRequestReceived: {
    subject: 'Installment Request Received',
    title: 'Request Received',
    body: (p) => `Your installment request for ${p} has been received. We'll review it and respond within 48 hours.`,
    labelProgram: 'Program',
  },
  installmentApproved: {
    subject: '✅ Installment Request Approved',
    title: 'Approved! ✅',
    body: (p) => `Your installment request for ${p} has been approved. Complete your booking within 7 days.`,
    cta: 'Complete Booking',
  },
  installmentRejected: {
    subject: '❌ Installment Request Rejected',
    title: 'Request Not Approved',
    body: (p) => `We're sorry, your installment request for ${p} was not approved.`,
    labelReason: 'Reason',
    fullPayNote: 'You can pay in full or contact us for assistance.',
    cta: 'Contact Us',
  },
  paymentReminder: {
    subject: '⏰ Payment Reminder: Installment Due in 3 Days',
    title: 'Installment Reminder',
    body: 'This is a reminder that your next installment is due soon.',
    cta: 'Pay Now',
    labelProgram: 'Program',
    labelAmountDue: 'Amount Due',
    labelDueDate: 'Due Date',
  },
  paymentOverdue: {
    subject: '⚠️ Overdue Installment — Pay Now',
    title: 'Overdue Installment',
    body: 'You have an overdue installment. Please pay as soon as possible to avoid having your program access suspended.',
    alert: 'Your program access may be suspended if payment is not received',
    cta: 'Pay Now',
    labelProgram: 'Program',
    labelOverdueAmount: 'Overdue Amount',
  },
  refundApproved: {
    subject: '✅ Refund Request Approved',
    title: 'Refund Approved ✅',
    body: (a, c, p) => `Your refund request of ${c} ${a} for ${p} has been approved.`,
    transfer: 'The amount will be transferred within 5-10 business days.',
    labelProgram: 'Program',
    labelRefundAmount: 'Refund Amount',
  },
  refundRejected: {
    subject: '❌ Refund Request Rejected',
    title: 'Refund Request Rejected',
    body: (p) => `Your refund request for ${p} was not approved.`,
    labelReason: 'Reason',
    cta: 'Contact Us',
  },
  installmentApprovalExpiring: {
    subject: '⏰ Installment Approval Expiring in 2 Days!',
    title: 'Approval Expiring Soon ⏰',
    body: (p) => `Your installment approval for ${p} expires in 2 days. Complete your booking before it expires.`,
    alert: 'Approval will expire in 48 hours',
    cta: 'Complete Booking',
  },

  // Engagement
  consultationConfirmed: {
    subject: (n) => `✅ Consultation Confirmed — ${n}`,
    title: 'Consultation Confirmed! ✅',
    body: (n) => `Your consultation with ${n} has been confirmed.`,
    cta: 'Join Meeting',
    labelConsultant: 'Consultant',
    labelDate: 'Date',
    labelTime: 'Time',
    labelDuration: 'Duration',
  },
  consultationReminder24h: {
    subject: (t) => `⏰ Your Consultation is Tomorrow at ${t}`,
    title: 'Reminder: Consultation Tomorrow',
    body: (n, t) => `Reminder: your consultation with ${n} is tomorrow at ${t}.`,
    cta: 'Meeting Link',
  },
  consultationReminder1h: {
    subject: '🔔 Consultation in 1 Hour!',
    title: 'Consultation in 1 Hour! 🔔',
    body: 'Get ready! Your consultation starts in 1 hour.',
    cta: 'Join Now',
  },
  consultationCancelled: {
    subject: '❌ Consultation Cancelled',
    title: 'Consultation Cancelled',
    body: (n, d) => `Your consultation with ${n} on ${d} has been cancelled.`,
    labelReason: 'Reason',
    cta: 'Book New Consultation',
  },
  inactiveUser: {
    subject: '🔔 We Miss You!',
    title: 'We Miss You! 🔔',
    body: "It's been a while since your last visit. We have new programs you might like!",
    cta: 'Browse Programs',
  },
  newProgramAnnouncement: {
    subject: (p) => `🆕 New Program: ${p}`,
    title: (p) => `New: ${p} 🆕`,
    body: (p) => `We have a new program: ${p}!`,
    cta: 'Learn More',
  },
};

// ─── Public API ──────────────────────────────────────────────────────────────

export const emailDictionary = { ar, en } as const;

export type Locale = keyof typeof emailDictionary;

/** Get all strings for a locale */
export function t(locale: Locale): EmailStrings {
  return emailDictionary[locale];
}

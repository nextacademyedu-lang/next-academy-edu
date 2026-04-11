import type React from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';
import { Award, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  params: Promise<{ code: string; locale: string }>;
}

export default async function CertificateVerifyPage({ params }: Props) {
  const { code, locale } = await params;
  const isAr = locale === 'ar';

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'certificates',
    where: { certificateCode: { equals: code } },
    depth: 2,
    limit: 1,
  });

  const cert = result.docs[0];
  const dateLocale = isAr ? 'ar-EG' : 'en-US';
  const labels = {
    invalidTitle: isAr ? 'شهادة غير صالحة' : 'Invalid Certificate',
    invalidMessage: isAr ? 'لم يتم العثور على شهادة بهذا الرمز.' : 'No certificate was found for this code.',
    verified: isAr ? 'شهادة موثقة ✓' : 'Verified Certificate ✓',
    completion: isAr ? 'شهادة إتمام' : 'Certificate Of Completion',
    awardedTo: isAr ? 'تُقدَّم هذه الشهادة إلى' : 'This certificate is awarded to',
    completedProgram: isAr ? 'لإتمامه/ها بنجاح برنامج' : 'for successfully completing',
    traineeFallback: isAr ? 'المتدرب' : 'Learner',
    programFallback: isAr ? 'البرنامج' : 'Program',
    score: isAr ? 'الدرجة' : 'Score',
    issuedAt: isAr ? 'تاريخ الإصدار' : 'Issued at',
    verificationCode: isAr ? 'رمز التحقق' : 'Verification code',
  };

  if (!cert) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, direction: isAr ? 'rtl' : 'ltr', textAlign: 'center' }}>
          <XCircle size={64} color="#C51B1B" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ ...styles.title, color: '#C51B1B' }}>{labels.invalidTitle}</h1>
          <p style={styles.subtitle}>{labels.invalidMessage}</p>
          <code style={styles.code}>{code}</code>
        </div>
      </div>
    );
  }

  const user = cert.user as any;
  const program = cert.program as any;
  const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || labels.traineeFallback;
  const programTitle = isAr
    ? program?.titleAr || program?.titleEn || labels.programFallback
    : program?.titleEn || program?.titleAr || labels.programFallback;
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={styles.container}>
      <div style={{ ...styles.card, direction: isAr ? 'rtl' : 'ltr', textAlign: 'center' }}>
        <Award size={64} color="#D6A32B" style={{ margin: '0 auto 16px' }} />
        <CheckCircle size={28} color="#00e397" style={{ margin: '0 auto 8px' }} />
        <p style={{ color: '#00e397', fontWeight: 600, marginBottom: '24px' }}>{labels.verified}</p>

        <h1 style={styles.title}>{labels.completion}</h1>
        <p style={styles.subtitle}>{labels.awardedTo}</p>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#D6A32B', margin: '8px 0 24px' }}>
          {userName}
        </h2>

        <p style={styles.subtitle}>{labels.completedProgram}</p>
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary, #fff)', margin: '8px 0 24px' }}>
          {programTitle}
        </h3>

        {cert.quizScore != null && (
          <div style={styles.badge}>
            <span>{labels.score}: {cert.quizScore}%</span>
          </div>
        )}

        <div style={styles.divider} />

        <div style={styles.meta}>
          <span>{labels.issuedAt}: {issuedDate}</span>
          <span>{labels.verificationCode}:</span>
          <code style={styles.code}>{cert.certificateCode}</code>
        </div>

        <p style={{ color: '#888', fontSize: '12px', marginTop: '24px' }}>
          Next Academy — nextacademyedu.com
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: '#0a0a0a',
  },
  card: {
    maxWidth: '520px',
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(214,163,43,0.3)',
    borderRadius: '16px',
    padding: '48px 32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#888',
    fontSize: '15px',
    marginBottom: '4px',
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(0,227,151,0.1)',
    border: '1px solid rgba(0,227,151,0.3)',
    borderRadius: '20px',
    padding: '6px 16px',
    color: '#00e397',
    fontSize: '14px',
    marginBottom: '24px',
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.08)',
    margin: '24px 0',
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    color: '#888',
    fontSize: '13px',
  },
  code: {
    fontFamily: 'monospace',
    background: 'rgba(255,255,255,0.06)',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#D6A32B',
    letterSpacing: '2px',
  },
};

import { getPayload } from 'payload';
import config from '@payload-config';
import { CheckCircle, XCircle, Award } from 'lucide-react';

interface Props {
  params: Promise<{ code: string; locale: string }>;
}

export default async function CertificateVerifyPage({ params }: Props) {
  const { code } = await params;

  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: 'certificates',
    where: { certificateCode: { equals: code } },
    depth: 2,
    limit: 1,
  });

  const cert = result.docs[0];

  if (!cert) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <XCircle size={64} color="#C51B1B" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ ...styles.title, color: '#C51B1B' }}>شهادة غير صالحة</h1>
          <p style={styles.subtitle}>لم يتم العثور على شهادة بهذا الرمز.</p>
          <code style={styles.code}>{code}</code>
        </div>
      </div>
    );
  }

  const user = cert.user as any;
  const program = cert.program as any;
  const round = cert.round as any;
  const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'المتدرب';
  const programTitle = program?.titleAr || program?.titleEn || 'البرنامج';
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <Award size={64} color="#D6A32B" style={{ margin: '0 auto 16px' }} />
        <CheckCircle size={28} color="#00e397" style={{ margin: '0 auto 8px' }} />
        <p style={{ color: '#00e397', fontWeight: 600, marginBottom: '24px' }}>شهادة موثقة ✓</p>

        <h1 style={styles.title}>شهادة إتمام</h1>
        <p style={styles.subtitle}>تُقدَّم هذه الشهادة إلى</p>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#D6A32B', margin: '8px 0 24px' }}>
          {userName}
        </h2>

        <p style={styles.subtitle}>لإتمامه/ها بنجاح برنامج</p>
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary, #fff)', margin: '8px 0 24px' }}>
          {programTitle}
        </h3>

        {cert.quizScore != null && (
          <div style={styles.badge}>
            <span>الدرجة: {cert.quizScore}%</span>
          </div>
        )}

        <div style={styles.divider} />

        <div style={styles.meta}>
          <span>تاريخ الإصدار: {issuedDate}</span>
          <span>رمز التحقق:</span>
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
    textAlign: 'center',
    direction: 'rtl',
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

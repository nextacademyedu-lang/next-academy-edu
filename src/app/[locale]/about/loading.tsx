export default function AboutLoading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main, #020504)',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid var(--glass-border, rgba(255,255,255,0.06))',
        borderTop: '3px solid var(--accent-primary, #c51b1b)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

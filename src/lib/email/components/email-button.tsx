import * as React from 'react';
import { Button as REButton } from '@react-email/components';

// ─── Props ───────────────────────────────────────────────────────────────────

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EmailButton({ href, children }: EmailButtonProps): React.JSX.Element {
  return (
    <REButton href={href} style={buttonStyle}>
      {children}
    </REButton>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#C51B1B',
  borderRadius: 8,
  color: '#ffffff',
  display: 'inline-block',
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 1,
  padding: '14px 32px',
  textAlign: 'center',
  textDecoration: 'none',
};

import * as React from 'react';
import { Section, Row, Column, Text } from '@react-email/components';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface InfoItem {
  label: string;
  value: string;
}

interface EmailInfoBoxProps {
  items: InfoItem[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EmailInfoBox({ items }: EmailInfoBoxProps): React.JSX.Element {
  return (
    <Section style={boxStyle}>
      {items.map((item, idx) => (
        <Row key={idx} style={rowStyle}>
          <Column style={labelColumnStyle}>
            <Text style={labelStyle}>{item.label}</Text>
          </Column>
          <Column style={valueColumnStyle}>
            <Text style={valueStyle}>{item.value}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}

// ─── Alert variant ───────────────────────────────────────────────────────────

interface EmailAlertProps {
  children: React.ReactNode;
  variant?: 'warning' | 'info';
}

export function EmailAlert({
  children,
  variant = 'info',
}: EmailAlertProps): React.JSX.Element {
  const bgColor = variant === 'warning' ? '#3d1f00' : '#1a2332';
  const borderColor = variant === 'warning' ? '#C51B1B' : '#334155';

  return (
    <Section
      style={{
        ...alertStyle,
        backgroundColor: bgColor,
        borderLeftColor: borderColor,
      }}
    >
      <Text style={alertTextStyle}>{children}</Text>
    </Section>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const boxStyle: React.CSSProperties = {
  backgroundColor: '#222222',
  borderRadius: 8,
  padding: '12px 16px',
  margin: '16px 0',
};

const rowStyle: React.CSSProperties = {
  padding: '6px 0',
};

const labelColumnStyle: React.CSSProperties = {
  width: '40%',
  verticalAlign: 'top',
};

const valueColumnStyle: React.CSSProperties = {
  width: '60%',
  verticalAlign: 'top',
};

const labelStyle: React.CSSProperties = {
  color: '#999999',
  fontSize: 14,
  fontWeight: 500,
  margin: 0,
};

const valueStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 600,
  margin: 0,
};

const alertStyle: React.CSSProperties = {
  borderRadius: 8,
  borderLeftWidth: 4,
  borderLeftStyle: 'solid',
  padding: '12px 16px',
  margin: '16px 0',
};

const alertTextStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: 14,
  margin: 0,
};

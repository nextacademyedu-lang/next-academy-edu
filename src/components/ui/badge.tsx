import React from 'react';
import styles from './badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span 
      className={[
        styles.badge, 
        styles[`badge-${variant}`], 
        className
      ].filter(Boolean).join(' ')} 
      {...props}
    >
      {children}
    </span>
  );
}

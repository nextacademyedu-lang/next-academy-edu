import React from 'react';
import styles from './card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean; // If true, adds hover effects
}

export function Card({ className, children, interactive = false, ...props }: CardProps) {
  return (
    <div 
      className={[
        styles.card, 
        interactive ? styles.interactive : '', 
        className
      ].filter(Boolean).join(' ')} 
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles.header, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={[styles.title, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles.content, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={[styles.description, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </p>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles.footer, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}

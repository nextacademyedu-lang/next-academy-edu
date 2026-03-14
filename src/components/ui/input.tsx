import React, { forwardRef } from 'react';
import styles from './input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    // Generate a secure random ID if label exists but no ID is provided to link label to input.
    const inputId = id || (label ? `input-${Math.random().toString(36).substring(7)}` : undefined);

    return (
      <div className={styles.container}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label} {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        
        <input
          id={inputId}
          ref={ref}
          className={[
            styles.input,
            error ? styles.inputError : '',
            className
          ].filter(Boolean).join(' ')}
          {...props}
        />
        
        {error && <span className={styles.errorText}>{error}</span>}
        {hint && !error && <span className={styles.hintText}>{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

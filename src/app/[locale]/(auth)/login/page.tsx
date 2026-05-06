"use client";

import React from 'react';
import { SignIn } from '@clerk/nextjs';
import styles from './login.module.css';

export default function LoginPage() {
  return (
    <div className={styles.formContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '600px', width: '100%' }}>
      <SignIn fallbackRedirectUrl="/dashboard" routing="hash" />
    </div>
  );
}

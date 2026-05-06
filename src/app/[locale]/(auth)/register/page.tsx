"use client";

import React from 'react';
import { SignUp } from '@clerk/nextjs';
import styles from '../login/login.module.css';

export default function RegisterPage() {
  return (
    <div className={styles.formContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '600px', width: '100%' }}>
      <SignUp forceRedirectUrl="/onboarding" routing="hash" />
    </div>
  );
}

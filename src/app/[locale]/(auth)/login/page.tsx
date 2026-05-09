"use client";

import React, { Suspense } from 'react';
import { SignIn } from '@clerk/nextjs';
import { useSearchParams, useParams } from 'next/navigation';
import styles from './login.module.css';

function LoginForm() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const redirect = searchParams.get('redirect');
  
  const targetUrl = redirect 
    ? `/${locale}/onboarding?returnTo=${encodeURIComponent(redirect)}` 
    : `/${locale}/dashboard`;

  return <SignIn fallbackRedirectUrl={targetUrl} routing="hash" />;
}

export default function LoginPage() {
  return (
    <div className={styles.formContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '600px', width: '100%' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

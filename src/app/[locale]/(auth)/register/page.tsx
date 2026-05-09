"use client";

import React, { Suspense } from 'react';
import { SignUp } from '@clerk/nextjs';
import { useSearchParams, useParams } from 'next/navigation';
import styles from '../login/login.module.css';

function RegisterForm() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const redirect = searchParams.get('redirect');
  
  const targetUrl = redirect 
    ? `/${locale}/onboarding?returnTo=${encodeURIComponent(redirect)}` 
    : `/${locale}/onboarding`;

  // If redirect is present, we pass it to forceRedirectUrl so after registering, they go back to the redirect destination
  return <SignUp forceRedirectUrl={targetUrl} routing="hash" />;
}

export default function RegisterPage() {
  return (
    <div className={styles.formContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '600px', width: '100%' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}

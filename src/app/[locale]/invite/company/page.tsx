'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { getDashboardPath } from '@/lib/role-redirect';

type InvitationView = {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  company: { id: string | null; name: string } | null;
  jobTitle?: string | null;
  title?: string | null;
  expiresAt?: string | null;
  acceptedAt?: string | null;
  createdAt?: string | null;
};

export default function CompanyInvitationPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();

  const token = (searchParams.get('token') || '').trim();
  const [invitation, setInvitation] = useState<InvitationView | null>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');

  const redirectToSelf = useMemo(
    () => `/${locale}/invite/company?token=${encodeURIComponent(token)}`,
    [locale, token],
  );

  useEffect(() => {
    let active = true;

    const loadInvitation = async () => {
      if (!token) {
        if (!active) return;
        setError('Invalid invitation token.');
        setLoadingInvitation(false);
        return;
      }

      try {
        const res = await fetch(`/api/b2b/invitations/validate?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.invitation) {
          if (!active) return;
          setError(data?.error || 'Invitation not found.');
          setLoadingInvitation(false);
          return;
        }

        if (!active) return;
        setInvitation(data.invitation as InvitationView);
        setLoadingInvitation(false);
      } catch {
        if (!active) return;
        setError('Failed to load invitation.');
        setLoadingInvitation(false);
      }
    };

    loadInvitation();
    return () => {
      active = false;
    };
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setAccepting(true);
    setError('');

    try {
      const res = await fetch('/api/b2b/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || 'Failed to accept invitation.');
        setAccepting(false);
        return;
      }

      await refreshUser();
      setAccepted(true);
    } catch {
      setError('Failed to accept invitation.');
    } finally {
      setAccepting(false);
    }
  };

  const invitedEmail = invitation?.email?.toLowerCase() || '';
  const userEmail = user?.email?.toLowerCase() || '';
  const emailMatches = invitedEmail && userEmail && invitedEmail === userEmail;
  const dashboardPath = getDashboardPath(user?.role || 'user', locale);

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '26px', color: 'var(--text-primary)' }}>Company Invitation</h1>

        {loadingInvitation ? <p style={{ margin: 0, color: 'var(--text-muted)' }}>Loading invitation…</p> : null}

        {!loadingInvitation && error ? (
          <>
            <p style={{ margin: 0, color: '#ff4d4f' }}>{error}</p>
            <Link href={`/${locale}`} style={{ color: 'var(--accent-primary)' }}>
              Back to home
            </Link>
          </>
        ) : null}

        {!loadingInvitation && invitation && !error ? (
          <>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              You are invited to join{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{invitation.company?.name || 'Company'}</strong>{' '}
              using <strong style={{ color: 'var(--text-primary)' }}>{invitation.email}</strong>.
            </p>
            {invitation.expiresAt ? (
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
                Expires on{' '}
                {new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            ) : null}

            {invitation.status !== 'pending' ? (
              <p style={{ margin: 0, color: '#ffb020' }}>
                This invitation is {invitation.status}.
              </p>
            ) : null}

            {accepted ? (
              <>
                <p style={{ margin: 0, color: '#22c55e' }}>Invitation accepted successfully.</p>
                <Button variant="primary" onClick={() => router.push(dashboardPath)}>
                  Go to Dashboard
                </Button>
              </>
            ) : null}

            {!accepted && invitation.status === 'pending' && !isLoading && !isAuthenticated ? (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link href={`/${locale}/login?redirect=${encodeURIComponent(redirectToSelf)}`}>
                  <Button variant="primary">Login to Accept</Button>
                </Link>
                <Link href={`/${locale}/register?redirect=${encodeURIComponent(redirectToSelf)}`}>
                  <Button variant="secondary">Create Account</Button>
                </Link>
              </div>
            ) : null}

            {!accepted && invitation.status === 'pending' && !isLoading && isAuthenticated && !emailMatches ? (
              <>
                <p style={{ margin: 0, color: '#ff4d4f' }}>
                  You are logged in as {user?.email}. This invitation is for {invitation.email}.
                </p>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await logout();
                    router.push(`/${locale}/login?redirect=${encodeURIComponent(redirectToSelf)}`);
                  }}
                >
                  Switch Account
                </Button>
              </>
            ) : null}

            {!accepted &&
            invitation.status === 'pending' &&
            !isLoading &&
            isAuthenticated &&
            emailMatches &&
            !user?.emailVerified ? (
              <>
                <p style={{ margin: 0, color: '#ffb020' }}>
                  Verify your email first, then return to accept this invitation.
                </p>
                <Link
                  href={`/${locale}/verify-email?email=${encodeURIComponent(
                    user?.email || invitation.email,
                  )}&redirect=${encodeURIComponent(redirectToSelf)}`}
                >
                  <Button variant="secondary">Verify Email</Button>
                </Link>
              </>
            ) : null}

            {!accepted &&
            invitation.status === 'pending' &&
            !isLoading &&
            isAuthenticated &&
            emailMatches &&
            user?.emailVerified ? (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Button variant="primary" onClick={handleAccept} disabled={accepting}>
                  {accepting ? 'Accepting…' : 'Accept Invitation'}
                </Button>
                <Link href={dashboardPath}>
                  <Button variant="secondary">Maybe Later</Button>
                </Link>
              </div>
            ) : null}

            {error ? <p style={{ margin: 0, color: '#ff4d4f' }}>{error}</p> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

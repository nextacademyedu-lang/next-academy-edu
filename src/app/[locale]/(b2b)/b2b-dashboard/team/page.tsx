"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Search, UserCheck, Mail, UserPlus, Trash2, X, Send, Clock3 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  getB2BInvitations,
  getB2BTeam,
  inviteB2BTeamMember,
  removeB2BTeamMember,
  resendB2BInvitation,
  revokeB2BInvitation,
  type B2BInvitation,
  type B2BTeamMember,
} from '@/lib/b2b-api';

type TeamFormState = {
  email: string;
  jobTitle: string;
  title: string;
};

const INITIAL_FORM: TeamFormState = {
  email: '',
  jobTitle: '',
  title: '',
};

export default function B2BTeamPage() {
  const locale = useLocale();
  const [members, setMembers] = useState<B2BTeamMember[]>([]);
  const [invitations, setInvitations] = useState<B2BInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<TeamFormState>(INITIAL_FORM);

  const loadData = async () => {
    const [teamRes, invitationsRes] = await Promise.all([
      getB2BTeam(),
      getB2BInvitations('pending'),
    ]);

    if (teamRes.success && teamRes.data) {
      setMembers(teamRes.data.docs);
    }

    if (invitationsRes.success && invitationsRes.data) {
      setInvitations(invitationsRes.data.docs.filter((item) => item.status === 'pending'));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateField = <K extends keyof TeamFormState>(field: K, value: TeamFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleInviteMember = async () => {
    const email = form.email.trim();
    if (!email) {
      setError('Email is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const res = await inviteB2BTeamMember({
      email,
      jobTitle: form.jobTitle.trim() || undefined,
      title: form.title.trim() || undefined,
      locale: locale === 'en' ? 'en' : 'ar',
    });
    setSaving(false);

    if (!res.success || !res.data) {
      setError(res.error || 'Failed to send invitation');
      return;
    }

    if (res.data.alreadyMember) {
      setSuccess(res.data.message || 'User is already in your team');
      setForm(INITIAL_FORM);
      setFormOpen(false);
      await loadData();
      return;
    }

    const invitation = res.data.invitation;
    if (invitation) {
      setInvitations((prev) => [invitation, ...prev.filter((item) => item.id !== invitation.id)]);
    }

    if (res.data.emailSent === false && res.data.previewUrl) {
      setSuccess(`Invitation created. Email failed, use this link manually: ${res.data.previewUrl}`);
    } else {
      setSuccess(res.data.created ? 'Invitation sent successfully' : 'Pending invitation re-sent');
    }

    setForm(INITIAL_FORM);
    setFormOpen(false);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Remove this member from your company?')) return;
    setError('');
    setSuccess('');

    const res = await removeB2BTeamMember(userId);
    if (!res.success) {
      setError(res.error || 'Failed to remove member');
      return;
    }

    setMembers((prev) => prev.filter((member) => member.user.id !== userId));
    setSuccess('Member removed from company scope');
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!confirm('Revoke this invitation?')) return;
    setError('');
    setSuccess('');

    const res = await revokeB2BInvitation(invitationId);
    if (!res.success) {
      setError(res.error || 'Failed to revoke invitation');
      return;
    }

    setInvitations((prev) => prev.filter((invitation) => invitation.id !== invitationId));
    setSuccess('Invitation revoked');
  };

  const handleResendInvitation = async (invitation: B2BInvitation) => {
    setError('');
    setSuccess('');

    const res = await resendB2BInvitation({
      email: invitation.email,
      jobTitle: invitation.jobTitle || undefined,
      title: invitation.title || undefined,
      locale: locale === 'en' ? 'en' : 'ar',
    });

    if (!res.success) {
      setError(res.error || 'Failed to resend invitation');
      return;
    }

    if (res.data?.emailSent === false && res.data.previewUrl) {
      setSuccess(`Invitation exists. Email failed, manual link: ${res.data.previewUrl}`);
    } else {
      setSuccess('Invitation email re-sent');
    }
  };

  const filteredMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          `${member.user.firstName} ${member.user.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
          member.user.email.toLowerCase().includes(query.toLowerCase()),
      ),
    [members, query],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Team Members</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Invite employees by email. They are linked to your company after accepting and verifying account ownership.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setFormOpen(true);
            setError('');
            setSuccess('');
          }}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <UserPlus size={16} />
          Add Team Member
        </Button>
        <div style={{ position: 'relative', width: 'min(100%, 280px)' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <Input
            placeholder="Search employees..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '38px', background: 'rgba(255,255,255,0.02)' }}
          />
        </div>
      </div>

      {error ? <p style={{ margin: 0, color: '#ff4d4f', whiteSpace: 'pre-wrap' }}>{error}</p> : null}
      {success ? <p style={{ margin: 0, color: '#22c55e', whiteSpace: 'pre-wrap' }}>{success}</p> : null}

      {formOpen && (
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <CardContent style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>Invite Team Member</h2>
              <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)} disabled={saving}>
                <X size={15} />
              </Button>
            </div>

            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
              The employee gets an invitation email. If they register later with the same email, they are linked automatically after OTP verification.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <Input
                placeholder="Email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                disabled={saving}
              />
              <Input
                placeholder="Job title (optional)"
                value={form.jobTitle}
                onChange={(e) => updateField('jobTitle', e.target.value)}
                disabled={saving}
              />
              <Input
                placeholder="Title (optional)"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                disabled={saving}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleInviteMember} disabled={saving}>
                {saving ? 'Sending…' : 'Send Invitation'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>{loading ? '…' : `${invitations.length} pending invitation${invitations.length !== 1 ? 's' : ''}`}</CardDescription>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {loading ? (
            <p style={{ padding: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
          ) : invitations.length === 0 ? (
            <p style={{ padding: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>No pending invitations.</p>
          ) : (
            invitations.map((invitation, i) => (
              <div
                key={invitation.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '14px 20px',
                  borderBottom: i < invitations.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={14} />
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{invitation.email}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Clock3 size={12} />
                      Expires:{' '}
                      {invitation.expiresAt
                        ? new Date(invitation.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'N/A'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResendInvitation(invitation)}
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Send size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeInvitation(invitation.id)}
                    style={{ color: '#ff4d4f' }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card style={{ background: 'var(--bg-elevated)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)' }}>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>{loading ? '…' : `${filteredMembers.length} member${filteredMembers.length !== 1 ? 's' : ''}`}</CardDescription>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {loading ? (
            <p style={{ padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
          ) : filteredMembers.length === 0 ? (
            <p style={{ padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>No members found.</p>
          ) : (
            filteredMembers.map((member, i) => (
              <div
                key={member.user.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '16px 24px',
                  borderBottom: i < filteredMembers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(197,27,27,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                      flexShrink: 0,
                    }}
                  >
                    {member.user.firstName[0]}
                    {member.user.lastName[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {member.user.firstName} {member.user.lastName}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <Mail size={12} /> {member.user.email}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {member.profile?.jobTitle && (
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{member.profile.jobTitle}</span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <UserCheck size={14} />
                    <span>{member.bookings_count} booking{member.bookings_count !== 1 ? 's' : ''}</span>
                  </div>
                  {member.last_booking_date && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Last: {new Date(member.last_booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.user.id)}
                    style={{ color: '#ff4d4f' }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

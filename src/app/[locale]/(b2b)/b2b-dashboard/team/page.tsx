"use client";

import React, { useEffect, useState } from 'react';
import { Search, UserCheck, Mail, UserPlus, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  addB2BTeamMember,
  getB2BTeam,
  removeB2BTeamMember,
  type B2BTeamMember,
} from '@/lib/b2b-api';

type TeamFormState = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  jobTitle: string;
  title: string;
};

const INITIAL_FORM: TeamFormState = {
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  jobTitle: '',
  title: '',
};

export default function B2BTeamPage() {
  const [members, setMembers] = useState<B2BTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<TeamFormState>(INITIAL_FORM);

  const loadMembers = async () => {
    getB2BTeam().then(res => {
      if (res.success && res.data) setMembers(res.data.docs);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const updateField = <K extends keyof TeamFormState>(field: K, value: TeamFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleAddMember = async () => {
    const email = form.email.trim();
    if (!email) {
      setError('Email is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      email,
      firstName: form.firstName.trim() || undefined,
      lastName: form.lastName.trim() || undefined,
      password: form.password || undefined,
      jobTitle: form.jobTitle.trim() || undefined,
      title: form.title.trim() || undefined,
    };

    const res = await addB2BTeamMember(payload);
    setSaving(false);

    if (!res.success || !res.data) {
      setError(res.error || 'Failed to add team member');
      return;
    }

    await loadMembers();
    setForm(INITIAL_FORM);
    setFormOpen(false);
    setSuccess(res.data.created ? 'Team member created and linked to company' : 'Existing user linked to company');
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

  const filtered = members.filter(m =>
    `${m.user.firstName} ${m.user.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
    m.user.email.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Team Members</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>All employees registered under your company.</p>
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
          Add Member
        </Button>
        <div style={{ position: 'relative', width: 'min(100%, 280px)' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <Input
            placeholder="Search employees..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: '38px', background: 'rgba(255,255,255,0.02)' }}
          />
        </div>
      </div>

      {error ? <p style={{ margin: 0, color: '#ff4d4f' }}>{error}</p> : null}
      {success ? <p style={{ margin: 0, color: '#22c55e' }}>{success}</p> : null}

      {formOpen && (
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <CardContent style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>Add Team Member</h2>
              <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)} disabled={saving}>
                <X size={15} />
              </Button>
            </div>

            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
              Existing user: enter email only. New user: add first/last name + password (8+ chars).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <Input
                placeholder="Email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                disabled={saving}
              />
              <Input
                placeholder="First name (new user)"
                value={form.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                disabled={saving}
              />
              <Input
                placeholder="Last name (new user)"
                value={form.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                disabled={saving}
              />
              <Input
                type="password"
                placeholder="Password (new user)"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
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
              <Button variant="primary" onClick={handleAddMember} disabled={saving}>
                {saving ? 'Saving…' : 'Save Member'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card style={{ background: 'var(--bg-elevated)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)' }}>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>{loading ? '…' : `${filtered.length} member${filtered.length !== 1 ? 's' : ''}`}</CardDescription>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {loading ? (
            <p style={{ padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
          ) : filtered.length === 0 ? (
            <p style={{ padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>No members found.</p>
          ) : filtered.map((member, i) => (
            <div key={member.user.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '16px 24px',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'rgba(197,27,27,0.15)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--accent-primary)', flexShrink: 0,
                }}>
                  {member.user.firstName[0]}{member.user.lastName[0]}
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
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

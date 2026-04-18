"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Save, Send, AlertCircle, CheckCircle2, Clock3, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getInstructorProfile,
  submitInstructorProfileVerification,
  updateInstructorProfile,
  type PayloadInstructorProfile,
} from '@/lib/instructor-api';
import { useAuth } from '@/context/auth-context';

function richTextFromPlainText(text: string) {
  const trimmed = text.trim();
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: trimmed, version: 1 }],
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  };
}

function plainTextFromRichText(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  const root = (value as { root?: { children?: Array<{ children?: Array<{ text?: string }> }> } }).root;
  if (!root || !Array.isArray(root.children)) return '';
  const segments: string[] = [];
  for (const block of root.children) {
    if (!Array.isArray(block?.children)) continue;
    for (const child of block.children) {
      const text = typeof child?.text === 'string' ? child.text : '';
      if (text.trim()) segments.push(text.trim());
    }
  }
  return segments.join('\n').trim();
}

type FormState = {
  firstName: string;
  lastName: string;
  jobTitle: string;
  tagline: string;
  linkedinUrl: string;
  twitterUrl: string;
  bioAr: string;
  bioEn: string;
};

const INITIAL_STATE: FormState = {
  firstName: '',
  lastName: '',
  jobTitle: '',
  tagline: '',
  linkedinUrl: '',
  twitterUrl: '',
  bioAr: '',
  bioEn: '',
};

export default function InstructorProfilePage() {
  const [profile, setProfile] = useState<PayloadInstructorProfile | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { logout } = useAuth();

  useEffect(() => {
    getInstructorProfile().then((res) => {
      if (!res.success || !res.data?.profile) {
        setError(res.error || 'Failed to load profile');
        setLoading(false);
        return;
      }

      const p = res.data.profile;
      setProfile(p);
      setForm({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        jobTitle: p.jobTitle || '',
        tagline: p.tagline || '',
        linkedinUrl: p.linkedinUrl || '',
        twitterUrl: p.twitterUrl || '',
        bioAr: plainTextFromRichText(p.bioAr),
        bioEn: plainTextFromRichText(p.bioEn),
      });
      setPicturePreviewUrl((p.picture && typeof p.picture === 'object' && p.picture.url) ? p.picture.url : '');
      setCoverPreviewUrl((p.coverImage && typeof p.coverImage === 'object' && p.coverImage.url) ? p.coverImage.url : '');
      setLoading(false);
    });
  }, []);

  const [uploadingField, setUploadingField] = useState<'picture' | 'coverImage' | null>(null);
  const [picturePreviewUrl, setPicturePreviewUrl] = useState('');
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');

  const uploadMedia = async (field: 'picture' | 'coverImage', file: File) => {
    setUploadingField(field);
    setError('');
    try {
      const formData = new FormData();
      formData.append('field', field);
      formData.append('file', file);

      const res = await fetch('/api/instructor/onboarding/media', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.media?.id) {
        setError(data?.error || 'Failed to upload image');
        return;
      }

      const mediaUrl = typeof data.media.url === 'string' ? data.media.url : '';
      if (field === 'picture') {
        setPicturePreviewUrl(mediaUrl);
      } else {
        setCoverPreviewUrl(mediaUrl);
      }
      setSuccess('Image uploaded successfully.');
    } catch {
      setError('Network error while uploading image');
    } finally {
      setUploadingField(null);
    }
  };

  const status = profile?.verificationStatus || 'draft';
  const statusMeta = useMemo(() => {
    if (status === 'approved') {
      return {
        icon: <CheckCircle2 size={16} />,
        color: '#22c55e',
        text: 'Approved',
      };
    }
    if (status === 'pending') {
      return {
        icon: <Clock3 size={16} />,
        color: '#f59e0b',
        text: 'Pending Review',
      };
    }
    if (status === 'rejected') {
      return {
        icon: <AlertCircle size={16} />,
        color: '#ef4444',
        text: 'Needs Updates',
      };
    }
    return {
      icon: <AlertCircle size={16} />,
      color: '#94a3b8',
      text: 'Draft',
    };
  }, [status]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      jobTitle: form.jobTitle.trim(),
      tagline: form.tagline.trim(),
      linkedinUrl: form.linkedinUrl.trim(),
      twitterUrl: form.twitterUrl.trim(),
      bioAr: form.bioAr.trim() ? richTextFromPlainText(form.bioAr) : null,
      bioEn: form.bioEn.trim() ? richTextFromPlainText(form.bioEn) : null,
    };

    const res = await updateInstructorProfile(payload);
    setSaving(false);

    if (!res.success || !res.data?.profile) {
      setError(res.error || 'Failed to save profile');
      return;
    }

    setProfile(res.data.profile);
    setSuccess('Profile saved');
  };

  const handleSubmitForVerification = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    const res = await submitInstructorProfileVerification();
    setSubmitting(false);

    if (!res.success) {
      const missingFields = (res.data as { missingFields?: string[] } | undefined)?.missingFields;
      if (missingFields?.length) {
        setError(`Missing fields: ${missingFields.join(', ')}`);
      } else {
        setError(res.error || 'Failed to submit profile');
      }
      return;
    }

    const refreshed = await getInstructorProfile();
    if (refreshed.success && refreshed.data?.profile) {
      setProfile(refreshed.data.profile);
    }
    setSuccess('Profile submitted for admin review');
  };

  if (loading) {
    return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Instructor Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Complete your profile, then submit it for admin approval.
        </p>
      </div>

      <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <CardContent style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '8px', color: statusMeta.color }}>
          {statusMeta.icon}
          <strong>{statusMeta.text}</strong>
          {profile?.rejectionReason ? (
            <span style={{ color: 'var(--text-secondary)' }}>- {profile.rejectionReason}</span>
          ) : null}
        </CardContent>
      </Card>

      <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <CardHeader>
          <CardTitle>Basic Details</CardTitle>
          <CardDescription>These details appear on your public profile after approval.</CardDescription>
        </CardHeader>
        <CardContent style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <Label>First Name</Label>
              <Input value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Job Title</Label>
            <Input value={form.jobTitle} onChange={(e) => updateField('jobTitle', e.target.value)} />
          </div>

          <div>
            <Label>Tagline</Label>
            <Input
              value={form.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              placeholder="Example: Sales Expert with 10+ years of experience"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <Label>LinkedIn URL</Label>
              <Input value={form.linkedinUrl} onChange={(e) => updateField('linkedinUrl', e.target.value)} />
            </div>
            <div>
              <Label>Twitter URL</Label>
              <Input value={form.twitterUrl} onChange={(e) => updateField('twitterUrl', e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Bio (Arabic)</Label>
            <textarea
              value={form.bioAr}
              onChange={(e) => updateField('bioAr', e.target.value)}
              rows={5}
              style={{
                width: '100%',
                marginTop: '8px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                padding: '10px 12px',
                resize: 'vertical',
              }}
            />
          </div>

          <div>
            <Label>Bio (English)</Label>
            <textarea
              value={form.bioEn}
              onChange={(e) => updateField('bioEn', e.target.value)}
              rows={5}
              style={{
                width: '100%',
                marginTop: '8px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                padding: '10px 12px',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label>Profile Picture</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadMedia('picture', file);
                }}
              />
              {uploadingField === 'picture' && <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Uploading...</p>}
              {picturePreviewUrl && (
                <div style={{ marginTop: '8px', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden', width: 'fit-content' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={picturePreviewUrl} alt="Profile" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label>Cover Image</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadMedia('coverImage', file);
                }}
              />
              {uploadingField === 'coverImage' && <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Uploading...</p>}
              {coverPreviewUrl && (
                <div style={{ marginTop: '8px', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden', width: 'fit-content' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverPreviewUrl} alt="Cover" style={{ width: '200px', height: '100px', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>

          {error ? <p style={{ color: '#ef4444', margin: 0 }}>{error}</p> : null}
          {success ? <p style={{ color: '#22c55e', margin: 0 }}>{success}</p> : null}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              <Save size={16} style={{ marginInlineEnd: '6px' }} />
              {saving ? 'Updating…' : 'Update Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Connect external tools like Google Calendar to sync your availability and consultation bookings automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
             <Button variant="outline" onClick={() => window.location.href = '/api/google/connect'}>
               Connect Google Calendar
             </Button>
          </div>
        </CardContent>
      </Card>

      <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your session.</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
             <Button variant="outline" onClick={() => logout().then(() => window.location.href = '/')} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
               <LogOut size={16} style={{ marginRight: '8px' }} />
               Log Out
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

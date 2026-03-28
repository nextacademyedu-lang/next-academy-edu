"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Send, Trash2, Edit2, BookOpen, Save, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createProgramSubmission,
  deleteProgramSubmission,
  getProgramSubmissions,
  submitProgramSubmission,
  updateProgramSubmission,
  type PayloadProgramSubmission,
} from '@/lib/instructor-api';

type FormState = {
  type: 'workshop' | 'course' | 'webinar';
  titleAr: string;
  titleEn: string;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  descriptionAr: string;
  descriptionEn: string;
  categoryName: string;
  durationHours: string;
  sessionsCount: string;
  language: 'ar' | 'en' | 'both';
  level: 'beginner' | 'intermediate' | 'advanced';
  price: string;
  currency: 'EGP' | 'USD' | 'EUR';
  objectivesText: string;
  requirementsText: string;
  targetAudienceText: string;
  extraNotes: string;
  sessionOutlineText: string;
};

const INITIAL_FORM: FormState = {
  type: 'course',
  titleAr: '',
  titleEn: '',
  shortDescriptionAr: '',
  shortDescriptionEn: '',
  descriptionAr: '',
  descriptionEn: '',
  categoryName: '',
  durationHours: '',
  sessionsCount: '1',
  language: 'ar',
  level: 'beginner',
  price: '',
  currency: 'EGP',
  objectivesText: '',
  requirementsText: '',
  targetAudienceText: '',
  extraNotes: '',
  sessionOutlineText: '',
};

function parseSessionOutline(input: string) {
  const lines = input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const parts = line.split(' - ');
    const title = parts[0]?.trim() || `Session ${index + 1}`;
    const summary = parts.slice(1).join(' - ').trim();
    return {
      sessionNumber: index + 1,
      title,
      summary: summary || undefined,
    };
  });
}

function stringifySessionOutline(
  value: PayloadProgramSubmission['sessionOutline'],
): string {
  if (!Array.isArray(value) || value.length === 0) return '';
  return value
    .map((row) => {
      const title = row.title || '';
      const summary = row.summary?.trim();
      return summary ? `${title} - ${summary}` : title;
    })
    .join('\n');
}

export default function InstructorProgramSubmissionsPage() {
  const [submissions, setSubmissions] = useState<PayloadProgramSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const editingSubmission = useMemo(
    () => submissions.find((submission) => submission.id === editingId) || null,
    [editingId, submissions],
  );

  useEffect(() => {
    getProgramSubmissions().then((res) => {
      if (res.success && res.data) {
        setSubmissions(res.data.docs);
      } else {
        setError(res.error || 'Failed to load submissions');
      }
      setLoading(false);
    });
  }, []);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setIsFormOpen(true);
    setError('');
    setSuccess('');
  };

  const openEdit = (submission: PayloadProgramSubmission) => {
    setEditingId(submission.id);
    setForm({
      type: submission.type || 'course',
      titleAr: submission.titleAr || '',
      titleEn: submission.titleEn || '',
      shortDescriptionAr: submission.shortDescriptionAr || '',
      shortDescriptionEn: submission.shortDescriptionEn || '',
      descriptionAr: submission.descriptionAr || '',
      descriptionEn: submission.descriptionEn || '',
      categoryName: submission.categoryName || '',
      durationHours: submission.durationHours !== undefined ? String(submission.durationHours) : '',
      sessionsCount: submission.sessionsCount ? String(submission.sessionsCount) : '1',
      language: submission.language || 'ar',
      level: submission.level || 'beginner',
      price: submission.price !== undefined ? String(submission.price) : '',
      currency: submission.currency || 'EGP',
      objectivesText: submission.objectivesText || '',
      requirementsText: submission.requirementsText || '',
      targetAudienceText: submission.targetAudienceText || '',
      extraNotes: submission.extraNotes || '',
      sessionOutlineText: stringifySessionOutline(submission.sessionOutline),
    });
    setIsFormOpen(true);
    setError('');
    setSuccess('');
  };

  const closeForm = () => {
    if (saving) return;
    setIsFormOpen(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
    setError('');
  };

  const validateForm = () => {
    if (!form.titleAr.trim()) return 'Arabic title is required';
    if (!form.shortDescriptionAr.trim()) return 'Arabic short description is required';
    if (!form.descriptionAr.trim()) return 'Arabic full description is required';
    const sessionsCount = Number(form.sessionsCount);
    if (!Number.isFinite(sessionsCount) || sessionsCount <= 0) {
      return 'sessionsCount must be greater than 0';
    }
    return null;
  };

  const buildPayload = () => ({
    type: form.type,
    titleAr: form.titleAr.trim(),
    titleEn: form.titleEn.trim() || undefined,
    shortDescriptionAr: form.shortDescriptionAr.trim(),
    shortDescriptionEn: form.shortDescriptionEn.trim() || undefined,
    descriptionAr: form.descriptionAr.trim(),
    descriptionEn: form.descriptionEn.trim() || undefined,
    categoryName: form.categoryName.trim() || undefined,
    durationHours:
      Number.isFinite(Number(form.durationHours)) && Number(form.durationHours) >= 0
        ? Number(form.durationHours)
        : undefined,
    sessionsCount: Math.floor(Number(form.sessionsCount)),
    language: form.language,
    level: form.level,
    price: Number.isFinite(Number(form.price)) ? Number(form.price) : undefined,
    currency: form.currency,
    objectivesText: form.objectivesText.trim() || undefined,
    requirementsText: form.requirementsText.trim() || undefined,
    targetAudienceText: form.targetAudienceText.trim() || undefined,
    extraNotes: form.extraNotes.trim() || undefined,
    sessionOutline: parseSessionOutline(form.sessionOutlineText),
  });

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const payload = buildPayload();

    if (editingId) {
      const res = await updateProgramSubmission(editingId, payload);
      setSaving(false);
      if (!res.success || !res.data?.doc) {
        setError(res.error || 'Failed to update submission');
        return;
      }

      setSubmissions((prev) =>
        prev.map((submission) => (submission.id === editingId ? res.data!.doc : submission)),
      );
      setSuccess('Submission updated');
      closeForm();
      return;
    }

    const res = await createProgramSubmission(payload);
    setSaving(false);
    if (!res.success || !res.data?.doc) {
      setError(res.error || 'Failed to create submission');
      return;
    }

    setSubmissions((prev) => [res.data!.doc, ...prev]);
    setSuccess('Submission draft created');
    closeForm();
  };

  const handleSubmit = async (id: string) => {
    setSubmittingId(id);
    setError('');
    setSuccess('');

    const res = await submitProgramSubmission(id);
    setSubmittingId(null);
    if (!res.success) {
      const missingFields = (res.data as { missingFields?: string[] } | undefined)?.missingFields;
      if (missingFields?.length) {
        setError(`Missing fields: ${missingFields.join(', ')}`);
      } else {
        setError(res.error || 'Failed to submit proposal');
      }
      return;
    }

    const refreshed = await getProgramSubmissions();
    if (refreshed.success && refreshed.data) {
      setSubmissions(refreshed.data.docs);
    }
    setSuccess('Program proposal submitted for admin review');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this proposal?')) return;
    const res = await deleteProgramSubmission(id);
    if (!res.success) {
      setError(res.error || 'Failed to delete proposal');
      return;
    }
    setSubmissions((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1050px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Program Submissions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Submit your course/workshop details (type, sessions, content outline) for admin review.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Plus size={16} /> New Program Proposal
        </Button>
      </div>

      {error ? <p style={{ color: '#ef4444', margin: 0 }}>{error}</p> : null}
      {success ? <p style={{ color: '#22c55e', margin: 0 }}>{success}</p> : null}

      {isFormOpen && (
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <CardContent style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '19px' }}>{editingSubmission ? 'Edit Proposal' : 'Create Proposal'}</h2>
              <Button variant="ghost" size="sm" onClick={closeForm}>
                <X size={16} />
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
              <div>
                <Label>Type</Label>
                <select
                  value={form.type}
                  onChange={(e) => updateField('type', e.target.value as FormState['type'])}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    padding: '10px 12px',
                  }}
                >
                  <option value="course">Course</option>
                  <option value="workshop">Workshop</option>
                  <option value="webinar">Webinar</option>
                </select>
              </div>
              <div>
                <Label>Sessions Count</Label>
                <Input type="number" min={1} value={form.sessionsCount} onChange={(e) => updateField('sessionsCount', e.target.value)} />
              </div>
              <div>
                <Label>Duration Hours</Label>
                <Input type="number" min={0} value={form.durationHours} onChange={(e) => updateField('durationHours', e.target.value)} />
              </div>
              <div>
                <Label>Price</Label>
                <Input type="number" min={0} value={form.price} onChange={(e) => updateField('price', e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Arabic Title</Label>
              <Input value={form.titleAr} onChange={(e) => updateField('titleAr', e.target.value)} />
            </div>
            <div>
              <Label>English Title</Label>
              <Input value={form.titleEn} onChange={(e) => updateField('titleEn', e.target.value)} />
            </div>

            <div>
              <Label>Arabic Short Description</Label>
              <textarea
                value={form.shortDescriptionAr}
                onChange={(e) => updateField('shortDescriptionAr', e.target.value)}
                rows={3}
                style={{ width: '100%', marginTop: '8px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', padding: '10px 12px' }}
              />
            </div>
            <div>
              <Label>Arabic Full Description</Label>
              <textarea
                value={form.descriptionAr}
                onChange={(e) => updateField('descriptionAr', e.target.value)}
                rows={5}
                style={{ width: '100%', marginTop: '8px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', padding: '10px 12px' }}
              />
            </div>

            <div>
              <Label>Session Outline (one session per line)</Label>
              <textarea
                value={form.sessionOutlineText}
                onChange={(e) => updateField('sessionOutlineText', e.target.value)}
                rows={4}
                placeholder="Session 1 title - short summary"
                style={{ width: '100%', marginTop: '8px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', padding: '10px 12px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="secondary" onClick={closeForm} disabled={saving}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                <Save size={15} style={{ marginInlineEnd: '6px' }} />
                {saving ? 'Saving…' : editingSubmission ? 'Update Draft' : 'Save Draft'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : null}

      {!loading && submissions.length === 0 ? (
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <CardContent style={{ padding: '40px', textAlign: 'center' }}>
            <BookOpen size={34} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No program proposals yet.</p>
          </CardContent>
        </Card>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {submissions.map((submission) => (
          <Card key={submission.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <CardContent style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{submission.titleAr}</h3>
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)' }}>
                    {submission.status}
                  </span>
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(201,169,110,0.14)' }}>
                    {submission.type}
                  </span>
                </div>
                <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {submission.shortDescriptionAr}
                </p>
                <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Sessions: {submission.sessionsCount} {submission.price !== undefined ? `• ${submission.price} ${submission.currency || 'EGP'}` : ''}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Button variant="ghost" size="sm" onClick={() => openEdit(submission)}>
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSubmit(submission.id)}
                  disabled={submission.status === 'pending' || submission.status === 'approved' || submittingId === submission.id}
                >
                  <Send size={14} style={{ marginInlineEnd: '6px' }} />
                  {submittingId === submission.id ? 'Submitting…' : 'Submit'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(submission.id)} style={{ color: '#ff4d4f' }}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Clock, DollarSign, Settings2, Trash2, Edit2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createConsultationType,
  getConsultationTypes,
  removeConsultationType,
  updateConsultationType,
  type PayloadConsultationType,
} from '@/lib/instructor-api';

type ServiceForm = {
  title: string;
  description: string;
  durationMinutes: string;
  price: string;
  currency: 'EGP' | 'USD';
  meetingType: 'online' | 'in-person' | 'both';
  meetingPlatform: string;
  maxParticipants: string;
  isActive: boolean;
};

const INITIAL_FORM: ServiceForm = {
  title: '',
  description: '',
  durationMinutes: '60',
  price: '0',
  currency: 'EGP',
  meetingType: 'online',
  meetingPlatform: '',
  maxParticipants: '1',
  isActive: true,
};

export default function InstructorServicesPage() {
  const [services, setServices] = useState<PayloadConsultationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(INITIAL_FORM);

  const editingService = useMemo(
    () => services.find((service) => service.id === editingId) || null,
    [editingId, services],
  );

  useEffect(() => {
    getConsultationTypes().then((res) => {
      if (res.success && res.data) {
        setServices(res.data.docs);
      } else {
        setError(res.error || 'Failed to load services');
      }
      setLoading(false);
    });
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const openEditForm = (service: PayloadConsultationType) => {
    setEditingId(service.id);
    setForm({
      title: service.title || service.titleAr || '',
      description: service.description || '',
      durationMinutes: String(service.durationMinutes || 60),
      price: String(service.price || 0),
      currency: service.currency === 'USD' ? 'USD' : 'EGP',
      meetingType:
        service.meetingType === 'in-person' || service.meetingType === 'both'
          ? service.meetingType
          : 'online',
      meetingPlatform: service.meetingPlatform || '',
      maxParticipants: String(service.maxParticipants || 1),
      isActive: service.isActive !== false,
    });
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setIsFormOpen(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
    setError('');
  };

  const updateField = <K extends keyof ServiceForm>(field: K, value: ServiceForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    const duration = Number(form.durationMinutes);
    const price = Number(form.price);
    const maxParticipants = Number(form.maxParticipants);

    if (!form.title.trim()) {
      setError('Service title is required');
      return;
    }
    if (!Number.isFinite(duration) || duration <= 0) {
      setError('Duration must be a positive number');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError('Price must be a valid number');
      return;
    }
    if (!Number.isFinite(maxParticipants) || maxParticipants <= 0) {
      setError('Max participants must be at least 1');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      title: form.title.trim(),
      titleAr: form.title.trim(),
      description: form.description.trim(),
      descriptionAr: form.description.trim(),
      durationMinutes: Math.floor(duration),
      price,
      currency: form.currency,
      meetingType: form.meetingType,
      meetingPlatform: form.meetingPlatform.trim(),
      maxParticipants: Math.floor(maxParticipants),
      isActive: form.isActive,
    };

    if (editingId) {
      const res = await updateConsultationType(editingId, payload);
      setSaving(false);
      if (!res.success || !res.data?.doc) {
        setError(res.error || 'Failed to update service');
        return;
      }

      setServices((prev) =>
        prev.map((service) => (service.id === editingId ? res.data!.doc : service)),
      );
      setSuccess('Service updated');
      closeForm();
      return;
    }

    const res = await createConsultationType(payload);
    setSaving(false);
    if (!res.success || !res.data?.doc) {
      setError(res.error || 'Failed to create service');
      return;
    }

    setServices((prev) => [res.data!.doc, ...prev]);
    setSuccess('Service created');
    closeForm();
  };

  const toggleStatus = async (id: string, current: boolean) => {
    const res = await updateConsultationType(id, { isActive: !current });
    if (!res.success || !res.data?.doc) {
      setError(res.error || 'Failed to update status');
      return;
    }
    setServices((prev) => prev.map((service) => (service.id === id ? res.data!.doc : service)));
  };

  const deleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    const res = await removeConsultationType(id);
    if (!res.success) {
      setError(res.error || 'Failed to delete service');
      return;
    }
    setServices((prev) => prev.filter((service) => service.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Consultation Services
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Create and manage your consultation offerings (title, duration, price, type).
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openCreateForm}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> Create New Service
        </Button>
      </div>

      {error ? <p style={{ color: '#ef4444', margin: 0 }}>{error}</p> : null}
      {success ? <p style={{ color: '#22c55e', margin: 0 }}>{success}</p> : null}

      {isFormOpen && (
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <CardContent style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                {editingService ? 'Edit Service' : 'Create Service'}
              </h2>
              <Button variant="ghost" size="sm" onClick={closeForm}>
                <X size={16} />
              </Button>
            </div>

            <div>
              <Label>Service Title</Label>
              <Input value={form.title} onChange={(e) => updateField('title', e.target.value)} />
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.durationMinutes}
                  onChange={(e) => updateField('durationMinutes', e.target.value)}
                />
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <select
                  value={form.currency}
                  onChange={(e) => updateField('currency', e.target.value as 'EGP' | 'USD')}
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
                  <option value="EGP">EGP</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxParticipants}
                  onChange={(e) => updateField('maxParticipants', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div>
                <Label>Meeting Type</Label>
                <select
                  value={form.meetingType}
                  onChange={(e) => updateField('meetingType', e.target.value as ServiceForm['meetingType'])}
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
                  <option value="online">Online</option>
                  <option value="in-person">In Person</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <Label>Meeting Platform</Label>
                <Input
                  placeholder="Zoom / Meet / Office address..."
                  value={form.meetingPlatform}
                  onChange={(e) => updateField('meetingPlatform', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="secondary" onClick={closeForm} disabled={saving}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editingService ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>}

      {!loading && services.length === 0 && (
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <CardContent style={{ padding: '48px', textAlign: 'center' }}>
            <Settings2 size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>No consultation services yet.</p>
          </CardContent>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {services.map((service) => (
          <Card
            key={service.id}
            style={{
              background: 'var(--bg-elevated)',
              border: `1px solid ${service.isActive ? 'var(--border-subtle)' : 'var(--border)'}`,
              opacity: service.isActive ? 1 : 0.75,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{service.title || service.titleAr}</h3>
                  {!service.isActive ? (
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                      Inactive
                    </span>
                  ) : null}
                </div>

                {service.description ? (
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                    {service.description}
                  </p>
                ) : null}

                <div style={{ display: 'flex', gap: '18px', fontSize: '14px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} /> {service.durationMinutes} mins
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={16} /> {service.price.toLocaleString()} {service.currency || 'EGP'}
                  </div>
                  <div>{service.meetingType || 'online'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Label style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px' }}>Active</Label>
                <button
                  onClick={() => toggleStatus(service.id, service.isActive)}
                  style={{
                    width: '40px',
                    height: '20px',
                    borderRadius: '10px',
                    background: service.isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                    position: 'relative',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: service.isActive ? '22px' : '2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: 'white',
                      transition: 'all 0.3s',
                    }}
                  />
                </button>
                <Button variant="ghost" size="sm" onClick={() => openEditForm(service)} style={{ padding: '0 8px', color: 'var(--text-secondary)' }}>
                  <Edit2 size={18} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteService(service.id)} style={{ padding: '0 8px', color: '#ff4d4f' }}>
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

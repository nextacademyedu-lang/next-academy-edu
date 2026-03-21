"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Clock, DollarSign, Settings2, Trash2, Edit2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  getConsultationTypes,
  type PayloadConsultationType,
} from '@/lib/instructor-api';

export default function InstructorServicesPage() {
  const [services, setServices] = useState<PayloadConsultationType[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getConsultationTypes().then(res => {
      if (res.success && res.data) setServices(res.data.docs);
      setLoading(false);
    });
  }, []);

  const toggleStatus = async (id: string, current: boolean) => {
    const res = await fetch(`/api/consultation-types/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) {
      setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !current } : s));
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    const res = await fetch(`/api/consultation-types/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) setServices(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Consultation Services
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Manage the 1-on-1 consultation types you offer to students.
          </p>
        </div>
        <Button variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Create New Service
        </Button>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>}

      {!loading && services.length === 0 && (
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <CardContent style={{ padding: '48px', textAlign: 'center' }}>
            <Settings2 size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>No consultation services yet.</p>
          </CardContent>
        </Card>
      )}

      {/* Services List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {services.map(service => (
          <Card key={service.id} style={{
            background: 'var(--bg-elevated)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${service.isActive ? 'var(--border-subtle)' : 'var(--border)'}`,
            opacity: service.isActive ? 1 : 0.6,
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', padding: '24px', flexWrap: 'wrap' }}>

              {/* Info */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {service.title}
                  </h3>
                  {!service.isActive && (
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                      Draft
                    </span>
                  )}
                </div>
                {service.description && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, maxWidth: '600px' }}>
                    {service.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} /> {service.durationMinutes} mins
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={16} /> {service.price.toLocaleString()} EGP
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
                  <Label style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px' }}>Active</Label>
                  <button
                    onClick={() => toggleStatus(service.id, service.isActive)}
                    style={{
                      width: '40px', height: '20px', borderRadius: '10px',
                      background: service.isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                      position: 'relative', cursor: 'pointer', border: 'none', transition: 'all 0.3s',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '2px',
                      left: service.isActive ? '22px' : '2px',
                      width: '16px', height: '16px', borderRadius: '50%',
                      background: 'white', transition: 'all 0.3s',
                    }} />
                  </button>
                </div>
                <Button variant="ghost" size="sm" style={{ padding: '0 8px', color: 'var(--text-secondary)' }}>
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

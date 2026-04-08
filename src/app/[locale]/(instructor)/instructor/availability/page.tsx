"use client";

import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, Repeat, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getInstructorAvailability,
  getBlockedDates,
  saveInstructorAvailability,
  addBlockedDate,
  deleteBlockedDate,
  DAY_NAMES,
  type PayloadAvailability,
  type PayloadBlockedDate,
} from '@/lib/instructor-api';

type TimeSlot = { start: string; end: string };
type WeeklyHours = Record<number, TimeSlot[]>;

const DEFAULT_HOURS: WeeklyHours = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

/** Convert 24h time string to 12h AM/PM format */
function formatAMPM(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  if (!Number.isFinite(h)) return time;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export default function InstructorAvailabilityPage() {
  const [activeTab,    setActiveTab]    = useState<'weekly' | 'overrides'>('weekly');
  const [hours,        setHours]        = useState<WeeklyHours>(DEFAULT_HOURS);
  const [blockedDates, setBlockedDates] = useState<PayloadBlockedDate[]>([]);
  const [newDate,      setNewDate]      = useState('');
  const [newReason,    setNewReason]    = useState('');
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');

  useEffect(() => {
    Promise.all([getInstructorAvailability(), getBlockedDates()]).then(([aRes, bRes]) => {
      if (aRes.success && aRes.data) {
        const mapped: WeeklyHours = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
        aRes.data.docs.forEach(a => {
          if (a.isActive) mapped[a.dayOfWeek].push({ start: a.startTime, end: a.endTime });
        });
        setHours(mapped);
      }
      if (bRes.success && bRes.data) setBlockedDates(bRes.data.docs);
      setLoading(false);
    });
  }, []);

  const addSlot = (day: number) => setHours(prev => ({ ...prev, [day]: [...prev[day], { start: '09:00', end: '17:00' }] }));
  const removeSlot = (day: number, idx: number) => setHours(prev => ({ ...prev, [day]: prev[day].filter((_, i) => i !== idx) }));
  const updateSlot = (day: number, idx: number, field: 'start' | 'end', val: string) =>
    setHours(prev => ({ ...prev, [day]: prev[day].map((s, i) => i === idx ? { ...s, [field]: val } : s) }));

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    const records = Object.entries(hours).flatMap(([day, slots]) =>
      slots.map(s => ({ dayOfWeek: Number(day) as PayloadAvailability['dayOfWeek'], startTime: s.start, endTime: s.end, isActive: true })),
    );
    const res = await saveInstructorAvailability(records);
    setSaving(false);
    if (!res.success) {
      setError(res.error || 'Failed to save availability');
      return;
    }
    setSuccess('Availability saved successfully');
  };

  const handleAddBlocked = async () => {
    if (!newDate) return;
    setError('');
    setSuccess('');
    const res = await addBlockedDate(newDate, newReason || undefined);
    if (res.success && res.data) {
      setBlockedDates(prev => [...prev, res.data!.doc]);
      setNewDate('');
      setNewReason('');
      setSuccess('Date blocked successfully');
      return;
    }
    setError(res.error || 'Failed to block selected date');
  };

  const handleDeleteBlocked = async (id: string) => {
    setError('');
    setSuccess('');
    const res = await deleteBlockedDate(id);
    if (!res.success) {
      setError(res.error || 'Failed to delete blocked date');
      return;
    }
    setBlockedDates(prev => prev.filter(b => b.id !== id));
    setSuccess('Blocked date removed');
  };

  const tabStyle = (active: boolean) => ({
    background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
    padding: '10px 16px', borderRadius: 'var(--radius-md)', border: 'none',
    cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: '8px',
  } as React.CSSProperties);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Availability Rules</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Set your weekly working hours and block out specific dates.</p>
        </div>
        {activeTab === 'weekly' && (
          <Button variant="primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', flexWrap: 'wrap' }}>
        <button style={tabStyle(activeTab === 'weekly')}   onClick={() => setActiveTab('weekly')}>
          <Repeat size={16} /> Weekly Hours
        </button>
        <button style={tabStyle(activeTab === 'overrides')} onClick={() => setActiveTab('overrides')}>
          <CalendarIcon size={16} /> Date Overrides
        </button>
      </div>

      {error ? <p style={{ margin: 0, color: '#ff4d4f' }}>{error}</p> : null}
      {success ? <p style={{ margin: 0, color: '#22c55e' }}>{success}</p> : null}

      {/* Weekly Hours */}
      {activeTab === 'weekly' && (
        <Card style={{ background: 'var(--bg-elevated)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)' }}>
          <CardHeader>
            <CardTitle>Standard Weekly Hours</CardTitle>
            <CardDescription>Configure the times you are regularly available for consultations.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {loading ? <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p> : [1,2,3,4,5,6,0].map(day => {
              const slots = hours[day];
              const hasSlots = slots.length > 0;
              return (
                <div key={day} style={{ display: 'flex', padding: '20px 16px', borderBottom: '1px solid var(--border-subtle)', alignItems: hasSlots ? 'flex-start' : 'center', gap: '24px', flexWrap: 'wrap' }}>
                  {/* Toggle */}
                  <div style={{ width: '140px', display: 'flex', alignItems: 'center', gap: '12px', marginTop: hasSlots ? '8px' : '0' }}>
                    <div
                      style={{ width: '40px', height: '20px', borderRadius: '10px', background: hasSlots ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}
                      onClick={() => hasSlots ? setHours(prev => ({ ...prev, [day]: [] })) : addSlot(day)}
                    >
                      <div style={{ position: 'absolute', top: '2px', left: hasSlots ? '22px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'white', transition: 'all 0.3s' }} />
                    </div>
                    <span style={{ fontWeight: 500, color: hasSlots ? 'var(--text-primary)' : 'var(--text-muted)' }}>{DAY_NAMES[day]}</span>
                  </div>
                  {/* Slots */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {!hasSlots ? (
                      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Unavailable</span>
                    ) : (
                      <>
                        {slots.map((slot, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <Input type="time" value={slot.start} onChange={e => updateSlot(day, idx, 'start', e.target.value)} style={{ width: '120px', minWidth: '100px' }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px', minWidth: '60px' }}>{formatAMPM(slot.start)}</span>
                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                            <Input type="time" value={slot.end} onChange={e => updateSlot(day, idx, 'end', e.target.value)} style={{ width: '120px', minWidth: '100px' }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px', minWidth: '60px' }}>{formatAMPM(slot.end)}</span>
                            <Button variant="ghost" size="sm" onClick={() => removeSlot(day, idx)} style={{ color: 'var(--text-muted)', padding: '0 8px' }}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" onClick={() => addSlot(day)} style={{ padding: '0 8px', color: 'var(--accent-primary)', opacity: 0.8, alignSelf: 'flex-start' }}>
                          <Plus size={16} style={{ marginRight: '6px' }} /> Add hours
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Date Overrides */}
      {activeTab === 'overrides' && (
        <Card style={{ background: 'var(--bg-elevated)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)' }}>
          <CardHeader>
            <CardTitle>Date Overrides</CardTitle>
            <CardDescription>Block off entire days for vacations or holidays.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Add form */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ width: '180px' }} />
              <Input placeholder="Reason (optional)" value={newReason} onChange={e => setNewReason(e.target.value)} style={{ flex: 1, minWidth: '200px' }} />
              <Button variant="primary" onClick={handleAddBlocked} disabled={!newDate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} /> Block Date
              </Button>
            </div>
            {/* List */}
            {blockedDates.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <CalendarIcon size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No blocked dates added yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {blockedDates.map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {new Date(b.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {b.reason && <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '12px' }}>{b.reason}</span>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteBlocked(b.id)} style={{ color: '#ff4d4f', padding: '0 8px' }}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

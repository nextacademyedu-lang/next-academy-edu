"use client";

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Video, FileText, Check, X, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getInstructorConsultationBookings,
  updateConsultationBookingStatus,
  getConsultationStudentName,
  getConsultationStudentEmail,
  getConsultationTypeTitle,
  getSlotDateTime,
  type PayloadConsultationBooking,
} from '@/lib/instructor-api';

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  confirmed: { color: '#C51B1B', bg: 'rgba(197,27,27,0.12)'  },
  pending:   { color: '#D6A32B', bg: 'rgba(214,163,43,0.14)' },
  completed: { color: '#8F9A8F', bg: 'rgba(143,154,143,0.16)' },
  cancelled: { color: '#C51B1B', bg: 'rgba(197,27,27,0.12)'  },
  no_show:   { color: '#C51B1B', bg: 'rgba(197,27,27,0.12)'  },
};

export default function InstructorConsultationBookingsPage() {
  const [bookings, setBookings] = useState<PayloadConsultationBooking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState('');

  useEffect(() => {
    getInstructorConsultationBookings().then(res => {
      if (res.success && res.data) setBookings(res.data.docs);
      setLoading(false);
    });
  }, []);

  const updateStatus = async (id: string, status: PayloadConsultationBooking['status']) => {
    const res = await updateConsultationBookingStatus(id, status);
    if (res.success) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    }
  };

  const filtered = bookings.filter(b =>
    getConsultationStudentName(b).toLowerCase().includes(query.toLowerCase()) ||
    getConsultationTypeTitle(b).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Consultation Bookings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Manage your 1-on-1 sessions with students.</p>
        </div>
        <div style={{ position: 'relative', width: 'min(100%, 280px)' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <Input
            placeholder="Search students..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: '38px', background: 'rgba(255,255,255,0.02)' }}
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No bookings found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(booking => {
            const { date, time } = getSlotDateTime(booking);
            const style = STATUS_STYLE[booking.status] ?? STATUS_STYLE.pending;
            return (
              <Card key={booking.id} style={{ background: 'var(--bg-elevated)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)' }}>
                <CardContent style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>

                    {/* Main Info */}
                    <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: style.color, backgroundColor: style.bg, padding: '4px 8px', borderRadius: '4px' }}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {getConsultationTypeTitle(booking)}
                        </span>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {getConsultationStudentName(booking)}
                        </h3>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                          {getConsultationStudentEmail(booking)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {date}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {time}</div>
                      </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div style={{ flex: '2 1 400px', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} /> Student Notes
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>"{booking.notes}"</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                      {booking.status === 'pending' && (
                        <>
                          <Button variant="primary" style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }} onClick={() => updateStatus(booking.id, 'confirmed')}>
                            <Check size={16} /> Approve
                          </Button>
                          <Button variant="outline" style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center', color: '#ff4d4f', borderColor: 'rgba(255,77,79,0.2)' }} onClick={() => updateStatus(booking.id, 'cancelled')}>
                            <X size={16} /> Decline
                          </Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && booking.meetingUrl && (
                        <a href={booking.meetingUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                          <Button variant="primary" style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <Video size={16} /> Join Call
                          </Button>
                        </a>
                      )}
                    </div>

                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

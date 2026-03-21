"use client";

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  getB2BBookings,
  getB2BBookingProgramTitle,
  getB2BBookingUserName,
  formatCurrency,
  type B2BBooking,
} from '@/lib/b2b-api';

const FILTERS = ['all', 'upcoming', 'completed'] as const;

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  confirmed:  { color: '#00e397', bg: 'rgba(0,227,151,0.1)'   },
  completed:  { color: '#888',    bg: 'rgba(255,255,255,0.05)' },
  pending:    { color: '#ffc107', bg: 'rgba(255,193,7,0.1)'   },
  cancelled:  { color: '#ff4d4f', bg: 'rgba(255,77,79,0.1)'   },
};

export default function B2BBookingsPage() {
  const [bookings, setBookings] = useState<B2BBooking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<typeof FILTERS[number]>('all');
  const [query,    setQuery]    = useState('');

  useEffect(() => {
    setLoading(true);
    getB2BBookings(filter).then(res => {
      if (res.success && res.data) setBookings(res.data.docs);
      setLoading(false);
    });
  }, [filter]);

  const filtered = bookings.filter(b =>
    getB2BBookingProgramTitle(b).toLowerCase().includes(query.toLowerCase()) ||
    getB2BBookingUserName(b).toLowerCase().includes(query.toLowerCase()),
  );

  const tabStyle = (active: boolean) => ({
    padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
    fontSize: '14px', fontWeight: active ? 600 : 400, transition: 'all 0.2s',
    background: active ? 'rgba(197,27,27,0.15)' : 'transparent',
    color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
  } as React.CSSProperties);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Team Bookings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>All program enrollments across your company.</p>
        </div>
        <div style={{ position: 'relative', width: 'min(100%, 280px)' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <Input
            placeholder="Search bookings..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: '38px', background: 'rgba(255,255,255,0.02)' }}
          />
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} style={tabStyle(filter === f)} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card style={{ background: 'var(--bg-elevated)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)' }}>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>{loading ? '…' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}</CardDescription>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {loading ? (
            <p style={{ padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
          ) : filtered.length === 0 ? (
            <p style={{ padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>No bookings found.</p>
          ) : filtered.map((booking, i) => {
            const style = STATUS_STYLE[booking.status] ?? STATUS_STYLE.pending;
            return (
              <div key={booking.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
                padding: '16px 24px',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {getB2BBookingProgramTitle(booking)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {getB2BBookingUserName(booking)} · {booking.bookingCode}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatCurrency(booking.totalAmount)}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '4px', color: style.color, background: style.bg }}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

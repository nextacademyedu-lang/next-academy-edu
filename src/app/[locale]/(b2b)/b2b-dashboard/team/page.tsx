"use client";

import React, { useEffect, useState } from 'react';
import { Search, UserCheck, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getB2BTeam, type B2BTeamMember } from '@/lib/b2b-api';

export default function B2BTeamPage() {
  const [members, setMembers] = useState<B2BTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState('');

  useEffect(() => {
    getB2BTeam().then(res => {
      if (res.success && res.data) setMembers(res.data.docs);
      setLoading(false);
    });
  }, []);

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
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <Input
            placeholder="Search employees..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: '38px', background: 'rgba(255,255,255,0.02)' }}
          />
        </div>
      </div>

      {/* Table */}
      <Card style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
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
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
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
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

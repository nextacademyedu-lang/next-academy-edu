"use client";

import React, { useEffect, useState } from 'react';
import { Users, BookOpen, DollarSign, TrendingUp, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import {
  getB2BDashboard,
  getB2BBookingProgramTitle,
  getB2BBookingUserName,
  formatCurrency,
  type B2BDashboardData,
} from '@/lib/b2b-api';

const STAT_COLORS = ['#00e397', '#1877F2', '#ffc107', '#C51B1B'];

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  confirmed:  { color: '#00e397', bg: 'rgba(0,227,151,0.1)'   },
  completed:  { color: '#888',    bg: 'rgba(255,255,255,0.05)' },
  pending:    { color: '#ffc107', bg: 'rgba(255,193,7,0.1)'   },
  cancelled:  { color: '#ff4d4f', bg: 'rgba(255,77,79,0.1)'   },
};

export default function B2BOverviewPage() {
  const { user } = useAuth();
  const [data,    setData]    = useState<B2BDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getB2BDashboard().then(res => {
      if (res.success && res.data) setData(res.data);
      setLoading(false);
    });
  }, []);

  const stats = [
    { title: 'Team Members',    value: data?.stats.team_size      ?? 0, icon: Users,      color: STAT_COLORS[0] },
    { title: 'Total Bookings',  value: data?.stats.total_bookings ?? 0, icon: BookOpen,   color: STAT_COLORS[1] },
    { title: 'Active Programs', value: data?.stats.active_programs ?? 0, icon: TrendingUp, color: STAT_COLORS[2] },
    { title: 'Total Spent',     value: data ? formatCurrency(data.stats.total_spent) : 'EGP 0', icon: DollarSign, color: STAT_COLORS[3] },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
          Company Dashboard{data?.company?.name ? ` — ${data.company.name}` : ''}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}. Here's your team's learning overview.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} style={{
              background: 'linear-gradient(135deg, rgba(26,26,26,0.6) 0%, rgba(10,10,10,0.8) 100%)',
              backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, right: 0, width: '150px', height: '150px',
                background: `radial-gradient(circle at top right, ${stat.color}20, transparent 70%)`,
                borderRadius: '50%', transform: 'translate(30%, -30%)',
              }} />
              <CardContent style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>{stat.title}</span>
                  <div style={{ backgroundColor: `${stat.color}15`, padding: '8px', borderRadius: '8px' }}>
                    <Icon size={20} color={stat.color} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {loading ? '—' : stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>

        {/* Recent Team Members */}
        <Card style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Recently active employees</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
            ) : !data?.team_members?.length ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No team members yet.</p>
            ) : data.team_members.slice(0, 5).map(member => (
              <div key={member.user.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)', flexShrink: 0 }}>
                    {member.user.firstName[0]}{member.user.lastName[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {member.user.firstName} {member.user.lastName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {member.profile?.jobTitle ?? member.user.email}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <UserCheck size={14} /> {member.bookings_count}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest team enrollments</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
            ) : !data?.recent_bookings?.length ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No bookings yet.</p>
            ) : data.recent_bookings.slice(0, 5).map(booking => {
              const style = STATUS_STYLE[booking.status] ?? STATUS_STYLE.pending;
              return (
                <div key={booking.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)',
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {getB2BBookingProgramTitle(booking)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {getB2BBookingUserName(booking)} · {formatCurrency(booking.totalAmount)}
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', color: style.color, background: style.bg }}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

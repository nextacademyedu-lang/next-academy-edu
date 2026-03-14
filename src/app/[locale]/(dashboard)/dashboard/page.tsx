"use client";

import React, { useEffect, useState } from 'react';
import { PlayCircle, Calendar, GraduationCap, ArrowRight, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  getUserBookings,
  getUserPayments,
  getUserNotifications,
  getProgramTitle,
  getMeetingUrl,
  type PayloadBooking,
  type PayloadPayment,
  type PayloadNotification,
  type PayloadRound,
} from '@/lib/dashboard-api';
import styles from './overview.module.css';

const NOTIFICATION_BORDER: Record<string, string> = {
  booking_confirmed:    '#00e397',
  payment_received:     '#00e397',
  payment_reminder:     '#ffc107',
  round_starting:       '#1877F2',
  session_reminder:     '#1877F2',
  booking_cancelled:    '#ff4d4f',
  round_cancelled:      '#ff4d4f',
  consultation_confirmed: '#00e397',
  consultation_reminder:  '#1877F2',
};

export default function UserDashboardOverview() {
  const { user } = useAuth();
  const locale   = useLocale();

  const [bookings,      setBookings]      = useState<PayloadBooking[]>([]);
  const [payments,      setPayments]      = useState<PayloadPayment[]>([]);
  const [notifications, setNotifications] = useState<PayloadNotification[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      getUserBookings(),
      getUserPayments(),
      getUserNotifications(),
    ]).then(([bRes, pRes, nRes]) => {
      if (bRes.success && bRes.data) setBookings(bRes.data.docs);
      if (pRes.success && pRes.data) setPayments(pRes.data.docs);
      if (nRes.success && nRes.data) setNotifications(nRes.data.docs);
      setLoading(false);
    });
  }, []);

  // Computed stats
  const completedPrograms = bookings.filter(b => b.status === 'completed').length;
  const activeBookings    = bookings.filter(b => b.status === 'confirmed');
  const pendingPayments   = payments.filter(p => p.status === 'pending' || p.status === 'overdue').length;

  // Next upcoming session from confirmed bookings
  const nextSession = (() => {
    const confirmed = activeBookings
      .map(b => {
        const round = b.round as PayloadRound;
        if (!round || typeof round === 'string') return null;
        return { booking: b, round };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a!.round.startDate).getTime() - new Date(b!.round.startDate).getTime());

    if (!confirmed.length || !confirmed[0]) return null;
    const { booking, round } = confirmed[0];
    return {
      title:      getProgramTitle(booking),
      date:       new Date(round.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time:       new Date(round.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      zoomLink:   getMeetingUrl(booking),
    };
  })();

  const stats = [
    { title: 'Completed Programs', value: completedPrograms, icon: GraduationCap, color: '#00e397' },
    { title: 'Active Bookings',    value: activeBookings.length, icon: Calendar,      color: '#1877F2' },
    { title: 'Pending Payments',   value: pendingPayments,       icon: CreditCard,    color: '#ff4d4f' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
          Good Morning{user?.firstName ? `, ${user.firstName}` : ''}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Here&apos;s what&apos;s happening with your learning journey today.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} style={{
              background: 'linear-gradient(135deg, rgba(26,26,26,0.6) 0%, rgba(10,10,10,0.8) 100%)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden',
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
                <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {loading ? '—' : stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className={styles.mainGrid}>

        {/* Next Session */}
        <Card style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardHeader>
            <CardTitle>Next Up</CardTitle>
            <CardDescription>Your next scheduled live session</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
            ) : nextSession ? (
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px',
              }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {nextSession.title}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
                    <Calendar size={16} /><span>{nextSession.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
                    <PlayCircle size={16} /><span>{nextSession.time}</span>
                  </div>
                </div>
                <div>
                  {nextSession.zoomLink ? (
                    <a href={nextSession.zoomLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                      <Button variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Join Session <ArrowRight size={16} />
                      </Button>
                    </a>
                  ) : (
                    <Button variant="outline" disabled style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Link not available yet
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                  No upcoming sessions scheduled.
                </p>
                <Link href={`/${locale}/programs`} style={{ textDecoration: 'none' }}>
                  <Button variant="outline" size="sm">Browse Programs</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
            ) : notifications.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No recent activity.</p>
            ) : notifications.map(n => (
              <div key={n.id} style={{
                padding: '16px', background: 'rgba(255,255,255,0.02)',
                borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px',
                borderLeft: `3px solid ${NOTIFICATION_BORDER[n.type] ?? '#555'}`,
              }}>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
                  {n.title}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {n.message}
                </p>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

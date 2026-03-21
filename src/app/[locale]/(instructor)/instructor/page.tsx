"use client";

import React, { useEffect, useState } from 'react';
import { Users, Calendar, Video, ArrowRight, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import {
  getInstructorSessions,
  getInstructorConsultationBookings,
  getSessionProgramTitle,
  getSessionRoundTitle,
  getConsultationStudentName,
  getConsultationTypeTitle,
  getSlotDateTime,
  type PayloadSession,
  type PayloadConsultationBooking,
} from '@/lib/instructor-api';

const STAT_COLORS = ['#C51B1B', '#D6A32B', '#8F9A8F'];

export default function InstructorOverviewPage() {
  const { user } = useAuth();

  const [sessions,       setSessions]       = useState<PayloadSession[]>([]);
  const [consultations,  setConsultations]  = useState<PayloadConsultationBooking[]>([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    Promise.all([
      getInstructorSessions(),
      getInstructorConsultationBookings(),
    ]).then(([sRes, cRes]) => {
      if (sRes.success && sRes.data) setSessions(sRes.data.docs);
      if (cRes.success && cRes.data) setConsultations(cRes.data.docs);
      setLoading(false);
    });
  }, []);

  const upcomingSessions     = sessions.filter(s => s.status === 'scheduled' || s.status === 'live');
  const upcomingConsultations = consultations.filter(c => c.status === 'confirmed' || c.status === 'pending');

  // Unique students across all sessions (rough count via attendanceCount)
  const totalStudents = sessions.reduce((acc, s) => acc + (s.attendanceCount ?? 0), 0);

  const stats = [
    { title: 'Total Students',          value: loading ? '—' : totalStudents,                  color: STAT_COLORS[0], icon: Users    },
    { title: 'Upcoming Sessions',        value: loading ? '—' : upcomingSessions.length,         color: STAT_COLORS[1], icon: Video    },
    { title: 'Consultation Bookings',    value: loading ? '—' : upcomingConsultations.length,    color: STAT_COLORS[2], icon: Calendar },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
          Instructor Dashboard{user?.firstName ? `, ${user.firstName}` : ''}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Overview of your teaching schedule and student engagements.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} style={{
              background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-subtle)',
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
                <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>

        {/* Upcoming Sessions */}
        <Card style={{ background: 'var(--bg-elevated)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)' }}>
          <CardHeader style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your classes for this week</CardDescription>
            </div>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
            ) : upcomingSessions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No upcoming sessions.</p>
            ) : upcomingSessions.slice(0, 3).map(session => (
              <div key={session.id} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--accent-primary)', backgroundColor: 'var(--accent-primary-10)', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {getSessionRoundTitle(session) || 'Session'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} /> {session.attendanceCount ?? 0} Students
                    </span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {getSessionProgramTitle(session)}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {session.meetingUrl ? (
                    <a href={session.meetingUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                      <Button variant="primary" style={{ width: '100%' }}>Start Meeting</Button>
                    </a>
                  ) : (
                    <Button variant="outline" style={{ flex: 1 }} disabled>No link yet</Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Consultations */}
        <Card style={{ background: 'var(--bg-elevated)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)' }}>
          <CardHeader style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <CardTitle>Recent Consultations</CardTitle>
              <CardDescription>Upcoming 1:1 bookings</CardDescription>
            </div>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
            ) : upcomingConsultations.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No upcoming consultations.</p>
            ) : upcomingConsultations.slice(0, 4).map(consult => {
              const { date, time } = getSlotDateTime(consult);
              return (
                <div key={consult.id} style={{
                  padding: '16px', background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0 }}>
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {getConsultationStudentName(consult)}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {getConsultationTypeTitle(consult)} • {date} {time}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '12px', fontWeight: 600, padding: '4px 8px', borderRadius: '4px',
                    color: consult.status === 'confirmed' ? 'var(--accent-primary)' : 'var(--accent-gold)',
                    background: consult.status === 'confirmed' ? 'var(--accent-primary-10)' : 'var(--accent-gold-15)',
                  }}>
                    {consult.status.charAt(0).toUpperCase() + consult.status.slice(1)}
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

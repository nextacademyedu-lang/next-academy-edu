"use client";

import React, { useEffect, useState } from 'react';
import { Video, Calendar, Clock, FileText, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getInstructorSessions,
  getSessionProgramTitle,
  getSessionRoundTitle,
  type PayloadSession,
} from '@/lib/instructor-api';

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  scheduled: { color: '#D6A32B', bg: 'rgba(214,163,43,0.14)' },
  live:      { color: '#C51B1B', bg: 'rgba(197,27,27,0.12)'  },
  completed: { color: '#8F9A8F', bg: 'rgba(143,154,143,0.16)' },
  cancelled: { color: '#C51B1B', bg: 'rgba(197,27,27,0.12)'  },
};

export default function InstructorSessionsPage() {
  const [sessions, setSessions] = useState<PayloadSession[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState('');

  useEffect(() => {
    getInstructorSessions().then(res => {
      if (res.success && res.data) setSessions(res.data.docs);
      setLoading(false);
    });
  }, []);

  const filtered = sessions.filter(s =>
    getSessionProgramTitle(s).toLowerCase().includes(query.toLowerCase()) ||
    getSessionRoundTitle(s).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>My Sessions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Manage your upcoming classes, join links, and learning materials.</p>
        </div>
        <div style={{ position: 'relative', width: 'min(100%, 280px)' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <Input
            placeholder="Search sessions..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: '38px', background: 'rgba(255,255,255,0.02)' }}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No sessions found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filtered.map(session => {
            const style = STATUS_STYLE[session.status] ?? STATUS_STYLE.completed;
            const label = session.status.charAt(0).toUpperCase() + session.status.slice(1);
            return (
              <Card key={session.id} style={{
                background: 'var(--bg-elevated)', backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column',
              }}>
                <CardHeader style={{ paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-primary)', backgroundColor: 'var(--accent-primary-10)', padding: '4px 8px', borderRadius: '4px' }}>
                      {getSessionRoundTitle(session) || 'Session'}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: style.color, backgroundColor: style.bg, padding: '4px 8px', borderRadius: '4px' }}>
                      {label}
                    </span>
                  </div>
                  <CardTitle style={{ fontSize: '20px', lineHeight: 1.3 }}>{getSessionProgramTitle(session)}</CardTitle>
                  {session.title && <CardDescription style={{ marginTop: '4px' }}>{session.title}</CardDescription>}
                </CardHeader>

                <CardContent style={{ flex: 1, paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} />
                      {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    {session.startTime && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} /> {session.startTime}{session.endTime ? ` - ${session.endTime}` : ''}
                      </div>
                    )}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Enrolled Students</span>
                    <span style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>{session.attendanceCount ?? 0}</span>
                  </div>
                </CardContent>

                <CardFooter style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {(session.status === 'scheduled' || session.status === 'live') && session.meetingUrl && (
                    <a href={session.meetingUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                      <Button variant="primary" style={{ width: '100%' }}>
                        <Video size={16} style={{ marginRight: '8px' }} /> Start Meeting
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" style={{ flex: 1 }}>
                    <FileText size={16} style={{ marginRight: '8px' }} />
                    {session.status === 'completed' ? 'View Materials' : 'Edit Materials'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

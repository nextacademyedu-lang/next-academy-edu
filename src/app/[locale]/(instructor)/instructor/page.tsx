"use client";

import React from 'react';
import { Users, Calendar, Video, ArrowRight, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data
const STATS = [
  {
    title: 'Total Students',
    value: '1,248',
    icon: Users,
    iconColor: '#00e397'
  },
  {
    title: 'Upcoming Sessions',
    value: '4',
    icon: Video,
    iconColor: '#1877F2'
  },
  {
    title: 'Consultation Bookings',
    value: '12',
    icon: Calendar,
    iconColor: '#ffc107'
  }
];

const UPCOMING_SESSIONS = [
  {
    id: 1,
    title: 'Advanced AI Strategies for Business',
    type: 'Workshop',
    date: 'Oct 24, 2026',
    time: '18:00 - 20:00 GMT+3',
    enrolled: 45
  },
  {
    id: 2,
    title: 'Growth Marketing Fundamentals',
    type: 'Course - Session 2',
    date: 'Oct 26, 2026',
    time: '19:00 - 21:00 GMT+3',
    enrolled: 120
  }
];

const RECENT_CONSULTATIONS = [
  { id: 1, student: 'Omar Hassan', type: '30m Strategy Call', date: 'Oct 25, 2026 - 14:00', status: 'Confirmed' },
  { id: 2, student: 'Sarah Mansour', type: '1h Deep Dive', date: 'Oct 25, 2026 - 15:30', status: 'Pending' },
];

export default function InstructorOverviewPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
          Instructor Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Overview of your teaching schedule and student engagements.
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} style={{ 
              background: `linear-gradient(135deg, rgba(26,26,26,0.6) 0%, rgba(10,10,10,0.8) 100%)`, 
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0, right: 0, width: '150px', height: '150px',
                background: `radial-gradient(circle at top right, ${stat.iconColor}20, transparent 70%)`,
                borderRadius: '50%',
                transform: 'translate(30%, -30%)'
              }} />
              <CardContent style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>{stat.title}</span>
                  <div style={{ backgroundColor: `${stat.iconColor}15`, padding: '8px', borderRadius: '8px' }}>
                    <Icon size={20} color={stat.iconColor} />
                  </div>
                </div>
                <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Next Sessions */}
        <Card style={{ 
          background: 'rgba(255,255,255,0.03)', 
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <CardHeader style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your classes for this week</CardDescription>
            </div>
            <Button variant="outline" size="sm">View Calendar</Button>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {UPCOMING_SESSIONS.map(session => (
              <div key={session.id} style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--accent-primary)', backgroundColor: 'rgba(0, 227, 151, 0.1)', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {session.type}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} /> {session.enrolled} Students
                    </span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {session.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} /> {session.date}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Video size={14} /> {session.time}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="primary" style={{ flex: 1, padding: '0' }}>Start Meeting</Button>
                  <Button variant="outline" style={{ flex: 1, padding: '0' }}>Manage Materials</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Consultations */}
        <Card style={{ 
          background: 'rgba(255,255,255,0.03)', 
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <CardHeader style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <CardTitle>Recent Consultations</CardTitle>
              <CardDescription>Upcoming 1:1 bookings</CardDescription>
            </div>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {RECENT_CONSULTATIONS.map(consult => (
              <div key={consult.id} style={{ 
                padding: '16px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>{consult.student}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{consult.type} • {consult.date}</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" style={{ padding: '0 12px' }}>Details</Button>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

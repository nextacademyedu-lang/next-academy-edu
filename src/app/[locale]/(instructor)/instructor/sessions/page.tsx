"use client";

import React from 'react';
import { Video, Calendar, Clock, FileText, Search, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Mock Data
const INSTRUCTOR_SESSIONS = [
  {
    id: 1,
    programName: 'Advanced AI Strategies for Business',
    type: 'Workshop',
    round: 'Cohort 3 - Fall 2026',
    date: 'Oct 24, 2026',
    time: '18:00 - 20:00 GMT+3',
    studentsCount: 45,
    status: 'Upcoming',
    zoomLink: 'https://zoom.us/mock',
    materialsUploaded: 2
  },
  {
    id: 2,
    programName: 'Growth Marketing Fundamentals',
    type: 'Course - Session 2',
    round: 'Cohort 1 - Summer 2026',
    date: 'Oct 26, 2026',
    time: '19:00 - 21:00 GMT+3',
    studentsCount: 120,
    status: 'Upcoming',
    zoomLink: 'https://zoom.us/mock',
    materialsUploaded: 0
  },
  {
    id: 3,
    programName: 'Generative AI for Marketing',
    type: 'Webinar',
    round: 'One-off Event',
    date: 'Oct 20, 2026',
    time: '17:00 - 18:30 GMT+3',
    studentsCount: 350,
    status: 'Completed',
    zoomLink: null,
    materialsUploaded: 1
  }
];

export default function InstructorSessionsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
            My Sessions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Manage your upcoming classes, join links, and learning materials.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <Input placeholder="Search sessions..." style={{ paddingLeft: '38px', background: 'rgba(255,255,255,0.02)' }} />
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        {INSTRUCTOR_SESSIONS.map((session) => (
          <Card key={session.id} style={{ 
            background: 'rgba(255,255,255,0.03)', 
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardHeader style={{ paddingBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--accent-primary)',
                  backgroundColor: 'rgba(0, 227, 151, 0.1)',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {session.type}
                </span>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: 500,
                  color: session.status === 'Upcoming' ? '#1877F2' : '#888888',
                  backgroundColor: session.status === 'Upcoming' ? 'rgba(24, 119, 242, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {session.status}
                </span>
              </div>
              <CardTitle style={{ fontSize: '20px', lineHeight: 1.3 }}>{session.programName}</CardTitle>
              <CardDescription style={{ marginTop: '4px' }}>{session.round}</CardDescription>
            </CardHeader>
            
            <CardContent style={{ flex: 1, paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} />
                  <span>{session.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} />
                  <span>{session.time}</span>
                </div>
              </div>

              <div style={{ 
                background: 'rgba(255,255,255,0.02)', 
                padding: '12px', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '8px'
              }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Enrolled Students
                </div>
                <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {session.studentsCount}
                </div>
              </div>

              <div style={{ 
                background: 'rgba(255,255,255,0.02)', 
                padding: '12px', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Materials Uploaded
                </div>
                <div style={{ fontSize: '15px', fontWeight: session.materialsUploaded > 0 ? 600 : 400, color: session.materialsUploaded > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {session.materialsUploaded} files
                </div>
              </div>

            </CardContent>

            <CardFooter style={{ 
              borderTop: '1px solid rgba(255,255,255,0.05)', 
              paddingTop: '16px',
              display: 'flex',
              gap: '12px'
            }}>
              {session.status === 'Upcoming' && session.zoomLink && (
                <Button variant="primary" style={{ flex: 1, padding: '0 12px' }}>
                  <Video size={16} style={{ marginRight: '8px' }} /> Start Meeting
                </Button>
              )}
              {session.status === 'Upcoming' && (
                <Button variant="outline" style={{ flex: 1, padding: '0 12px' }}>
                  <FileText size={16} style={{ marginRight: '8px' }} /> Edit Materials
                </Button>
              )}
              {session.status === 'Completed' && (
                <Button variant="outline" style={{ flex: 1, padding: '0 12px' }}>
                  <FileText size={16} style={{ marginRight: '8px' }} /> View Materials
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { Calendar, Clock, Video, FileText, Check, X, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Mock Bookings
const CONSULTATION_BOOKINGS = [
  {
    id: 1,
    studentName: 'Omar Hassan',
    studentEmail: 'omar.hassan@example.com',
    type: '30m Strategy Call',
    date: 'Oct 25, 2026',
    time: '14:00 - 14:30 GMT+3',
    status: 'Confirmed',
    notes: 'I would like to discuss my current startup marketing plan and get feedback on our Q4 goals.',
    meetingLink: 'https://zoom.us/mock-link'
  },
  {
    id: 2,
    studentName: 'Sarah Mansour',
    studentEmail: 'sarah.m@example.com',
    type: '1h Deep Dive Consultation',
    date: 'Oct 25, 2026',
    time: '15:30 - 16:30 GMT+3',
    status: 'Pending',
    notes: 'Looking for advice on transitioning my career from sales to product management in tech.',
    meetingLink: null
  },
  {
    id: 3,
    studentName: 'Khaled Ibrahim',
    studentEmail: 'khaled.ibra@example.com',
    type: 'Resume & Portfolio Review',
    date: 'Oct 22, 2026',
    time: '10:00 - 10:45 GMT+3',
    status: 'Completed',
    notes: 'Can you please review the attached portfolio before our call?',
    meetingLink: null
  }
];

export default function InstructorConsultationBookingsPage() {
  const [filter, setFilter] = useState('All');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Consultation Bookings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Manage your 1-on-1 sessions with students.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <Input placeholder="Search students..." style={{ paddingLeft: '38px', background: 'rgba(255,255,255,0.02)' }} />
          </div>
          <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} /> Filter
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {CONSULTATION_BOOKINGS.map(booking => (
          <Card key={booking.id} style={{ 
            background: 'rgba(255,255,255,0.02)', 
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', padding: '24px' }}>
              
              {/* Main Info */}
              <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    color: booking.status === 'Confirmed' ? '#00e397' : booking.status === 'Completed' ? '#888888' : '#ffc107',
                    backgroundColor: booking.status === 'Confirmed' ? 'rgba(0, 227, 151, 0.1)' : booking.status === 'Completed' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 193, 7, 0.1)',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {booking.status}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {booking.type}
                  </span>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {booking.studentName}
                  </h3>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {booking.studentEmail}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} /> {booking.date}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} /> {booking.time}
                  </div>
                </div>
              </div>

              {/* Notes Area */}
              <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} /> Student Notes
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  "{booking.notes}"
                </p>
              </div>

              {/* Actions */}
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                {booking.status === 'Pending' && (
                  <>
                    <Button variant="primary" style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <Check size={16} /> Approve
                    </Button>
                    <Button variant="outline" style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center', color: '#ff4d4f', borderColor: 'rgba(255,77,79,0.2)' }}>
                      <X size={16} /> Decline
                    </Button>
                  </>
                )}
                
                {booking.status === 'Confirmed' && booking.meetingLink && (
                  <Button variant="primary" style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <Video size={16} /> Join Call
                  </Button>
                )}
                {booking.status === 'Confirmed' && (
                  <Button variant="outline" style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    Reschedule
                  </Button>
                )}
              </div>
              
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}

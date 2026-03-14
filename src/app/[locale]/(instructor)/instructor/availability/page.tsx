"use client";

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Repeat, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Mock Default hours
const INITIAL_HOURS = {
  'Monday': [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '17:00' }],
  'Tuesday': [{ start: '09:00', end: '13:00' }],
  'Wednesday': [],
  'Thursday': [{ start: '10:00', end: '16:00' }],
  'Friday': [],
  'Saturday': [],
  'Sunday': []
};

export default function InstructorAvailabilityPage() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'overrides'>('weekly');
  const [hours, setHours] = useState<Record<string, {start: string, end: string}[]>>(INITIAL_HOURS);

  const addTimeSlot = (day: string) => {
    setHours(prev => ({
      ...prev,
      [day]: [...prev[day], { start: '09:00', end: '17:00' }]
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setHours(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  const hasHours = (day: string) => hours[day].length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Availability Rules
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Set your weekly working hours and block out specific dates for vacations.
          </p>
        </div>
        <Button variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
        <button 
          onClick={() => setActiveTab('weekly')}
          style={{ 
            background: activeTab === 'weekly' ? 'rgba(255,255,255,0.05)' : 'transparent',
            color: activeTab === 'weekly' ? 'var(--text-primary)' : 'var(--text-muted)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Repeat size={16} /> Weekly Hours
        </button>
        <button 
          onClick={() => setActiveTab('overrides')}
          style={{ 
            background: activeTab === 'overrides' ? 'rgba(255,255,255,0.05)' : 'transparent',
            color: activeTab === 'overrides' ? 'var(--text-primary)' : 'var(--text-muted)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CalendarIcon size={16} /> Date Overrides
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'weekly' && (
        <Card style={{ 
          background: 'rgba(255,255,255,0.02)', 
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <CardHeader>
            <CardTitle>Standard Weekly Hours</CardTitle>
            <CardDescription>Configure the times you are regularly available for consultations and sessions.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {WEEKDAYS.map(day => (
              <div key={day} style={{ 
                display: 'flex', 
                padding: '20px 16px', 
                borderBottom: '1px solid rgba(255,255,255,0.02)',
                alignItems: hasHours(day) ? 'flex-start' : 'center',
                gap: '24px'
              }}>
                
                {/* Day Toggle Area */}
                <div style={{ width: '140px', display: 'flex', alignItems: 'center', gap: '12px', marginTop: hasHours(day) ? '8px' : '0' }}>
                  <div style={{
                    width: '40px', height: '20px', 
                    borderRadius: '10px', 
                    background: hasHours(day) ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }} onClick={() => {
                    if (hasHours(day)) {
                      setHours(prev => ({ ...prev, [day]: [] }));
                    } else {
                      addTimeSlot(day);
                    }
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '2px',
                      left: hasHours(day) ? '22px' : '2px',
                      width: '16px', height: '16px',
                      borderRadius: '50%',
                      background: 'white',
                      transition: 'all 0.3s'
                    }} />
                  </div>
                  <span style={{ fontWeight: 500, color: hasHours(day) ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {day}
                  </span>
                </div>

                {/* Time Slots Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {!hasHours(day) ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Unavailable</div>
                  ) : (
                    <>
                      {hours[day].map((slot, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Input type="time" defaultValue={slot.start} style={{ width: '120px' }} />
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                          <Input type="time" defaultValue={slot.end} style={{ width: '120px' }} />
                          <Button variant="ghost" size="sm" onClick={() => removeTimeSlot(day, idx)} style={{ color: 'var(--text-muted)', padding: '0 8px' }}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                      <div>
                        <Button variant="ghost" size="sm" onClick={() => addTimeSlot(day)} style={{ padding: '0 8px', color: 'var(--accent-primary)', opacity: 0.8 }}>
                          <Plus size={16} style={{ marginRight: '6px' }} /> Add hours
                        </Button>
                      </div>
                    </>
                  )}
                </div>

              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'overrides' && (
        <Card style={{ 
          background: 'rgba(255,255,255,0.02)', 
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <CardHeader>
            <CardTitle>Date Overrides</CardTitle>
            <CardDescription>Block off entire days or change your availability for specific dates (e.g., vacations, holidays).</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '32px' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '32px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              border: '1px dashed rgba(255,255,255,0.1)'
            }}>
              <CalendarIcon size={32} color="var(--text-muted)" />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>No overrides added</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Add specific dates when your availability changes from the weekly schedule.</p>
              </div>
              <Button variant="outline">
                <Plus size={16} style={{ marginRight: '8px' }} /> Add Date Override
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

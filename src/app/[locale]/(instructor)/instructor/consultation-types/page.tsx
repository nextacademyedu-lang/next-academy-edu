"use client";

import React, { useState } from 'react';
import { Plus, Clock, DollarSign, Settings2, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Mock Services
const MOCK_SERVICES = [
  {
    id: 1,
    title: '30m Strategy Call',
    description: 'A quick 1-on-1 session to discuss your high-level strategy and immediate blockers.',
    duration: 30, // minutes
    price: 150, // in USD or EGP depending on context, mock as generic value
    isActive: true,
  },
  {
    id: 2,
    title: '1h Deep Dive Consultation',
    description: 'In-depth review of your business model, growth plans, or specific technical challenges.',
    duration: 60,
    price: 250,
    isActive: true,
  },
  {
    id: 3,
    title: 'Resume & Portfolio Review',
    description: 'Detailed analysis of your resume and portfolio with actionable feedback.',
    duration: 45,
    price: 100,
    isActive: false,
  }
];

export default function InstructorServicesPage() {
  const [services, setServices] = useState(MOCK_SERVICES);

  const toggleStatus = (id: number) => {
    setServices(services.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Consultation Services
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Manage the 1-on-1 consultation types you offer to students.
          </p>
        </div>
        <Button variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Create New Service
        </Button>
      </div>

      {/* Services List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {services.map(service => (
          <Card key={service.id} style={{ 
            background: 'rgba(255,255,255,0.02)', 
            backdropFilter: 'blur(12px)',
            border: `1px solid ${service.isActive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)'}`,
            opacity: service.isActive ? 1 : 0.6,
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', padding: '24px' }}>
              
              {/* Info Area */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {service.title}
                  </h3>
                  {!service.isActive && (
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>Draft</span>
                  )}
                </div>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, maxWidth: '600px' }}>
                  {service.description}
                </p>

                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} /> {service.duration} mins
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={16} /> ${service.price}
                  </div>
                </div>
              </div>

              {/* Actions Area */}
              <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
                  <Label htmlFor={`status-${service.id}`} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>Active</Label>
                  <button 
                    id={`status-${service.id}`}
                    onClick={() => toggleStatus(service.id)}
                    style={{
                      width: '40px', height: '20px', 
                      borderRadius: '10px', 
                      background: service.isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                      position: 'relative',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '2px',
                      left: service.isActive ? '22px' : '2px',
                      width: '16px', height: '16px',
                      borderRadius: '50%',
                      background: 'white',
                      transition: 'all 0.3s'
                    }} />
                  </button>
                </div>
                <Button variant="ghost" size="sm" style={{ padding: '0 8px', color: 'var(--text-secondary)' }}>
                  <Edit2 size={18} />
                </Button>
                <Button variant="ghost" size="sm" style={{ padding: '0 8px', color: '#ff4d4f' }}>
                  <Trash2 size={18} />
                </Button>
              </div>

            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}

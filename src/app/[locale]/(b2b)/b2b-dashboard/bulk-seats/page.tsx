"use client";

import React, { useEffect, useState } from 'react';
import { Package, UserPlus, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';

/* ── Types ────────────────────────────────────────────────── */
interface Allocation {
  user: { id: string; firstName: string; lastName: string; email: string } | string;
  allocatedAt: string;
  status: 'pending' | 'enrolled' | 'cancelled';
}

interface BulkSeatDoc {
  id: string;
  company: { id: string; name: string } | string;
  round: { id: string; program?: { titleAr?: string; titleEn?: string } | string } | string;
  totalSeats: number;
  allocations: Allocation[];
  status: 'active' | 'expired' | 'cancelled';
  purchaseDate?: string;
}

/* ── Helpers ──────────────────────────────────────────────── */
function getRoundLabel(round: BulkSeatDoc['round']): string {
  if (typeof round === 'string') return `Round ${round}`;
  const prog = round.program;
  if (!prog) return `Round ${round.id}`;
  if (typeof prog === 'string') return prog;
  return prog.titleEn || prog.titleAr || `Round ${round.id}`;
}

function getUserName(user: Allocation['user']): string {
  if (typeof user === 'string') return user;
  return `${user.firstName} ${user.lastName}`;
}

function getUserEmail(user: Allocation['user']): string {
  if (typeof user === 'string') return '';
  return user.email;
}

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  enrolled:  { color: '#00e397', bg: 'rgba(0,227,151,0.1)' },
  pending:   { color: '#ffc107', bg: 'rgba(255,193,7,0.1)' },
  cancelled: { color: '#ff4d4f', bg: 'rgba(255,77,79,0.1)' },
};

/* ── Component ────────────────────────────────────────────── */
export default function BulkSeatsPage() {
  const { user } = useAuth();
  const [docs, setDocs]       = useState<BulkSeatDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [allocating, setAllocating] = useState<string | null>(null); // bulkSeatId being allocated

  useEffect(() => {
    fetch('/api/bulk-seat-allocations?depth=2&limit=50')
      .then(r => r.json())
      .then(res => {
        setDocs(res.docs ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load bulk seat data');
        setLoading(false);
      });
  }, []);

  const handleAllocate = async (bulkSeatId: string, userId: string) => {
    setAllocating(bulkSeatId);
    try {
      const res = await fetch('/api/bulk-seats/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulkSeatId, userId }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh data
        const refreshed = await fetch('/api/bulk-seat-allocations?depth=2&limit=50');
        const refreshData = await refreshed.json();
        setDocs(refreshData.docs ?? []);
      } else {
        setError(data.error || 'Allocation failed');
      }
    } catch {
      setError('Network error during allocation');
    } finally {
      setAllocating(null);
    }
  };

  /* ── Render states ─────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading bulk seats…</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
          Bulk Seat Management
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Manage and allocate purchased seats for your team across programs.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 16px', borderRadius: 'var(--radius-md)',
          background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.2)',
          color: '#ff4d4f', fontSize: '14px',
        }}>
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Empty state */}
      {docs.length === 0 && (
        <Card style={{
          background: 'var(--bg-elevated)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-subtle)', textAlign: 'center', padding: '60px 24px',
        }}>
          <CardContent>
            <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: 500 }}>No bulk seat purchases yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
              Contact us to purchase bulk seats for your team.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Bulk seat cards */}
      {docs.map(doc => {
        const activeAllocations = (doc.allocations ?? []).filter(a => a.status !== 'cancelled');
        const used = activeAllocations.length;
        const total = doc.totalSeats;
        const pct = total > 0 ? Math.round((used / total) * 100) : 0;

        return (
          <Card key={doc.id} style={{
            background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)',
          }}>
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <CardTitle>{getRoundLabel(doc.round)}</CardTitle>
                  <CardDescription style={{ marginTop: '4px' }}>
                    {used} / {total} seats allocated
                    {doc.status !== 'active' && (
                      <span style={{ marginLeft: '8px', color: '#ff4d4f', fontWeight: 600 }}>({doc.status})</span>
                    )}
                  </CardDescription>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: 'var(--radius-md)',
                  background: `${pct >= 100 ? '#ff4d4f' : '#00e397'}15`,
                  color: pct >= 100 ? '#ff4d4f' : '#00e397',
                  fontSize: '14px', fontWeight: 700,
                }}>
                  <Users size={16} />
                  {total - used} remaining
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                width: '100%', height: '6px', borderRadius: '3px',
                background: 'rgba(255,255,255,0.05)', marginTop: '12px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${Math.min(pct, 100)}%`, height: '100%',
                  borderRadius: '3px',
                  background: pct >= 100
                    ? 'linear-gradient(90deg, #ff4d4f, #ff7875)'
                    : 'linear-gradient(90deg, #00e397, #00c784)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </CardHeader>

            <CardContent>
              {/* Allocations table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(doc.allocations ?? []).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '16px 0', textAlign: 'center' }}>
                    No seats allocated yet. Use the admin panel to assign seats.
                  </p>
                ) : (
                  doc.allocations.map((alloc, idx) => {
                    const style = STATUS_COLORS[alloc.status] ?? STATUS_COLORS.pending;
                    return (
                      <div key={idx} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                        padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)',
                      }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: 600, color: 'var(--accent-primary)', flexShrink: 0,
                          }}>
                            {typeof alloc.user === 'object' ? `${alloc.user.firstName[0]}${alloc.user.lastName[0]}` : '?'}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                              {getUserName(alloc.user)}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {getUserEmail(alloc.user)}
                            </div>
                          </div>
                        </div>
                        <span style={{
                          fontSize: '12px', fontWeight: 600,
                          padding: '4px 8px', borderRadius: '4px',
                          color: style.color, background: style.bg,
                        }}>
                          {alloc.status.charAt(0).toUpperCase() + alloc.status.slice(1)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

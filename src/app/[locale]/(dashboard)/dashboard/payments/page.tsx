"use client";

import React, { useEffect, useState } from 'react';
import { CreditCard, Download, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getUserPayments,
  getUserBookings,
  getProgramTitle,
  formatCurrency,
  type PayloadPayment,
  type PayloadBooking,
} from '@/lib/dashboard-api';

interface EnrichedPayment extends PayloadPayment {
  programTitle: string;
  bookingId: string;
}

export default function PaymentsPage() {
  const locale = useLocale();
  const [tab,        setTab]        = useState<'pending' | 'history'>('pending');
  const [payments,   setPayments]   = useState<EnrichedPayment[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([getUserPayments(), getUserBookings()]).then(([pRes, bRes]) => {
      if (pRes.success && pRes.data) {
        const bookingsMap = new Map<string, PayloadBooking>();
        if (bRes.success && bRes.data) {
          bRes.data.docs.forEach(b => bookingsMap.set(b.id, b));
        }

        const enriched: EnrichedPayment[] = pRes.data.docs.map(p => {
          const bookingId = typeof p.booking === 'string' ? p.booking : p.booking?.id ?? '';
          const booking   = bookingId ? bookingsMap.get(bookingId) : undefined;
          return {
            ...p,
            bookingId,
            programTitle: booking ? getProgramTitle(booking) : 'Program',
          };
        });

        setPayments(enriched);
      }
      setLoading(false);
    });
  }, []);

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const paidPayments    = payments.filter(p => p.status === 'paid');
  const totalPaid       = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding     = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
    border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-sm)',
    cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header & Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Payments & Installments
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Manage your active payment plans and view transaction history.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Total Paid',         value: loading ? '—' : formatCurrency(totalPaid),   color: 'var(--text-primary)' },
            { label: 'Outstanding Balance', value: loading ? '—' : formatCurrency(outstanding), color: '#ffc107' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        <button onClick={() => setTab('pending')} style={tabStyle(tab === 'pending')}>
          Pending / Overdue {!loading && pendingPayments.length > 0 && `(${pendingPayments.length})`}
        </button>
        <button onClick={() => setTab('history')} style={tabStyle(tab === 'history')}>
          Payment History
        </button>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Loading…</p>}

      {/* Pending Tab */}
      {!loading && tab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pendingPayments.length === 0 ? (
            <Card style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <CardContent style={{ padding: '48px', textAlign: 'center' }}>
                <CheckCircle2 size={40} style={{ color: '#00e397', margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>All payments are up to date!</p>
              </CardContent>
            </Card>
          ) : pendingPayments.map(p => (
            <Card key={p.id} style={{
              background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)',
              border: `1px solid ${p.status === 'overdue' ? 'rgba(255,77,79,0.3)' : 'rgba(255,255,255,0.05)'}`,
            }}>
              <CardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <CardTitle style={{ fontSize: '18px' }}>{p.programTitle}</CardTitle>
                    <CardDescription style={{ marginTop: '4px' }}>
                      {p.installmentNumber ? `Installment #${p.installmentNumber}` : 'Full Payment'}
                    </CardDescription>
                  </div>
                  <span style={{
                    fontSize: '12px', fontWeight: 500, padding: '4px 8px', borderRadius: '4px',
                    color: p.status === 'overdue' ? '#ff4d4f' : '#ffc107',
                    backgroundColor: p.status === 'overdue' ? 'rgba(255,77,79,0.1)' : 'rgba(255,193,7,0.1)',
                  }}>
                    {p.status === 'overdue' ? '⚠ Overdue' : 'Pending'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: '1px solid rgba(255,255,255,0.1)', padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: p.status === 'overdue' ? 'rgba(255,77,79,0.05)' : 'transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: p.status === 'overdue' ? 'rgba(255,77,79,0.1)' : 'rgba(255,193,7,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {p.status === 'overdue'
                        ? <AlertCircle size={18} color="#ff4d4f" />
                        : <Calendar size={18} color="#ffc107" />
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Due: {new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatCurrency(p.amount)}
                      </div>
                    </div>
                  </div>
                  <Link href={`/${locale}/checkout/${p.bookingId}`} style={{ textDecoration: 'none' }}>
                    <Button variant="primary">
                      <CreditCard size={16} style={{ marginRight: '8px' }} /> Pay Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* History Tab */}
      {!loading && tab === 'history' && (
        <Card style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardContent style={{ padding: 0 }}>
            {paidPayments.length === 0 ? (
              <p style={{ padding: '32px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>
                No payment history yet.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '13px' }}>
                    {['Date', 'Program', 'Type', 'Amount', 'Status', 'Receipt'].map(h => (
                      <th key={h} style={{ padding: '16px 24px', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paidPayments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {p.paidDate ? new Date(p.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
                        {p.programTitle}
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {p.installmentNumber ? `Installment #${p.installmentNumber}` : 'Full Payment'}
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
                        {formatCurrency(p.amount)}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#00e397', fontSize: '13px' }}>
                          <CheckCircle2 size={14} /> Paid
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {p.receiptUrl ? (
                          <a href={p.receiptUrl} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="sm" style={{ padding: '0 8px', height: '32px' }}>
                              <Download size={14} />
                            </Button>
                          </a>
                        ) : (
                          <Button variant="ghost" size="sm" style={{ padding: '0 8px', height: '32px' }} disabled>
                            <Download size={14} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

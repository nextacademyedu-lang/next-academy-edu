"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';
import {
  getBookingsForCourses,
  getProgramTitle,
  getRoundTitle,
  getProgramType,
  getStatusLabel,
  type PayloadBooking,
} from '@/lib/dashboard-api';

export default function MyCoursesPage() {
  const locale = useLocale();
  const [bookings, setBookings] = useState<PayloadBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookingsForCourses().then((res) => {
      if (res.success && res.data) setBookings(res.data.docs);
      setLoading(false);
    });
  }, []);

  const getRoundId = (booking: PayloadBooking): string | null => {
    const round = booking.round;
    if (!round) return null;
    return typeof round === 'string' ? round : round.id;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
            My Courses
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Access your enrolled courses, sessions, and materials.
          </p>
        </div>
        <Link href={`/${locale}/programs`} style={{ textDecoration: 'none' }}>
          <Button variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Browse Programs <ArrowRight size={16} />
          </Button>
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Loading your courses…</p>
      )}

      {/* Empty state */}
      {!loading && bookings.length === 0 && (
        <Card style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardContent style={{ padding: '48px', textAlign: 'center' }}>
            <BookOpen size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>You don't have any active courses yet.</p>
            <Link href={`/${locale}/programs`} style={{ textDecoration: 'none' }}>
              <Button variant="primary" style={{ marginTop: '20px' }}>Browse Programs</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Courses Grid */}
      {!loading && bookings.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {bookings.map((booking) => {
            const statusLabel = getStatusLabel(booking.status);
            const roundId = getRoundId(booking);
            const isCompleted = booking.status === 'completed';

            return (
              <Card key={booking.id} style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', flexDirection: 'column',
              }}>
                <CardHeader style={{ paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '0.05em', color: 'var(--accent-primary)',
                      backgroundColor: 'rgba(197, 27, 27, 0.1)', padding: '4px 8px', borderRadius: '4px',
                    }}>
                      {getProgramType(booking)}
                    </span>
                    <span style={{
                      fontSize: '12px', fontWeight: 500,
                      color: isCompleted ? '#1877F2' : '#00e397',
                      backgroundColor: isCompleted ? 'rgba(24, 119, 242, 0.1)' : 'rgba(0, 227, 151, 0.1)',
                      padding: '4px 8px', borderRadius: '4px',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      {isCompleted ? <CheckCircle size={12} /> : null}
                      {statusLabel}
                    </span>
                  </div>
                  <CardTitle style={{ fontSize: '20px', lineHeight: 1.3 }}>
                    {getProgramTitle(booking)}
                  </CardTitle>
                  <CardDescription style={{ marginTop: '4px' }}>
                    {getRoundTitle(booking)}
                  </CardDescription>
                </CardHeader>

                <CardContent style={{ flex: 1 }} />

                <CardFooter style={{
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  paddingTop: '16px',
                }}>
                  {roundId ? (
                    <Link href={`/${locale}/dashboard/courses/${roundId}`} style={{ flex: 1, textDecoration: 'none' }}>
                      <Button variant="primary" fullWidth style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Play size={16} /> Open Course
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="ghost" fullWidth disabled>No sessions available</Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

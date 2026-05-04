"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Video, ArrowRight, Calendar, MapPin, Globe, Clock, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';
import {
  getUserBookings,
  getProgramTitle,
  getRoundTitle,
  getMeetingUrl,
  getProgramType,
  getStatusLabel,
  getBookingEventDetails,
  type PayloadBooking,
} from '@/lib/dashboard-api';

const STATUS_COLOR: Record<string, { text: string; bg: string }> = {
  Confirmed:       { text: '#00e397', bg: 'rgba(0, 227, 151, 0.1)' },
  Completed:       { text: '#1877F2', bg: 'rgba(24, 119, 242, 0.1)' },
  'Pending Payment': { text: '#ffc107', bg: 'rgba(255, 193, 7, 0.1)' },
  Reserved:        { text: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' },
  Cancelled:       { text: '#ff4d4f', bg: 'rgba(255, 77, 79, 0.1)' },
};

const LOCATION_BADGE: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  online:   { icon: <Globe size={12} />, label: 'Online', color: '#3b82f6' },
  in_person: { icon: <MapPin size={12} />, label: 'In-Person', color: '#f59e0b' },
  hybrid:   { icon: <Globe size={12} />, label: 'Hybrid', color: '#8b5cf6' },
};

export default function BookingsPage() {
  const locale = useLocale();
  const [bookings, setBookings] = useState<PayloadBooking[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getUserBookings().then((res) => {
      if (res.success && res.data) setBookings(res.data.docs);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
            My Bookings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Access your enrolled programs, live sessions, and learning materials.
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
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Loading your bookings…</p>
      )}

      {/* Empty state */}
      {!loading && bookings.length === 0 && (
        <Card style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardContent style={{ padding: '48px', textAlign: 'center' }}>
            <BookOpen size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>You have no active bookings yet.</p>
            <Link href={`/${locale}/programs`} style={{ textDecoration: 'none' }}>
              <Button variant="primary" style={{ marginTop: '20px' }}>Browse Programs</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Bookings Grid */}
      {!loading && bookings.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {bookings.map((booking) => {
            const statusLabel = getStatusLabel(booking.status);
            const statusStyle = STATUS_COLOR[statusLabel] ?? { text: '#aaa', bg: 'rgba(170,170,170,0.1)' };
            const zoomLink    = getMeetingUrl(booking);
            const details     = getBookingEventDetails(booking);
            const locBadge    = LOCATION_BADGE[details.locationType];

            // Payment progress
            const progress = details.isFree
              ? 100
              : booking.totalAmount > 0
              ? Math.round((booking.paidAmount / booking.totalAmount) * 100)
              : booking.status === 'completed' ? 100 : 0;

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
                      color: statusStyle.text, backgroundColor: statusStyle.bg,
                      padding: '4px 8px', borderRadius: '4px',
                    }}>
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

                <CardContent style={{ flex: 1, paddingBottom: '16px' }}>
                  {/* Event Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {/* Date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} style={{ opacity: 0.7 }} />
                      <span>{details.date}</span>
                    </div>

                    {/* Time */}
                    {details.time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <Clock size={14} style={{ opacity: 0.7 }} />
                        <span>{details.time}</span>
                      </div>
                    )}

                    {/* Venue */}
                    {details.venue && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <MapPin size={14} style={{ opacity: 0.7 }} />
                        <span>{details.venue}</span>
                      </div>
                    )}

                    {/* Location type badge */}
                    {locBadge && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '11px', fontWeight: 600,
                        color: locBadge.color, backgroundColor: `${locBadge.color}15`,
                        padding: '3px 8px', borderRadius: '4px', width: 'fit-content',
                      }}>
                        {locBadge.icon} {locBadge.label}
                      </div>
                    )}
                  </div>

                  {/* Payment Progress or Free Badge */}
                  {details.isFree ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      color: '#00e397', fontSize: '13px', fontWeight: 600,
                      background: 'rgba(0, 227, 151, 0.1)', padding: '6px 12px',
                      borderRadius: '6px', width: 'fit-content',
                    }}>
                      <Check size={14} /> Free Event
                    </div>
                  ) : (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Payment</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{progress}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${progress}%`,
                          background: progress === 100 ? '#1877F2' : 'var(--accent-primary)',
                          borderRadius: '3px',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Booking code */}
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Ref: {booking.bookingCode}
                  </p>
                </CardContent>

                <CardFooter style={{
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  paddingTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap',
                }}>
                  {/* Add to Calendar */}
                  {details.calendarUrl && ['confirmed', 'completed'].includes(booking.status) && (
                    <a href={details.calendarUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                      <Button variant="outline" style={{ padding: '0 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> Add to Calendar
                      </Button>
                    </a>
                  )}

                  {/* Join meeting */}
                  {booking.status === 'confirmed' && zoomLink && (
                    <a href={zoomLink} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                      <Button variant="primary" fullWidth style={{ padding: '0 12px' }}>
                        <Video size={16} style={{ marginRight: '8px' }} /> Join
                      </Button>
                    </a>
                  )}

                  {/* Open course */}
                  {(booking.status === 'confirmed' || booking.status === 'completed') && (
                    (() => {
                      const round = booking.round;
                      const roundId = round ? (typeof round === 'string' ? round : round.id) : null;
                      return roundId ? (
                        <Link href={`/${locale}/dashboard/courses/${roundId}`} style={{ flex: 1, textDecoration: 'none' }}>
                          <Button variant="outline" fullWidth style={{ padding: '0 12px' }}>
                            <BookOpen size={16} style={{ marginRight: '8px' }} /> Open Course
                          </Button>
                        </Link>
                      ) : null;
                    })()
                  )}

                  {/* Complete payment */}
                  {(booking.status === 'pending' || booking.status === 'reserved') && (
                    <Link href={`/${locale}/checkout/${booking.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                      <Button variant="outline" fullWidth style={{ borderColor: '#ffc107', color: '#ffc107' }}>
                        Complete Payment
                      </Button>
                    </Link>
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

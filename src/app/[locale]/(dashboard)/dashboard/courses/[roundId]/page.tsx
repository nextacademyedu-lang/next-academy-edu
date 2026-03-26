"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  Download,
  ChevronLeft,
  Menu,
  BookOpen,
  ExternalLink,
  PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';
import {
  getBookingSessions,
  type PayloadSession,
} from '@/lib/dashboard-api';
import styles from '../course-player.module.css';

const SESSION_STATUS_STYLES: Record<string, { text: string; bg: string; label: string }> = {
  scheduled: { text: '#a78bfa', bg: 'rgba(167,139,250,0.1)', label: 'Scheduled' },
  live:      { text: '#00e397', bg: 'rgba(0,227,151,0.15)',  label: '● Live Now' },
  completed: { text: '#1877F2', bg: 'rgba(24,119,242,0.1)',  label: 'Completed' },
  cancelled: { text: '#ff4d4f', bg: 'rgba(255,77,79,0.1)',   label: 'Cancelled' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  // Handle "HH:mm" or full ISO
  const parts = timeStr.split('T');
  const t = parts.length > 1 ? parts[1].substring(0, 5) : timeStr.substring(0, 5);
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function CoursePlayerPage() {
  const params = useParams();
  const roundId = params.roundId as string;
  const locale = useLocale();

  const [sessions, setSessions] = useState<PayloadSession[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!roundId) return;
    getBookingSessions(roundId).then((res) => {
      if (res.success && res.data) {
        const docs = res.data.docs;
        setSessions(docs);
        // Auto-select first non-cancelled session
        const first = docs.find((s) => s.status !== 'cancelled') ?? docs[0];
        if (first) setSelectedId(first.id);
      }
      setLoading(false);
    });
  }, [roundId]);

  const selected = sessions.find((s) => s.id === selectedId) ?? null;

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading course sessions…
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center' }}>
        <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
        <h2 style={{ color: 'var(--text-primary)', fontSize: '20px', marginBottom: '8px' }}>
          No sessions available yet
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>
          Sessions will appear here once the instructor schedules them.
        </p>
        <Link href={`/${locale}/dashboard/courses`} style={{ textDecoration: 'none' }}>
          <Button variant="outline">
            <ChevronLeft size={16} style={{ marginRight: '6px' }} />
            Back to My Courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Back link */}
      <Link
        href={`/${locale}/dashboard/courses`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'none',
        }}
      >
        <ChevronLeft size={16} /> Back to My Courses
      </Link>

      {/* Mobile sidebar toggle */}
      <button
        className={styles.mobileMenuBtn}
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={18} /> Sessions ({sessions.length})
      </button>

      <div className={styles.playerLayout}>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sessions Sidebar */}
        <aside className={`${styles.sessionSidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarTitle}>Sessions ({sessions.length})</div>
          {sessions.map((session, idx) => (
            <button
              key={session.id}
              className={`${styles.sessionItem} ${selectedId === session.id ? styles.sessionItemActive : ''}`}
              onClick={() => { setSelectedId(session.id); setSidebarOpen(false); }}
              style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <span className={styles.sessionNumber}>{idx + 1}</span>
              <div className={styles.sessionMeta}>
                <span className={styles.sessionTitle}>{session.title}</span>
                <span className={styles.sessionDate}>{formatDate(session.date)}</span>
              </div>
            </button>
          ))}
        </aside>

        {/* Session Content */}
        <div className={styles.sessionContent}>
          {selected ? (
            <>
              {/* Header */}
              <div className={styles.sessionHeader}>
                <div className={styles.sessionHeaderInfo}>
                  <h2>{selected.title}</h2>
                  <span
                    className={styles.sessionStatusBadge}
                    style={{
                      color: SESSION_STATUS_STYLES[selected.status]?.text ?? '#aaa',
                      backgroundColor: SESSION_STATUS_STYLES[selected.status]?.bg ?? 'rgba(170,170,170,0.1)',
                    }}
                  >
                    {SESSION_STATUS_STYLES[selected.status]?.label ?? selected.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              {selected.description && (
                <p className={styles.sessionDescription}>{selected.description}</p>
              )}

              {/* Info Grid */}
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}><Calendar size={18} /></div>
                  <div>
                    <div className={styles.infoLabel}>Date</div>
                    <div className={styles.infoValue}>{formatDate(selected.date)}</div>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}><Clock size={18} /></div>
                  <div>
                    <div className={styles.infoLabel}>Time</div>
                    <div className={styles.infoValue}>
                      {formatTime(selected.startTime)} – {formatTime(selected.endTime)}
                    </div>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}><Video size={18} /></div>
                  <div>
                    <div className={styles.infoLabel}>Format</div>
                    <div className={styles.infoValue}>
                      {selected.meetingUrl ? 'Online (Live)' : 'In Person'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.actions}>
                {selected.meetingUrl && (selected.status === 'scheduled' || selected.status === 'live') && (
                  <a href={selected.meetingUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <Button variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Video size={16} /> Join Session
                      <ExternalLink size={14} />
                    </Button>
                  </a>
                )}
                {selected.recordingUrl && (
                  <a href={selected.recordingUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PlayCircle size={16} /> Watch Recording
                    </Button>
                  </a>
                )}
              </div>

              {/* Materials */}
              {selected.materials && selected.materials.length > 0 && (
                <div className={styles.materialsSection}>
                  <h3 className={styles.materialsTitle}>
                    <FileText size={18} /> Materials
                  </h3>
                  <div className={styles.materialsList}>
                    {selected.materials.map((mat, i) => (
                      mat.file?.url ? (
                        <a
                          key={i}
                          href={mat.file.url}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.materialLink}
                        >
                          <Download size={16} />
                          {mat.name || `Material ${i + 1}`}
                        </a>
                      ) : (
                        <div key={i} className={styles.materialLink} style={{ opacity: 0.5 }}>
                          <FileText size={16} />
                          {mat.name || `Material ${i + 1}`} (file pending)
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptySession}>
              <BookOpen size={48} />
              <p style={{ fontSize: '16px' }}>Select a session to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

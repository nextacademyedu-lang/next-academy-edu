"use client";

import React, { useEffect, useState } from 'react';
import { Video, Calendar, Clock, FileText, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getSessionMaterials,
  getInstructorSessions,
  getSessionProgramTitle,
  getSessionRoundTitle,
  setSessionMaterials,
  updateSessionRecordingUrl,
  uploadSessionMaterials,
  type PayloadSession,
  type PayloadSessionMaterial,
} from '@/lib/instructor-api';

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  scheduled: { color: '#D6A32B', bg: 'rgba(214,163,43,0.14)' },
  live:      { color: '#C51B1B', bg: 'rgba(197,27,27,0.12)'  },
  completed: { color: '#8F9A8F', bg: 'rgba(143,154,143,0.16)' },
  cancelled: { color: '#C51B1B', bg: 'rgba(197,27,27,0.12)'  },
};

export default function InstructorSessionsPage() {
  const [sessions, setSessions] = useState<PayloadSession[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState('');
  const [activeSession, setActiveSession] = useState<PayloadSession | null>(null);
  const [materials, setMaterials] = useState<PayloadSessionMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsSaving, setMaterialsSaving] = useState(false);
  const [recordingSaving, setRecordingSaving] = useState(false);
  const [recordingUrlInput, setRecordingUrlInput] = useState('');
  const [materialsError, setMaterialsError] = useState('');

  useEffect(() => {
    getInstructorSessions().then(res => {
      if (res.success && res.data) setSessions(res.data.docs);
      setLoading(false);
    });
  }, []);

  const openMaterialsManager = async (session: PayloadSession) => {
    setActiveSession(session);
    setMaterials([]);
    setMaterialsError('');
    setRecordingUrlInput(session.recordingUrl || '');
    setMaterialsLoading(true);

    const res = await getSessionMaterials(session.id);
    setMaterialsLoading(false);
    if (!res.success || !res.data) {
      setMaterialsError(res.error || 'Failed to load materials');
      return;
    }
    setMaterials(res.data.materials);
  };

  const closeMaterialsManager = () => {
    if (materialsSaving || recordingSaving) return;
    setActiveSession(null);
    setMaterials([]);
    setRecordingUrlInput('');
    setMaterialsError('');
  };

  const handleSaveRecordingUrl = async () => {
    if (!activeSession) return;
    setMaterialsError('');
    setRecordingSaving(true);

    const normalized = recordingUrlInput.trim() ? recordingUrlInput.trim() : null;
    const res = await updateSessionRecordingUrl(activeSession.id, normalized);
    setRecordingSaving(false);

    if (!res.success || !res.data) {
      setMaterialsError(res.error || 'Failed to save recording URL');
      return;
    }

    const nextRecording = res.data.recordingUrl || '';
    setRecordingUrlInput(nextRecording);
    setActiveSession((prev) => (prev ? { ...prev, recordingUrl: nextRecording || undefined } : prev));
    setSessions((prev) =>
      prev.map((item) =>
        item.id === activeSession.id
          ? { ...item, recordingUrl: nextRecording || undefined }
          : item,
      ),
    );
  };

  const handleUploadMaterials = async (files: FileList | null) => {
    if (!activeSession || !files || files.length === 0) return;
    setMaterialsError('');
    setMaterialsSaving(true);

    const res = await uploadSessionMaterials(activeSession.id, Array.from(files));
    setMaterialsSaving(false);
    if (!res.success || !res.data) {
      setMaterialsError(res.error || 'Failed to upload materials');
      return;
    }

    setMaterials(res.data.materials);
  };

  const handleRemoveMaterial = async (materialId: string) => {
    if (!activeSession) return;
    setMaterialsError('');
    const nextMaterials = materials.filter((item) => item.id !== materialId);
    setMaterials(nextMaterials);
    setMaterialsSaving(true);

    const res = await setSessionMaterials(
      activeSession.id,
      nextMaterials.map((item) => item.id),
    );
    setMaterialsSaving(false);
    if (!res.success || !res.data) {
      setMaterialsError(res.error || 'Failed to update materials');
      const refresh = await getSessionMaterials(activeSession.id);
      if (refresh.success && refresh.data) {
        setMaterials(refresh.data.materials);
      }
      return;
    }

    setMaterials(res.data.materials);
  };

  const filtered = sessions.filter(s =>
    getSessionProgramTitle(s).toLowerCase().includes(query.toLowerCase()) ||
    getSessionRoundTitle(s).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>My Sessions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Manage your upcoming classes, join links, and learning materials.</p>
        </div>
        <div style={{ position: 'relative', width: 'min(100%, 280px)' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <Input
            placeholder="Search sessions..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: '38px', background: 'rgba(255,255,255,0.02)' }}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No sessions found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filtered.map(session => {
            const style = STATUS_STYLE[session.status] ?? STATUS_STYLE.completed;
            const label = session.status.charAt(0).toUpperCase() + session.status.slice(1);
            return (
              <Card key={session.id} style={{
                background: 'var(--bg-elevated)', backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column',
              }}>
                <CardHeader style={{ paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-primary)', backgroundColor: 'var(--accent-primary-10)', padding: '4px 8px', borderRadius: '4px' }}>
                      {getSessionRoundTitle(session) || 'Session'}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: style.color, backgroundColor: style.bg, padding: '4px 8px', borderRadius: '4px' }}>
                      {label}
                    </span>
                  </div>
                  <CardTitle style={{ fontSize: '20px', lineHeight: 1.3 }}>{getSessionProgramTitle(session)}</CardTitle>
                  {session.title && <CardDescription style={{ marginTop: '4px' }}>{session.title}</CardDescription>}
                </CardHeader>

                <CardContent style={{ flex: 1, paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} />
                      {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    {session.startTime && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} /> {session.startTime}{session.endTime ? ` - ${session.endTime}` : ''}
                      </div>
                    )}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Enrolled Students</span>
                    <span style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>{session.attendanceCount ?? 0}</span>
                  </div>
                </CardContent>

                <CardFooter style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {(session.status === 'scheduled' || session.status === 'live') && session.meetingUrl && (
                    <a href={session.meetingUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                      <Button variant="primary" style={{ width: '100%' }}>
                        <Video size={16} style={{ marginRight: '8px' }} /> Start Meeting
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" style={{ flex: 1 }} onClick={() => openMaterialsManager(session)}>
                    <FileText size={16} style={{ marginRight: '8px' }} />
                    {session.status === 'completed' ? 'View Materials' : 'Edit Materials'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {activeSession && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.62)',
            zIndex: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={closeMaterialsManager}
        >
          <div
            style={{
              width: 'min(760px, 100%)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '20px',
              maxHeight: '85vh',
              overflow: 'auto',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Session Materials</h2>
                <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {getSessionProgramTitle(activeSession)}{activeSession.title ? ` • ${activeSession.title}` : ''}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMaterialsManager}
                disabled={materialsSaving || recordingSaving}
              >
                Close
              </Button>
            </div>

            <div style={{ marginTop: '16px', display: 'grid', gap: '10px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Recording URL</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={recordingUrlInput}
                  onChange={(event) => setRecordingUrlInput(event.target.value)}
                  disabled={recordingSaving}
                  style={{ flex: 1, minWidth: '260px' }}
                />
                <Button
                  variant="secondary"
                  onClick={handleSaveRecordingUrl}
                  disabled={recordingSaving}
                >
                  {recordingSaving ? 'Saving…' : 'Save Recording'}
                </Button>
              </div>
              {activeSession.recordingUrl && (
                <a
                  href={activeSession.recordingUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent-primary)', fontSize: '13px', textDecoration: 'none' }}
                >
                  Open current recording link
                </a>
              )}
            </div>

            <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="file"
                multiple
                onChange={(event) => {
                  const files = event.target.files;
                  handleUploadMaterials(files);
                  event.currentTarget.value = '';
                }}
                disabled={materialsSaving || recordingSaving}
              />
              {materialsSaving && (
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Saving…</span>
              )}
            </div>

            {materialsError && (
              <p style={{ marginTop: '12px', color: '#ff4d4f', fontSize: '14px' }}>{materialsError}</p>
            )}

            {materialsLoading ? (
              <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading materials…</p>
            ) : materials.length === 0 ? (
              <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>No materials uploaded yet.</p>
            ) : (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {materials.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--accent-primary)', fontWeight: 500, textDecoration: 'none' }}
                        >
                          {item.name}
                        </a>
                      ) : (
                        <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</p>
                      )}
                      <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                        {item.mimeType || 'Unknown type'}
                        {typeof item.filesize === 'number' ? ` • ${Math.max(1, Math.round(item.filesize / 1024))} KB` : ''}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMaterial(item.id)}
                      disabled={materialsSaving}
                      style={{ color: '#ff4d4f' }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { PopupModal, type PopupData } from './popup-modal';

const VISITED_KEY = 'na-popup-has-visited';
const EMAIL_CAPTURED_KEY = 'na-popup-email-captured';
const SESSION_PAGE_VIEWS_KEY = 'na-popup-session-page-views';

/* ── Frequency helpers ─────────────────────────────────── */

function getStorageKey(id: string | number) {
  return `na-popup-${id}`;
}

function shouldShowByFrequency(id: string | number, frequency?: string): boolean {
  if (!frequency || frequency === 'every_time') return true;

  const key = getStorageKey(id);

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return true;

    const data = JSON.parse(stored) as { ts: number; session?: string };

    switch (frequency) {
      case 'once_ever':
        return false; // stored means already shown
      case 'once_day': {
        const dayMs = 86_400_000;
        return Date.now() - data.ts > dayMs;
      }
      case 'once_session': {
        // Use sessionStorage for session tracking
        return !sessionStorage.getItem(key);
      }
      default:
        return true;
    }
  } catch {
    return true;
  }
}

function markShown(id: string | number, frequency?: string) {
  const key = getStorageKey(id);
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now() }));
    if (frequency === 'once_session') {
      sessionStorage.setItem(key, '1');
    }
  } catch {
    // Storage unavailable
  }
}

/* ── Device detection ──────────────────────────────────── */

function matchesDevice(targetDevice?: string): boolean {
  if (!targetDevice || targetDevice === 'all') return true;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  if (targetDevice === 'mobile') return isMobile;
  if (targetDevice === 'desktop') return !isMobile;
  return true;
}

/* ── Page matching ─────────────────────────────────────── */

function matchesPage(
  pathname: string,
  displayPages?: string,
  specificPages?: { url: string }[],
): boolean {
  if (!displayPages || displayPages === 'all') return true;
  if (!specificPages?.length) return false;
  return specificPages.some((p) => pathname.includes(p.url));
}

/* ── Component ─────────────────────────────────────────── */

interface PopupManagerProps {
  /** Server-side-fetched popups data (optional, falls back to client fetch) */
  initialData?: PopupData[];
}

interface PopupWithTargeting extends PopupData {
  targeting?: {
    displayPages?: string;
    specificPages?: { url: string }[];
    triggerType?: 'on_load' | 'after_delay' | 'on_exit' | 'on_scroll';
    triggerDelay?: number;
    triggerScroll?: number;
    frequency?: string;
    targetAudience?: string;
    targetDevice?: string;
  };
}

type BehaviorState = {
  firstVisit: boolean;
  emailCaptured: boolean;
  sessionPageViews: number;
};

export function PopupManager({ initialData }: PopupManagerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewPopupId = searchParams?.get('previewPopupId') || '';
  const [popups, setPopups] = useState<PopupWithTargeting[]>([]);
  const [activePopup, setActivePopup] = useState<PopupData | null>(null);
  const [behavior, setBehavior] = useState<BehaviorState | null>(null);

  /* Track visitor behavior state used for advanced popup targeting */
  useEffect(() => {
    let firstVisit = false;
    let emailCaptured = false;
    let sessionPageViews = 1;

    try {
      const hasVisitedBefore = localStorage.getItem(VISITED_KEY) === '1';
      firstVisit = !hasVisitedBefore;
      if (!hasVisitedBefore) {
        localStorage.setItem(VISITED_KEY, '1');
      }

      emailCaptured = localStorage.getItem(EMAIL_CAPTURED_KEY) === '1';

      const rawViews = sessionStorage.getItem(SESSION_PAGE_VIEWS_KEY);
      const parsedViews = rawViews ? Number.parseInt(rawViews, 10) : 0;
      const currentViews = Number.isFinite(parsedViews) && parsedViews > 0 ? parsedViews : 0;
      sessionPageViews = currentViews + 1;
      sessionStorage.setItem(SESSION_PAGE_VIEWS_KEY, String(sessionPageViews));
    } catch {
      // Storage can fail in strict/privacy modes
    }

    setBehavior({ firstVisit, emailCaptured, sessionPageViews });
  }, [pathname]);

  /* Fetch active popups */
  useEffect(() => {
    if (initialData?.length) {
      setPopups(initialData as PopupWithTargeting[]);
      return;
    }
    if (!behavior) return;

    const fetchPopups = async () => {
      try {
        const params = new URLSearchParams({
          page: pathname,
          firstVisit: String(behavior.firstVisit),
          emailCaptured: String(behavior.emailCaptured),
          sessionPageViews: String(behavior.sessionPageViews),
        });
        if (previewPopupId) {
          params.set('previewPopupId', previewPopupId);
        }
        const res = await fetch(`/api/popups/active?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        const docs = Array.isArray(data?.popups)
          ? data.popups
          : Array.isArray(data)
            ? data
            : [];
        setPopups(docs as PopupWithTargeting[]);
      } catch {
        // Silently fail — popups are nice-to-have
      }
    };

    fetchPopups();
  }, [pathname, initialData, behavior, previewPopupId]);

  /* Trigger logic */
  useEffect(() => {
    if (!popups.length || activePopup) return;

    if (previewPopupId) {
      const previewPopup =
        popups.find((popup) => String(popup.id) === previewPopupId) || popups[0];
      setActivePopup(previewPopup);
      return;
    }

    // Find first eligible popup
    const eligible = popups.find((p) => {
      const t = p.targeting;
      if (!matchesDevice(t?.targetDevice)) return false;
      if (!matchesPage(pathname, t?.displayPages, t?.specificPages)) return false;
      if (!shouldShowByFrequency(p.id, t?.frequency)) return false;
      return true;
    });

    if (!eligible) return;

    const triggerType = eligible.targeting?.triggerType || 'on_load';

    const show = () => {
      setActivePopup(eligible);
      markShown(eligible.id, eligible.targeting?.frequency);
    };

    let timer: ReturnType<typeof setTimeout> | undefined;

    switch (triggerType) {
      case 'after_delay': {
        const delay = (eligible.targeting?.triggerDelay ?? 3) * 1000;
        timer = setTimeout(show, delay);
        break;
      }
      case 'on_scroll': {
        const scrollPct = eligible.targeting?.triggerScroll ?? 50;
        const handler = () => {
          const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
          if (scrolled >= scrollPct) {
            show();
            window.removeEventListener('scroll', handler);
          }
        };
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
      }
      case 'on_exit': {
        const handler = (e: MouseEvent) => {
          if (e.clientY <= 5) {
            show();
            document.removeEventListener('mouseleave', handler);
          }
        };
        document.addEventListener('mouseleave', handler);
        return () => document.removeEventListener('mouseleave', handler);
      }
      default: // on_load
        timer = setTimeout(show, 500); // slight delay for UX
        break;
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [popups, pathname, activePopup, previewPopupId]);

  const handleClose = useCallback(() => {
    setActivePopup(null);
  }, []);

  const handleLeadCaptured = useCallback(() => {
    try {
      localStorage.setItem(EMAIL_CAPTURED_KEY, '1');
    } catch {
      // Ignore storage failures
    }

    setBehavior((current) => {
      if (!current || current.emailCaptured) return current;
      return { ...current, emailCaptured: true };
    });
  }, []);

  if (!activePopup) return null;

  return (
    <PopupModal
      popup={activePopup}
      onClose={handleClose}
      onLeadCaptured={handleLeadCaptured}
    />
  );
}

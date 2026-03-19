'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { PopupModal, type PopupData } from './popup-modal';

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

export function PopupManager({ initialData }: PopupManagerProps) {
  const pathname = usePathname();
  const [popups, setPopups] = useState<PopupWithTargeting[]>([]);
  const [activePopup, setActivePopup] = useState<PopupData | null>(null);

  /* Fetch active popups */
  useEffect(() => {
    if (initialData?.length) {
      setPopups(initialData as PopupWithTargeting[]);
      return;
    }

    const fetchPopups = async () => {
      try {
        const page = encodeURIComponent(pathname);
        const res = await fetch(`/api/popups/active?page=${page}`);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setPopups(data as PopupWithTargeting[]);
        }
      } catch {
        // Silently fail — popups are nice-to-have
      }
    };

    fetchPopups();
  }, [pathname, initialData]);

  /* Trigger logic */
  useEffect(() => {
    if (!popups.length || activePopup) return;

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
  }, [popups, pathname, activePopup]);

  const handleClose = useCallback(() => {
    setActivePopup(null);
  }, []);

  if (!activePopup) return null;

  return <PopupModal popup={activePopup} onClose={handleClose} />;
}

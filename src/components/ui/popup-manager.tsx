'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { PopupModal } from '@/components/ui/popup-modal';

interface PopupData {
  id: string | number;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type: string;
  triggers?: {
    triggerType?: string;
    delaySeconds?: number;
    scrollPercentage?: number;
  };
  frequency?: {
    showFrequency?: string;
    maxShowsPerUser?: number;
  };
  design?: {
    backgroundColor?: string;
    textColor?: string;
    image?: { url: string } | string;
  };
  content?: {
    ctaTextAr?: string;
    ctaTextEn?: string;
    ctaUrl?: string;
    promoCode?: string;
    countdownEnd?: string;
  };
}

interface PopupManagerProps {
  locale: string;
}

const STORAGE_PREFIX = 'na_popup_';

function getPopupStorage(id: string | number): { count: number; lastShown: number } {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { count: 0, lastShown: 0 };
}

function setPopupStorage(id: string | number, data: { count: number; lastShown: number }) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function shouldShowPopup(popup: PopupData): boolean {
  const freq = popup.frequency?.showFrequency || 'once_per_session';
  const maxShows = popup.frequency?.maxShowsPerUser || 3;
  const stored = getPopupStorage(popup.id);

  if (stored.count >= maxShows) return false;

  const now = Date.now();
  const ONE_DAY = 86400000;
  const ONE_WEEK = 604800000;

  switch (freq) {
    case 'once_per_session': {
      const sessionKey = `${STORAGE_PREFIX}session_${popup.id}`;
      if (sessionStorage.getItem(sessionKey)) return false;
      return true;
    }
    case 'once_per_day':
      return now - stored.lastShown > ONE_DAY;
    case 'once_per_week':
      return now - stored.lastShown > ONE_WEEK;
    case 'always':
      return true;
    default:
      return stored.count === 0;
  }
}

export function PopupManager({ locale }: PopupManagerProps) {
  const pathname = usePathname();
  const [popups, setPopups] = useState<PopupData[]>([]);
  const [activePopup, setActivePopup] = useState<PopupData | null>(null);

  // Fetch active popups for current page
  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const res = await fetch(`/api/popups/active?page=${encodeURIComponent(pathname)}`);
        if (!res.ok) return;
        const data = await res.json();
        setPopups(data.popups || []);
      } catch {
        /* silent */
      }
    };
    fetchPopups();
  }, [pathname]);

  // Handle triggers
  useEffect(() => {
    if (popups.length === 0 || activePopup) return;

    const eligible = popups.filter(shouldShowPopup);
    if (eligible.length === 0) return;

    const popup = eligible[0]; // highest priority (pre-sorted by API)
    const trigger = popup.triggers?.triggerType || 'time_delay';
    const delay = (popup.triggers?.delaySeconds || 3) * 1000;

    let timer: ReturnType<typeof setTimeout>;

    if (trigger === 'time_delay' || trigger === 'page_load') {
      timer = setTimeout(() => setActivePopup(popup), delay);
    } else if (trigger === 'scroll') {
      const pct = popup.triggers?.scrollPercentage || 50;
      const handler = () => {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrolled >= pct) {
          setActivePopup(popup);
          window.removeEventListener('scroll', handler);
        }
      };
      window.addEventListener('scroll', handler, { passive: true });
      return () => window.removeEventListener('scroll', handler);
    } else if (trigger === 'exit_intent') {
      const handler = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setActivePopup(popup);
          document.removeEventListener('mouseleave', handler);
        }
      };
      document.addEventListener('mouseleave', handler);
      return () => document.removeEventListener('mouseleave', handler);
    }

    return () => clearTimeout(timer);
  }, [popups, activePopup]);

  const handleClose = useCallback(() => {
    if (!activePopup) return;
    const stored = getPopupStorage(activePopup.id);
    setPopupStorage(activePopup.id, {
      count: stored.count + 1,
      lastShown: Date.now(),
    });
    // Mark session
    sessionStorage.setItem(`${STORAGE_PREFIX}session_${activePopup.id}`, '1');
    setActivePopup(null);
  }, [activePopup]);

  if (!activePopup) return null;

  return (
    <PopupModal
      popup={activePopup}
      locale={locale}
      onClose={handleClose}
    />
  );
}

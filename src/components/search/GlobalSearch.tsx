'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { searchAll, type SearchCategory, type SearchResult } from '@/lib/search-api';
import styles from './global-search.module.css';

/* ── Category labels & icons ────────────────────────────────── */
const CATEGORY_LABEL: Record<SearchCategory, { ar: string; en: string }> = {
  programs: { ar: 'البرامج', en: 'Programs' },
  instructors: { ar: 'المدربون', en: 'Instructors' },
  blog: { ar: 'المدونة', en: 'Blog' },
};

const CATEGORY_ICON: Record<SearchCategory, string> = {
  programs: '📚',
  instructors: '👨‍🏫',
  blog: '📝',
};

/* ── Component ──────────────────────────────────────────────── */
interface GlobalSearchProps {
  onClose: () => void;
}

export function GlobalSearch({ onClose }: GlobalSearchProps) {
  const locale = useLocale() as 'ar' | 'en';
  const t = useTranslations('Search');
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  /* auto-focus on mount */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* debounced search */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }
    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      const data = await searchAll(query, locale);
      setResults(data);
      setActiveIndex(-1);
      setIsLoading(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, locale]);

  /* navigate to selected result */
  const selectResult = useCallback(
    (result: SearchResult) => {
      onClose();
      router.push(result.url);
    },
    [onClose, router],
  );

  /* keyboard navigation */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        selectResult(results[activeIndex]);
      }
    },
    [activeIndex, results, onClose, selectResult],
  );

  /* scroll active item into view */
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-search-item]');
    items[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  /* group results by category */
  const grouped = results.reduce<Record<SearchCategory, SearchResult[]>>(
    (acc, r) => {
      if (!acc[r.category]) acc[r.category] = [];
      acc[r.category].push(r);
      return acc;
    },
    {} as Record<SearchCategory, SearchResult[]>,
  );

  let flatIndex = -1;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Search input */}
        <div className={styles.inputRow}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder={t('placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className={styles.kbd}>Esc</kbd>
        </div>

        {/* Results */}
        <div className={styles.results} ref={listRef}>
          {isLoading && (
            <p className={styles.statusText}>{t('loading')}</p>
          )}

          {!isLoading && query.trim().length >= 2 && results.length === 0 && (
            <p className={styles.statusText}>{t('noResults')}</p>
          )}

          {!isLoading && results.length > 0 && (
            <>
              {(Object.keys(grouped) as SearchCategory[]).map((cat) => (
                <div key={cat} className={styles.group}>
                  <h3 className={styles.groupTitle}>
                    {CATEGORY_ICON[cat]}{' '}
                    {CATEGORY_LABEL[cat][locale]}
                  </h3>
                  {grouped[cat].map((r) => {
                    flatIndex++;
                    const idx = flatIndex;
                    return (
                      <button
                        key={r.id}
                        data-search-item
                        className={`${styles.item} ${idx === activeIndex ? styles.active : ''}`}
                        onClick={() => selectResult(r)}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        {r.thumbnail && (
                          <img
                            src={r.thumbnail}
                            alt=""
                            className={styles.thumb}
                          />
                        )}
                        <div className={styles.itemText}>
                          <span className={styles.itemTitle}>{r.title}</span>
                          {r.subtitle && (
                            <span className={styles.itemSub}>{r.subtitle}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </>
          )}

          {!isLoading && query.trim().length < 2 && (
            <p className={styles.statusText}>{t('hint')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

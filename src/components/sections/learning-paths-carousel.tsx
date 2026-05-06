"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, List, Clock } from 'lucide-react';
import NextLink from 'next/link';
import Image from 'next/image';
import styles from './learning-paths.module.css';

export interface LearningPathData {
  id: string;
  title: string;
  description: string;
  coursesCount: number;
  durationStr: string;
  image: string;
  href: string;
}

interface Props {
  title: string;
  subtitle?: string;
  paths: LearningPathData[];
  showAllLabel: string;
  showAllHref: string;
  showProgramLabel: string;
}

export function LearningPathsCarousel({ title, subtitle, paths, showAllLabel, showAllHref, showProgramLabel }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!paths || paths.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      <div className={styles.carouselWrap}>
        <button
          className={`${styles.controlBtn} ${styles.prevBtn}`}
          onClick={scrollPrev}
          disabled={!prevBtnEnabled}
          style={{ opacity: prevBtnEnabled ? 1 : 0.4, cursor: prevBtnEnabled ? 'pointer' : 'default' }}
        >
          <ChevronLeft size={24} />
        </button>

        <div className={styles.embla} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {paths.map((path, idx) => (
              <div key={path.id || idx} className={styles.emblaSlide}>
                <div className={styles.card}>
                  <div className={styles.imageWrap}>
                    <Image src={path.image} alt={path.title} fill className={styles.coverImage} />
                    <div className={styles.overlay} />
                  </div>
                  
                  <div className={styles.content}>
                    <h3 className={styles.cardTitle}>{path.title}</h3>
                    <p className={styles.cardDesc}>{path.description}</p>
                    
                    <div className={styles.metaRow}>
                      <div className={styles.metaBadge}>
                        <List size={14} />
                        <span>{path.coursesCount} Courses</span>
                      </div>
                      <div className={styles.metaBadge}>
                        <Clock size={14} />
                        <span>{path.durationStr}</span>
                      </div>
                    </div>

                    <NextLink href={path.href} className={styles.showProgramBtn}>
                      {showProgramLabel}
                    </NextLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className={`${styles.controlBtn} ${styles.nextBtn}`}
          onClick={scrollNext}
          disabled={!nextBtnEnabled}
          style={{ opacity: nextBtnEnabled ? 1 : 0.4, cursor: nextBtnEnabled ? 'pointer' : 'default' }}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {scrollSnaps.length > 1 && (
        <div className={styles.pagination}>
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === selectedIndex ? styles.dotActive : ''}`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      <div className={styles.footerAction}>
        <NextLink href={showAllHref} className={styles.showAllBtn}>
          {showAllLabel}
        </NextLink>
      </div>
    </div>
  );
}

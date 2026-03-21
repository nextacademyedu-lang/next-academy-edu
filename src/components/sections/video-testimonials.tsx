"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import styles from './video-testimonials.module.css';

type VideoTestimonial = {
  id: string;
  videoUrl: string;
  thumbnail: string | null;
  captionTitle: string;
  captionSubtitle: string;
};

export function VideoTestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: true,
    startIndex: 1,
    dragFree: true,
  });

  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('/api/home/video-testimonials');
        if (!res.ok) return;
        const data = await res.json();
        const docs = Array.isArray(data?.videos) ? data.videos as VideoTestimonial[] : [];
        setVideos(docs);
      } catch {
        // Keep component resilient
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Duplicate items for seamless looping
  const displayVideos = videos.length > 0
    ? [...videos, ...videos.map(v => ({ ...v, id: v.id + '-copy' }))]
    : [];

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  React.useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (loading) return null;
  if (displayVideos.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.headerContent}>
            <h2 className={styles.title}>Graduate <span className={styles.highlight}>Success Stories</span></h2>
            <p className={styles.subtitle}>
              Hear directly from the executives and founders who scaled their businesses using Next Academy playbooks.
            </p>
          </div>
        </motion.div>

        <div className={styles.carouselWrapper}>
          <button className={`${styles.controlBtn} ${styles.prevBtn}`} onClick={scrollPrev} aria-label="Previous">
            ←
          </button>

          <motion.div
            className={styles.embla}
            ref={emblaRef}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={styles.embla__container}>
              {displayVideos.map((video, index) => (
                <div key={video.id} className={`${styles.embla__slide} ${index === selectedIndex ? styles.activeSlide : ''}`}>
                  <div className={styles.videoWrapper}>
                    <div className={styles.videoPortrait} style={video.thumbnail ? { backgroundImage: `url(${video.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                      <div className={styles.playOverlay}>
                        <span className={styles.playIcon}>▶</span>
                      </div>
                    </div>
                    <div className={styles.captionArea}>
                      <h4 className={styles.captionTitle}>{video.captionTitle}</h4>
                      <p className={styles.captionSubtitle}>{video.captionSubtitle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <button className={`${styles.controlBtn} ${styles.nextBtn}`} onClick={scrollNext} aria-label="Next">
            →
          </button>
        </div>
      </div>
    </section>
  );
}

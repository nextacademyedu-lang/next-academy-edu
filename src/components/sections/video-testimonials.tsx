"use client";

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import styles from './video-testimonials.module.css';

export function VideoTestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'center',
    loop: true,
    startIndex: 1,
    dragFree: true,
  });

  const [selectedIndex, setSelectedIndex] = React.useState(1);

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
              {/* Vertical Video 1 */}
              <div className={`${styles.embla__slide} ${selectedIndex === 0 || selectedIndex === 4 ? styles.activeSlide : ''}`}>
                <div className={styles.videoWrapper}>
                  <div className={styles.videoPortrait}>
                    <div className={styles.playOverlay}>
                      <span className={styles.playIcon}>▶</span>
                    </div>
                  </div>
                  <div className={styles.captionArea}>
                    <h4 className={styles.captionTitle}>Scaling B2B Sales to $10M ARR</h4>
                    <p className={styles.captionSubtitle}>Amir T., VP of Sales</p>
                  </div>
                </div>
              </div>
              
              {/* Vertical Video 2 */}
              <div className={`${styles.embla__slide} ${selectedIndex === 1 || selectedIndex === 5 ? styles.activeSlide : ''}`}>
                <div className={styles.videoWrapper}>
                   <div className={styles.videoPortrait}>
                    <div className={styles.playOverlay}>
                      <span className={styles.playIcon}>▶</span>
                    </div>
                  </div>
                  <div className={styles.captionArea}>
                    <h4 className={styles.captionTitle}>Building High-Velocity Product Teams</h4>
                    <p className={styles.captionSubtitle}>Sarah M., CTO</p>
                  </div>
                </div>
              </div>
              
              {/* Vertical Video 3 */}
              <div className={`${styles.embla__slide} ${selectedIndex === 2 || selectedIndex === 6 ? styles.activeSlide : ''}`}>
                <div className={styles.videoWrapper}>
                   <div className={styles.videoPortrait}>
                    <div className={styles.playOverlay}>
                      <span className={styles.playIcon}>▶</span>
                    </div>
                  </div>
                  <div className={styles.captionArea}>
                    <h4 className={styles.captionTitle}>Mastering Finance & Series A Funding</h4>
                    <p className={styles.captionSubtitle}>Omar K., Startup Founder</p>
                  </div>
                </div>
              </div>
              
              {/* Vertical Video 4 */}
              <div className={`${styles.embla__slide} ${selectedIndex === 3 || selectedIndex === 7 ? styles.activeSlide : ''}`}>
                <div className={styles.videoWrapper}>
                   <div className={styles.videoPortrait}>
                    <div className={styles.playOverlay}>
                      <span className={styles.playIcon}>▶</span>
                    </div>
                  </div>
                  <div className={styles.captionArea}>
                    <h4 className={styles.captionTitle}>Scaling Tech Infrastructure</h4>
                    <p className={styles.captionSubtitle}>Yousef A., Lead Engineer</p>
                  </div>
                </div>
              </div>
              
              {/* Duplicate content to prevent rewind glitch on loop */}
              {/* Vertical Video 1 Copy */}
              <div className={`${styles.embla__slide} ${selectedIndex === 0 || selectedIndex === 4 ? styles.activeSlide : ''}`}>
                <div className={styles.videoWrapper}>
                  <div className={styles.videoPortrait}>
                    <div className={styles.playOverlay}>
                      <span className={styles.playIcon}>▶</span>
                    </div>
                  </div>
                  <div className={styles.captionArea}>
                    <h4 className={styles.captionTitle}>Scaling B2B Sales to $10M ARR</h4>
                    <p className={styles.captionSubtitle}>Amir T., VP of Sales</p>
                  </div>
                </div>
              </div>
              
              {/* Vertical Video 2 Copy */}
              <div className={`${styles.embla__slide} ${selectedIndex === 1 || selectedIndex === 5 ? styles.activeSlide : ''}`}>
                <div className={styles.videoWrapper}>
                   <div className={styles.videoPortrait}>
                    <div className={styles.playOverlay}>
                      <span className={styles.playIcon}>▶</span>
                    </div>
                  </div>
                  <div className={styles.captionArea}>
                    <h4 className={styles.captionTitle}>Building High-Velocity Product Teams</h4>
                    <p className={styles.captionSubtitle}>Sarah M., CTO</p>
                  </div>
                </div>
              </div>
              
              {/* Vertical Video 3 Copy */}
              <div className={`${styles.embla__slide} ${selectedIndex === 2 || selectedIndex === 6 ? styles.activeSlide : ''}`}>
                <div className={styles.videoWrapper}>
                   <div className={styles.videoPortrait}>
                    <div className={styles.playOverlay}>
                      <span className={styles.playIcon}>▶</span>
                    </div>
                  </div>
                  <div className={styles.captionArea}>
                    <h4 className={styles.captionTitle}>Mastering Finance & Series A Funding</h4>
                    <p className={styles.captionSubtitle}>Omar K., Startup Founder</p>
                  </div>
                </div>
              </div>
              
              {/* Vertical Video 4 Copy */}
              <div className={`${styles.embla__slide} ${selectedIndex === 3 || selectedIndex === 7 ? styles.activeSlide : ''}`}>
                <div className={styles.videoWrapper}>
                   <div className={styles.videoPortrait}>
                    <div className={styles.playOverlay}>
                      <span className={styles.playIcon}>▶</span>
                    </div>
                  </div>
                  <div className={styles.captionArea}>
                    <h4 className={styles.captionTitle}>Scaling Tech Infrastructure</h4>
                    <p className={styles.captionSubtitle}>Yousef A., Lead Engineer</p>
                  </div>
                </div>
              </div>
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

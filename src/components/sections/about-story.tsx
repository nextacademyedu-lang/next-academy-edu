"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import styles from './about-story.module.css';

export function AboutStory() {
  const t = useTranslations('About');

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.textCol}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className={styles.eyebrow}>{t('storyEyebrow')}</span>
          <h2 className={styles.heading}>{t('storyTitle')}</h2>
          <div className={styles.accentLine} />
          <p className={styles.paragraph}>{t('storyP1')}</p>
          <p className={styles.paragraph}>{t('storyP2')}</p>
        </motion.div>

        <motion.div
          className={styles.imageCol}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        >
          <div className={styles.imageFrame}>
            <Image
              src="/images/about/story.png"
              alt={t('storyImageAlt')}
              width={560}
              height={400}
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className={styles.imageGlow} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

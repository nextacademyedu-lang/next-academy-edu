"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import styles from './about-team.module.css';

const TEAM_MEMBERS = [
  { key: 'member1', image: '/images/about/team-1.png' },
  { key: 'member2', image: '/images/about/team-2.png' },
  { key: 'member3', image: '/images/about/team-3.png' },
];

export function AboutTeam() {
  const t = useTranslations('About');

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.eyebrow}>{t('teamEyebrow')}</span>
          <h2 className={styles.heading}>{t('teamTitle')}</h2>
          <p className={styles.subheading}>{t('teamSubtitle')}</p>
        </motion.div>

        <div className={styles.grid}>
          {TEAM_MEMBERS.map((member, i) => (
            <motion.div
              key={member.key}
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <div className={styles.avatarWrap}>
                <Image
                  src={member.image}
                  alt={t(`${member.key}Name`)}
                  width={240}
                  height={240}
                  className={styles.avatar}
                  sizes="(max-width: 768px) 50vw, 240px"
                />
                <div className={styles.avatarGlow} />
              </div>
              <h3 className={styles.name}>{t(`${member.key}Name`)}</h3>
              <span className={styles.role}>{t(`${member.key}Role`)}</span>
              <p className={styles.bio}>{t(`${member.key}Bio`)}</p>

              <div className={styles.socialLinks}>
                <a
                  href="#"
                  className={styles.socialLink}
                  aria-label={`${t(`${member.key}Name`)} LinkedIn`}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className={styles.socialLink}
                  aria-label={`${t(`${member.key}Name`)} Twitter`}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

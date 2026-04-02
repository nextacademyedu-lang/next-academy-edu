"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import styles from './about-team.module.css';

const TEAM_MEMBERS = [
  { key: 'member1', image: '/images/about/team-1.png' },
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

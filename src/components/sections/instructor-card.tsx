import Image from 'next/image';
import Link from 'next/link';
import type { Instructor, Media } from '@/payload-types';
import styles from './instructor-card.module.css';

interface Props {
  instructor: Instructor;
  locale: string;
}

export function InstructorCard({ instructor, locale }: Props) {
  const fullName = `${instructor.firstName ?? ''} ${instructor.lastName ?? ''}`.trim();
  const picture = instructor.picture as Media | null | undefined;
  const coverImage = instructor.coverImage as Media | null | undefined;
  const isAr = locale === 'ar';
  const bio = isAr ? instructor.bioAr : instructor.bioEn;
  const bioText =
    bio && typeof bio === 'object' && 'root' in bio
      ? (bio.root as { children?: { children?: { text?: string }[] }[] })?.children
          ?.flatMap((block) => block.children?.map((n) => n.text ?? '') ?? [])
          .join(' ') ?? ''
      : '';

  return (
    <section className={styles.section}>
      {/* Heading */}
      <h2 className={styles.heading}>{isAr ? 'المدرب' : 'Your Instructor'}</h2>

      <div className={styles.card}>
        {/* Cover strip */}
        <div className={styles.cover}>
          {coverImage?.url ? (
            <Image
              src={coverImage.url}
              alt=""
              fill
              className={styles.coverImg}
              sizes="100vw"
            />
          ) : (
            <div className={styles.coverFallback} />
          )}
          <div className={styles.coverOverlay} />
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Avatar */}
          <div className={styles.avatarWrap}>
            {picture?.url ? (
              <Image
                src={picture.url}
                alt={fullName}
                width={88}
                height={88}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarFallback}>
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + title */}
          <div className={styles.meta}>
            <p className={styles.name}>{fullName}</p>
            {instructor.jobTitle && (
              <p className={styles.jobTitle}>{instructor.jobTitle}</p>
            )}
            {instructor.tagline && (
              <p className={styles.tagline}>{instructor.tagline}</p>
            )}
          </div>

          {/* Social links */}
          {(instructor.linkedinUrl || instructor.twitterUrl) && (
            <div className={styles.socials}>
              {instructor.linkedinUrl && (
                <Link
                  href={instructor.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon />
                </Link>
              )}
              {instructor.twitterUrl && (
                <Link
                  href={instructor.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Twitter / X"
                >
                  <XIcon />
                </Link>
              )}
            </div>
          )}

          {/* Bio */}
          {bioText && <p className={styles.bio}>{bioText}</p>}
        </div>
      </div>
    </section>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.79 13.02H3.55V9h3.58v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

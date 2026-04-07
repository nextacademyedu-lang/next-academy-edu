'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import styles from './media-player.module.css';

interface MediaPlayerProps {
  /** YouTube embed URL or direct video URL */
  src: string;
  /** Accessible title for the embed */
  title: string;
  /** Optional thumbnail URL to show before loading */
  thumbnailUrl?: string;
}

/**
 * Premium media player with thumbnail overlay + play button.
 * On click, replaces the thumbnail with the actual YouTube iframe.
 * Falls back to native <video> for non-YouTube URLs.
 */
export function MediaPlayer({ src, title, thumbnailUrl }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  /* ── Active state: show iframe / video ───────────────────────── */
  if (isPlaying) {
    return (
      <div className={styles.playerContainer}>
        {isYouTube ? (
          <iframe
            src={`${src}${src.includes('?') ? '&' : '?'}autoplay=1`}
            title={title}
            className={styles.iframe}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <video
            src={src}
            title={title}
            className={styles.video}
            controls
            autoPlay
          />
        )}
      </div>
    );
  }

  /* ── Thumbnail state: show cover + play button ───────────────── */
  return (
    <div className={styles.playerContainer} onClick={handlePlay} role="button" tabIndex={0} aria-label={title}>
      <div className={styles.thumbnailWrap}>
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={styles.thumbnailImage}
          />
        ) : (
          <div className={styles.thumbnailPlaceholder}>
            <span className={styles.placeholderIcon}>🎬</span>
          </div>
        )}
        <div className={styles.overlay}>
          <button className={styles.playButton} aria-label="Play video">
            <svg viewBox="0 0 68 48" className={styles.playIcon}>
              <path
                d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
                fill="rgba(0,0,0,0.75)"
              />
              <path d="M45 24L27 14v20" fill="#fff" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

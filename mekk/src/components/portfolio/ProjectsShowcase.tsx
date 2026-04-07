'use client';

import React from 'react';
import PortfolioBentoGrid from './PortfolioBentoGrid';
import HorizontalScrollGallery from './HorizontalScrollGallery';
import styles from './ProjectsShowcase.module.css';

interface ProjectData {
    title: string;
    slug: string;
    category: string;
    description: string;
    image: string;
    color: string;
}

interface Props {
    items?: ProjectData[];
    bentoSize?: number;  // how many items per bento block
    scrollSize?: number; // how many items per scroll block
}

/**
 * Alternating layout: Bento Grid → Horizontal Scroll → Bento → Scroll → …
 * Splits the items array into chunks and alternates the display style.
 */
export default function ProjectsShowcase({
    items = [],
    bentoSize = 5,
    scrollSize = 4,
}: Props) {
    // Split items into alternating chunks
    const sections: { type: 'bento' | 'scroll'; items: ProjectData[] }[] = [];
    let index = 0;
    let isBento = true;

    while (index < items.length) {
        const size = isBento ? bentoSize : scrollSize;
        const chunk = items.slice(index, index + size);
        if (chunk.length > 0) {
            sections.push({ type: isBento ? 'bento' : 'scroll', items: chunk });
        }
        index += size;
        isBento = !isBento;
    }

    return (
        <div className={styles.showcase}>
            {sections.map((section, i) => (
                <React.Fragment key={i}>
                    {section.type === 'bento' ? (
                        <PortfolioBentoGrid items={section.items} />
                    ) : (
                        <HorizontalScrollGallery items={section.items} />
                    )}

                    {/* Divider between sections */}
                    {i < sections.length - 1 && (
                        <div className={styles.divider}>
                            <div className={styles.dividerLine} />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

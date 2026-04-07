'use client';

import { memo } from 'react';

/**
 * Cinematic noise grain overlay.
 * Applied globally — fixed, full-screen, pointer-events: none.
 * Uses an SVG <filter> for performant fractal noise.
 */
function NoiseOverlayComponent() {
    return (
        <div
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                pointerEvents: 'none',
                opacity: 0.04,
                mixBlendMode: 'overlay',
            }}
        >
            <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute', inset: 0 }}
            >
                <filter id="noiseFilter">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.85"
                        numOctaves="4"
                        stitchTiles="stitch"
                    />
                </filter>
                <rect
                    width="100%"
                    height="100%"
                    filter="url(#noiseFilter)"
                />
            </svg>
        </div>
    );
}

const NoiseOverlay = memo(NoiseOverlayComponent);
export default NoiseOverlay;

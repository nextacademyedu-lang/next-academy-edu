import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/* ═══════════════════════════════════════
   ANIMATION PRESETS
   Reusable GSAP animation factory functions
   ═══════════════════════════════════════ */

interface AnimationOptions {
    duration?: number;
    delay?: number;
    ease?: string;
    scrub?: boolean | number;
    start?: string;
    end?: string;
}

/** Fade element in from below */
export function fadeInUp(
    element: gsap.TweenTarget,
    trigger: string | Element,
    options: AnimationOptions = {}
) {
    const {
        duration = 1,
        delay = 0,
        ease = 'power3.out',
        start = 'top 85%',
        end = 'top 20%',
        scrub = false,
    } = options;

    return gsap.from(element, {
        y: 60,
        opacity: 0,
        duration: scrub ? undefined : duration,
        delay: scrub ? undefined : delay,
        ease,
        scrollTrigger: {
            trigger,
            start,
            end,
            scrub,
        },
    });
}

/** Stagger multiple elements fading in from below */
export function staggerFadeIn(
    elements: gsap.TweenTarget,
    trigger: string | Element,
    stagger = 0.1,
    options: AnimationOptions = {}
) {
    const { start = 'top 80%', end = 'bottom 20%', scrub = false } = options;

    return gsap.from(elements, {
        y: 40,
        opacity: 0,
        stagger,
        duration: scrub ? undefined : 0.8,
        ease: 'power2.out',
        scrollTrigger: {
            trigger,
            start,
            end,
            scrub,
        },
    });
}

/** Word-by-word color reveal */
export function wordReveal(
    words: Element[],
    trigger: string | Element,
    options: AnimationOptions = {}
) {
    const { start = 'top 75%', end = 'bottom 30%', scrub = 1 } = options;

    return gsap.fromTo(
        words,
        { color: 'rgba(255, 252, 242, 0.12)' },
        {
            color: 'rgba(255, 252, 242, 1)',
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: {
                trigger,
                start,
                end,
                scrub,
            },
        }
    );
}

/** Char-by-char reveal from below */
export function charReveal(
    chars: Element[],
    trigger: string | Element,
    options: AnimationOptions = {}
) {
    const { duration = 1.2, delay = 0, ease = 'power3.out', start = 'top 80%' } =
        options;

    return gsap.from(chars, {
        y: 100,
        opacity: 0,
        stagger: 0.02,
        duration,
        delay,
        ease,
        scrollTrigger: {
            trigger,
            start,
        },
    });
}

/** Parallax movement on scroll */
export function parallax(
    element: gsap.TweenTarget,
    trigger: string | Element,
    speed = -100
) {
    return gsap.to(element, {
        y: speed,
        ease: 'none',
        scrollTrigger: {
            trigger,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        },
    });
}

/** Animate a number counter */
export function counterUp(
    element: HTMLElement,
    target: number,
    trigger: string | Element
) {
    const counter = { value: 0 };

    return gsap.to(counter, {
        value: target,
        duration: 2,
        ease: 'power1.out',
        scrollTrigger: {
            trigger,
            start: 'top 70%',
        },
        onUpdate: () => {
            element.textContent = Math.round(counter.value).toString();
        },
    });
}

/** Pin a section */
export function pinSection(
    trigger: string | Element,
    options: { end?: string; pinSpacing?: boolean } = {}
) {
    const { end = '+=200%', pinSpacing = true } = options;

    return ScrollTrigger.create({
        trigger,
        start: 'top top',
        end,
        pin: true,
        pinSpacing,
    });
}

/** 3D diagonal text rotation on scroll */
export function diagonalTextReveal(
    element: gsap.TweenTarget,
    trigger: string | Element
) {
    return gsap.fromTo(
        element,
        {
            rotateX: 20,
            rotateZ: -8,
            y: 150,
            opacity: 0.3,
            scale: 0.9,
        },
        {
            rotateX: 0,
            rotateZ: 0,
            y: -150,
            opacity: 1,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
                trigger,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
            },
        }
    );
}

/**
 * Animated SVG illustrations — Booking & Program emails
 * 9 illustrations for booking, rounds, waitlist, certificate, reviews
 */

const RED = '#C51B1B';
const LIGHT = '#F1F6F1';
const SEC = '#C5C5C5';
const DARK = '#1a1a1a';
const GREEN = '#22c55e';
const GOLD = '#C9A96E';

export function bookingConfirmationIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes checkDraw{0%{stroke-dashoffset:35}60%,100%{stroke-dashoffset:0}}
    @keyframes calPop{0%{transform:scale(.9);opacity:.5}40%,100%{transform:scale(1);opacity:1}}
    .cal{animation:calPop 2.5s ease-out infinite}
    .chk{stroke-dasharray:35;animation:checkDraw 2.5s ease-out infinite}
  </style>
  <g class="cal" style="transform-origin:140px 85px">
    <rect x="105" y="50" width="70" height="75" rx="6" fill="${DARK}" stroke="${SEC}" stroke-width="1.5"/>
    <rect x="105" y="50" width="70" height="20" rx="6" fill="${GREEN}" opacity=".8"/>
    <rect x="105" y="62" width="70" height="8" fill="${GREEN}" opacity=".8"/>
    <line x1="125" y1="45" x2="125" y2="55" stroke="${SEC}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="155" y1="45" x2="155" y2="55" stroke="${SEC}" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="120" cy="85" r="2" fill="${SEC}" opacity=".3"/>
    <circle cx="133" cy="85" r="2" fill="${SEC}" opacity=".3"/>
    <circle cx="146" cy="85" r="2" fill="${SEC}" opacity=".3"/>
    <circle cx="159" cy="85" r="2" fill="${SEC}" opacity=".3"/>
    <circle cx="120" cy="100" r="2" fill="${SEC}" opacity=".3"/>
    <circle cx="133" cy="100" r="2" fill="${SEC}" opacity=".3"/>
  </g>
  <polyline class="chk" points="128,95 138,107 158,82" fill="none" stroke="${GREEN}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

export function bookingCancelledIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes xDraw{0%{stroke-dashoffset:30}60%,100%{stroke-dashoffset:0}}
    @keyframes shake{0%,100%{transform:translateX(0)}10%{transform:translateX(-3px)}20%{transform:translateX(3px)}30%{transform:translateX(-2px)}40%{transform:translateX(0)}}
    .xM{stroke-dasharray:30;animation:xDraw 2.5s ease-out infinite}
    .shk{animation:shake 2.5s ease-in-out infinite}
  </style>
  <g class="shk" style="transform-origin:140px 85px">
    <rect x="105" y="50" width="70" height="75" rx="6" fill="${DARK}" stroke="${SEC}" stroke-width="1.5"/>
    <rect x="105" y="50" width="70" height="20" rx="6" fill="${RED}" opacity=".7"/>
    <rect x="105" y="62" width="70" height="8" fill="${RED}" opacity=".7"/>
    <line x1="125" y1="45" x2="125" y2="55" stroke="${SEC}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="155" y1="45" x2="155" y2="55" stroke="${SEC}" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <line class="xM" x1="128" y1="88" x2="152" y2="112" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
  <line class="xM" x1="152" y1="88" x2="128" y2="112" stroke="${RED}" stroke-width="4" stroke-linecap="round" style="animation-delay:.15s"/>
</svg>`;
}

export function roundCancelledIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes tearAway{0%,30%{transform:translateX(0) rotate(0);opacity:1}100%{transform:translateX(60px) rotate(15deg);opacity:0}}
    .tear{animation:tearAway 3.5s ease-in infinite;transform-origin:170px 50px}
  </style>
  <rect x="105" y="50" width="70" height="75" rx="6" fill="${DARK}" stroke="${SEC}" stroke-width="1.5" opacity=".4"/>
  <g class="tear">
    <rect x="108" y="52" width="64" height="30" rx="3" fill="#2a2a2a" stroke="${SEC}" stroke-width="1" opacity=".8"/>
    <line x1="115" y1="60" x2="160" y2="60" stroke="${SEC}" stroke-width="1" opacity=".3"/>
    <line x1="115" y1="68" x2="150" y2="68" stroke="${SEC}" stroke-width="1" opacity=".3"/>
  </g>
  <text x="140" y="110" text-anchor="middle" font-size="12" font-weight="700" fill="${RED}" opacity=".7" transform="rotate(-10 140 110)">CANCELLED</text>
</svg>`;
}

export function roundReminder3dIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes numPulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.1);opacity:1}}
    @keyframes ringRotate{0%{stroke-dashoffset:188}100%{stroke-dashoffset:0}}
    .num{animation:numPulse 2s ease-in-out infinite;transform-origin:140px 90px}
    .ring{stroke-dasharray:188;animation:ringRotate 4s linear infinite}
  </style>
  <circle cx="140" cy="90" r="50" fill="${DARK}" stroke="#222" stroke-width="2"/>
  <circle class="ring" cx="140" cy="90" r="30" fill="none" stroke="${GOLD}" stroke-width="3" stroke-linecap="round" transform="rotate(-90 140 90)"/>
  <g class="num"><text x="140" y="100" text-anchor="middle" font-size="40" font-weight="800" fill="${LIGHT}" font-family="monospace">3</text></g>
  <text x="140" y="130" text-anchor="middle" font-size="11" fill="${SEC}" opacity=".6">days</text>
</svg>`;
}

export function roundReminder1dIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes bellWobble{0%,100%{transform:rotate(0)}15%{transform:rotate(12deg)}30%{transform:rotate(-10deg)}45%{transform:rotate(6deg)}60%{transform:rotate(0)}}
    .bell{animation:bellWobble 2s ease-in-out infinite;transform-origin:140px 55px}
  </style>
  <g class="bell">
    <path d="M140,45 C140,45 165,55 165,90 L165,100 L115,100 L115,90 C115,55 140,45 140,45Z" fill="${GOLD}" opacity=".85"/>
    <rect x="112" y="98" width="56" height="6" rx="3" fill="${GOLD}" opacity=".9"/>
    <circle cx="140" cy="42" r="4" fill="${GOLD}"/>
  </g>
  <circle cx="140" cy="110" r="5" fill="${GOLD}" opacity=".7"/>
  <circle cx="170" cy="50" r="10" fill="${RED}"/>
  <text x="170" y="54" text-anchor="middle" font-size="12" font-weight="700" fill="${LIGHT}">1</text>
</svg>`;
}

export function waitlistSpotIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes slideForward{0%,40%{transform:translateX(0)}60%,100%{transform:translateX(-20px)}}
    @keyframes spotGlow{0%,40%{opacity:0}60%{opacity:.6}100%{opacity:.2}}
    .person{animation:slideForward 3s ease-in-out infinite}
    .spot{animation:spotGlow 3s ease-in-out infinite}
  </style>
  <circle cx="95" cy="80" r="7" fill="${SEC}" opacity=".3"/>
  <rect x="90" y="90" width="10" height="16" rx="3" fill="${SEC}" opacity=".2"/>
  <circle cx="120" cy="80" r="7" fill="${SEC}" opacity=".3"/>
  <rect x="115" y="90" width="10" height="16" rx="3" fill="${SEC}" opacity=".2"/>
  <circle class="spot" cx="165" cy="88" r="18" fill="${GREEN}"/>
  <g class="person">
    <circle cx="165" cy="80" r="8" fill="${GOLD}" opacity=".8"/>
    <rect x="159" y="92" width="12" height="18" rx="4" fill="${GOLD}" opacity=".7"/>
  </g>
</svg>`;
}

export function certificateReadyIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes unfurl{0%{transform:scaleY(0)}40%,100%{transform:scaleY(1)}}
    @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}
    .ribbon{animation:unfurl 2.5s ease-out infinite;transform-origin:140px 120px}
    .seal{animation:shimmer 2s ease-in-out infinite}
  </style>
  <rect x="95" y="40" width="90" height="70" rx="4" fill="${DARK}" stroke="${GOLD}" stroke-width="1.5"/>
  <rect x="101" y="46" width="78" height="58" rx="2" fill="none" stroke="${GOLD}" stroke-width=".5" opacity=".5"/>
  <line x1="115" y1="58" x2="165" y2="58" stroke="${SEC}" stroke-width="1.5" opacity=".3"/>
  <line x1="120" y1="68" x2="160" y2="68" stroke="${SEC}" stroke-width="1" opacity=".2"/>
  <line x1="125" y1="76" x2="155" y2="76" stroke="${SEC}" stroke-width="1" opacity=".2"/>
  <circle class="seal" cx="140" cy="95" r="12" fill="${RED}" opacity=".8"/>
  <text x="140" y="99" text-anchor="middle" font-size="10" fill="${LIGHT}">★</text>
  <g class="ribbon">
    <line x1="134" y1="107" x2="128" y2="128" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>
    <line x1="146" y1="107" x2="152" y2="128" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>`;
}

export function reviewRequestIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes sl1{0%{fill:#333;opacity:.3}20%,100%{fill:${GOLD};opacity:1}}
    @keyframes sl2{0%,20%{fill:#333;opacity:.3}40%,100%{fill:${GOLD};opacity:1}}
    @keyframes sl3{0%,40%{fill:#333;opacity:.3}60%,100%{fill:${GOLD};opacity:1}}
    @keyframes sl4{0%,60%{fill:#333;opacity:.3}80%,100%{fill:${GOLD};opacity:1}}
    @keyframes sl5{0%,80%{fill:#333;opacity:.3}100%{fill:${GOLD};opacity:1}}
    .s1{animation:sl1 3s ease infinite}.s2{animation:sl2 3s ease infinite}
    .s3{animation:sl3 3s ease infinite}.s4{animation:sl4 3s ease infinite}
    .s5{animation:sl5 3s ease infinite}
  </style>
  <g transform="translate(56,65)"><polygon class="s1" points="16,0 20,12 32,12 22,20 26,32 16,24 6,32 10,20 0,12 12,12" stroke="${GOLD}" stroke-width="1"/></g>
  <g transform="translate(96,65)"><polygon class="s2" points="16,0 20,12 32,12 22,20 26,32 16,24 6,32 10,20 0,12 12,12" stroke="${GOLD}" stroke-width="1"/></g>
  <g transform="translate(136,65)"><polygon class="s3" points="16,0 20,12 32,12 22,20 26,32 16,24 6,32 10,20 0,12 12,12" stroke="${GOLD}" stroke-width="1"/></g>
  <g transform="translate(176,65)"><polygon class="s4" points="16,0 20,12 32,12 22,20 26,32 16,24 6,32 10,20 0,12 12,12" stroke="${GOLD}" stroke-width="1"/></g>
  <g transform="translate(216,65)"><polygon class="s5" points="16,0 20,12 32,12 22,20 26,32 16,24 6,32 10,20 0,12 12,12" stroke="${GOLD}" stroke-width="1"/></g>
</svg>`;
}

export function reviewReminderIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes sp{0%,100%{opacity:.5;transform:scale(.95)}50%{opacity:1;transform:scale(1.05)}}
    @keyframes gw{0%,100%{opacity:0}50%{opacity:.2}}
    .sp{animation:sp 2s ease-in-out infinite;transform-origin:center}
    .gw{animation:gw 2s ease-in-out infinite}
  </style>
  <circle class="gw" cx="140" cy="85" r="50" fill="${GOLD}"/>
  <g class="sp" transform="translate(56,65)"><polygon points="16,0 20,12 32,12 22,20 26,32 16,24 6,32 10,20 0,12 12,12" fill="${GOLD}" opacity=".8"/></g>
  <g class="sp" transform="translate(96,65)" style="animation-delay:.1s"><polygon points="16,0 20,12 32,12 22,20 26,32 16,24 6,32 10,20 0,12 12,12" fill="${GOLD}" opacity=".8"/></g>
  <g class="sp" transform="translate(136,65)" style="animation-delay:.2s"><polygon points="16,0 20,12 32,12 22,20 26,32 16,24 6,32 10,20 0,12 12,12" fill="${GOLD}" opacity=".8"/></g>
  <g class="sp" transform="translate(176,65)" style="animation-delay:.3s"><polygon points="16,0 20,12 32,12 22,20 26,32 16,24 6,32 10,20 0,12 12,12" fill="${GOLD}" opacity=".8"/></g>
  <g class="sp" transform="translate(216,65)" style="animation-delay:.4s"><polygon points="16,0 20,12 32,12 22,20 26,32 16,24 6,32 10,20 0,12 12,12" fill="${GOLD}" opacity=".8"/></g>
</svg>`;
}

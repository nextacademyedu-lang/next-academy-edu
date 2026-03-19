/**
 * Animated SVG illustrations — Consultation & Admin emails
 * 5 illustrations for consultation booking/completion/cancellation/reminder, admin-new-booking
 */

const RED = '#C51B1B';
const LIGHT = '#F1F6F1';
const SEC = '#C5C5C5';
const DARK = '#1a1a1a';
const GREEN = '#22c55e';
const GOLD = '#C9A96E';

export function consultationBookedIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes connectPulse{0%,100%{opacity:.3;r:3}50%{opacity:1;r:5}}
    @keyframes lineDraw{0%{stroke-dashoffset:60}50%,100%{stroke-dashoffset:0}}
    .dot{animation:connectPulse 2s ease-in-out infinite}
    .link{stroke-dasharray:60;animation:lineDraw 2.5s ease-out infinite}
  </style>
  <!-- Person A -->
  <circle cx="100" cy="75" r="14" fill="${DARK}" stroke="${SEC}" stroke-width="1.5"/>
  <circle cx="100" cy="72" r="6" fill="${SEC}" opacity=".5"/>
  <rect x="92" y="82" width="16" height="8" rx="4" fill="${SEC}" opacity=".3"/>
  <!-- Person B -->
  <circle cx="180" cy="75" r="14" fill="${DARK}" stroke="${GOLD}" stroke-width="1.5"/>
  <circle cx="180" cy="72" r="6" fill="${GOLD}" opacity=".6"/>
  <rect x="172" y="82" width="16" height="8" rx="4" fill="${GOLD}" opacity=".4"/>
  <!-- Connection line -->
  <line class="link" x1="116" y1="75" x2="164" y2="75" stroke="${GREEN}" stroke-width="2" stroke-linecap="round"/>
  <!-- Pulse dots -->
  <circle class="dot" cx="130" cy="75" fill="${GREEN}"/>
  <circle class="dot" cx="140" cy="75" fill="${GREEN}" style="animation-delay:.3s"/>
  <circle class="dot" cx="150" cy="75" fill="${GREEN}" style="animation-delay:.6s"/>
  <!-- Calendar badge -->
  <rect x="125" y="100" width="30" height="25" rx="4" fill="${DARK}" stroke="${SEC}" stroke-width="1"/>
  <rect x="125" y="100" width="30" height="8" rx="4" fill="${GREEN}" opacity=".7"/>
  <circle cx="140" cy="118" r="3" fill="${GREEN}" opacity=".5"/>
</svg>`;
}

export function consultationCompletedIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes checkScale{0%{transform:scale(0);opacity:0}40%{transform:scale(1.15);opacity:1}60%,100%{transform:scale(1);opacity:1}}
    @keyframes sp{0%,50%{opacity:0;transform:scale(0)}70%{opacity:1;transform:scale(1.2)}100%{opacity:0;transform:scale(.5)}}
    .cs{animation:checkScale 2.5s ease-out infinite;transform-origin:140px 80px}
    .sp{animation:sp 2.5s ease-out infinite}
  </style>
  <!-- Circle outline -->
  <circle cx="140" cy="80" r="38" fill="${DARK}" stroke="${GREEN}" stroke-width="2"/>
  <!-- Big check -->
  <g class="cs">
    <polyline points="122,80 135,94 158,66" fill="none" stroke="${GREEN}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <!-- Sparkles -->
  <path class="sp" d="M90,50 L92,45 L94,50 L92,55Z" fill="${GOLD}" style="animation-delay:0s"/>
  <path class="sp" d="M195,55 L197,50 L199,55 L197,60Z" fill="${GOLD}" style="animation-delay:.3s"/>
  <path class="sp" d="M85,100 L87,96 L89,100 L87,104Z" fill="${GREEN}" style="animation-delay:.6s"/>
  <!-- "Complete" text -->
  <text x="140" y="135" text-anchor="middle" font-size="10" fill="${SEC}" opacity=".5">Session Complete</text>
</svg>`;
}

export function consultationCancelledIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes xScale{0%{transform:scale(0);opacity:0}40%,100%{transform:scale(1);opacity:1}}
    @keyframes ripple{0%{r:38;opacity:.3}100%{r:55;opacity:0}}
    .xs{animation:xScale 2.5s ease-out infinite;transform-origin:140px 80px}
    .rp{animation:ripple 2s ease-out infinite}
  </style>
  <circle class="rp" cx="140" cy="80" r="38" fill="none" stroke="${RED}" stroke-width="1"/>
  <circle cx="140" cy="80" r="38" fill="${DARK}" stroke="${RED}" stroke-width="2"/>
  <g class="xs">
    <line x1="126" y1="66" x2="154" y2="94" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
    <line x1="154" y1="66" x2="126" y2="94" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>`;
}

export function consultationReminderIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes clockTick{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
    @keyframes personBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    .hand{animation:clockTick 6s linear infinite;transform-origin:115px 85px}
    .person{animation:personBounce 2s ease-in-out infinite}
  </style>
  <!-- Clock -->
  <circle cx="115" cy="85" r="30" fill="${DARK}" stroke="${GOLD}" stroke-width="2"/>
  <line x1="115" y1="85" x2="115" y2="65" stroke="${LIGHT}" stroke-width="2" stroke-linecap="round"/>
  <g class="hand">
    <line x1="115" y1="85" x2="132" y2="85" stroke="${RED}" stroke-width="2" stroke-linecap="round"/>
  </g>
  <circle cx="115" cy="85" r="3" fill="${GOLD}"/>
  <!-- Person -->
  <g class="person">
    <circle cx="180" cy="75" r="10" fill="${SEC}" opacity=".5"/>
    <rect x="172" y="88" width="16" height="20" rx="4" fill="${SEC}" opacity=".4"/>
  </g>
  <!-- Arrow connecting -->
  <line x1="148" y1="85" x2="165" y2="82" stroke="${SEC}" stroke-width="1.5" stroke-dasharray="4 2" opacity=".4"/>
</svg>`;
}

export function adminNewBookingIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes notifSlide{0%{transform:translateY(-10px);opacity:0}30%,100%{transform:translateY(0);opacity:1}}
    @keyframes badgePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
    .notif{animation:notifSlide 2s ease-out infinite}
    .badge{animation:badgePulse 1.5s ease-in-out infinite;transform-origin:175px 47px}
  </style>
  <!-- Dashboard panel -->
  <rect x="95" y="45" width="90" height="90" rx="6" fill="${DARK}" stroke="${SEC}" stroke-width="1.5"/>
  <!-- Header bar -->
  <rect x="95" y="45" width="90" height="16" rx="6" fill="#222"/>
  <rect x="95" y="55" width="90" height="6" fill="#222"/>
  <circle cx="105" cy="53" r="3" fill="${RED}" opacity=".6"/>
  <circle cx="115" cy="53" r="3" fill="${GOLD}" opacity=".6"/>
  <circle cx="125" cy="53" r="3" fill="${GREEN}" opacity=".6"/>
  <!-- List items -->
  <g class="notif">
    <rect x="102" y="68" width="76" height="12" rx="2" fill="#222" stroke="${GREEN}" stroke-width="1" opacity=".8"/>
    <circle cx="110" cy="74" r="3" fill="${GREEN}" opacity=".6"/>
    <line x1="117" y1="74" x2="168" y2="74" stroke="${SEC}" stroke-width="1" opacity=".3"/>
  </g>
  <rect x="102" y="85" width="76" height="12" rx="2" fill="#222" opacity=".4"/>
  <rect x="102" y="102" width="76" height="12" rx="2" fill="#222" opacity=".3"/>
  <rect x="102" y="119" width="76" height="10" rx="2" fill="#222" opacity=".2"/>
  <!-- Notification badge -->
  <g class="badge">
    <circle cx="175" cy="47" r="10" fill="${RED}"/>
    <text x="175" y="51" text-anchor="middle" font-size="10" font-weight="700" fill="${LIGHT}">1</text>
  </g>
</svg>`;
}

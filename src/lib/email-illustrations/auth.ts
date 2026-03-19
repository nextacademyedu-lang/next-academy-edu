/**
 * Animated SVG illustrations — Auth & Security emails
 * 8 illustrations for: welcome, email-verification, password-reset, otp,
 * email-changed, security-alert, account-deletion-confirm, account-deleted
 */

const RED = '#C51B1B';
const LIGHT = '#F1F6F1';
const SEC = '#C5C5C5';
const DARK = '#1a1a1a';
const GREEN = '#22c55e';
const GOLD = '#C9A96E';

// ─── Welcome ─────────────────────────────────────────────────────────────────

export function welcomeIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes capFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes sparkle1{0%,100%{opacity:0;transform:scale(.5)}50%{opacity:1;transform:scale(1)}}
    @keyframes sparkle2{0%,100%{opacity:0;transform:scale(.3)}60%{opacity:1;transform:scale(1)}}
    @keyframes sparkle3{0%,100%{opacity:0}40%{opacity:1}}
    .cap{animation:capFloat 3s ease-in-out infinite}
    .sp1{animation:sparkle1 2s ease-in-out infinite}
    .sp2{animation:sparkle2 2.5s ease-in-out .3s infinite}
    .sp3{animation:sparkle3 1.8s ease-in-out .6s infinite}
  </style>
  <g class="cap" style="transform-origin:140px 80px">
    <!-- Graduation cap body -->
    <polygon points="140,45 195,70 140,95 85,70" fill="${RED}" opacity=".9"/>
    <polygon points="140,95 195,70 195,78 140,103" fill="${RED}" opacity=".7"/>
    <polygon points="140,95 85,70 85,78 140,103" fill="${RED}" opacity=".6"/>
    <!-- cap top square -->
    <rect x="120" y="38" width="40" height="6" rx="1" fill="${RED}"/>
    <!-- Tassel -->
    <line x1="195" y1="70" x2="210" y2="100" stroke="${GOLD}" stroke-width="2"/>
    <circle cx="210" cy="103" r="4" fill="${GOLD}"/>
  </g>
  <!-- Book base -->
  <rect x="100" y="110" width="80" height="10" rx="3" fill="${DARK}"/>
  <rect x="105" y="115" width="70" height="10" rx="3" fill="#222"/>
  <!-- Sparkles -->
  <g class="sp1"><path d="M60,50 L63,45 L66,50 L63,55Z" fill="${GOLD}" opacity=".8"/></g>
  <g class="sp2"><path d="M220,40 L222,36 L224,40 L222,44Z" fill="${GOLD}" opacity=".7"/></g>
  <g class="sp3"><circle cx="75" cy="100" r="2" fill="${GOLD}" opacity=".6"/></g>
  <g class="sp2"><circle cx="210" cy="115" r="2.5" fill="${GOLD}" opacity=".5"/></g>
  <g class="sp1"><path d="M50,85 L52,81 L54,85 L52,89Z" fill="${RED}" opacity=".4"/></g>
  <g class="sp3"><path d="M235,70 L237,66 L239,70 L237,74Z" fill="${RED}" opacity=".5"/></g>
</svg>`;
}

// ─── Email Verification ──────────────────────────────────────────────────────

export function emailVerificationIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes flapOpen{0%{transform:rotateX(0deg)}40%{transform:rotateX(-180deg)}100%{transform:rotateX(-180deg)}}
    @keyframes checkDraw{0%,40%{stroke-dashoffset:40}70%,100%{stroke-dashoffset:0}}
    @keyframes checkFade{0%,40%{opacity:0}60%,100%{opacity:1}}
    @keyframes envelopePulse{0%,100%{filter:drop-shadow(0 0 0 transparent)}50%{filter:drop-shadow(0 0 8px rgba(197,27,27,.3))}}
    .flap{animation:flapOpen 3s ease-in-out infinite;transform-origin:140px 65px}
    .check{stroke-dasharray:40;animation:checkDraw 3s ease-in-out infinite}
    .checkG{animation:checkFade 3s ease-in-out infinite}
    .env{animation:envelopePulse 3s ease-in-out infinite}
  </style>
  <!-- Envelope body -->
  <g class="env">
    <rect x="90" y="65" width="100" height="70" rx="6" fill="${DARK}" stroke="${SEC}" stroke-width="1"/>
    <!-- Envelope V fold lines -->
    <line x1="90" y1="65" x2="140" y2="100" stroke="${SEC}" stroke-width="1" opacity=".5"/>
    <line x1="190" y1="65" x2="140" y2="100" stroke="${SEC}" stroke-width="1" opacity=".5"/>
  </g>
  <!-- Envelope flap -->
  <g class="flap">
    <polygon points="90,65 140,40 190,65" fill="${DARK}" stroke="${SEC}" stroke-width="1"/>
  </g>
  <!-- Shield + checkmark (appears after flap opens) -->
  <g class="checkG">
    <path d="M140,52 L155,60 L155,78 C155,88 140,95 140,95 C140,95 125,88 125,78 L125,60Z" fill="${RED}" opacity=".9"/>
    <polyline class="check" points="132,74 138,81 150,67" fill="none" stroke="${LIGHT}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

// ─── Password Reset ──────────────────────────────────────────────────────────

export function passwordResetIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes keyTurn{0%,100%{transform:rotate(0deg)}30%{transform:rotate(-25deg)}60%{transform:rotate(15deg)}}
    @keyframes lockGlow{0%,100%{opacity:.5}50%{opacity:1}}
    .key{animation:keyTurn 3s ease-in-out infinite;transform-origin:155px 95px}
    .glow{animation:lockGlow 3s ease-in-out infinite}
  </style>
  <!-- Lock body -->
  <rect x="115" y="80" width="50" height="45" rx="6" fill="${DARK}" stroke="${SEC}" stroke-width="1.5"/>
  <!-- Lock shackle -->
  <path d="M125,80 L125,65 C125,50 155,50 155,65 L155,80" fill="none" stroke="${SEC}" stroke-width="3" stroke-linecap="round"/>
  <!-- Keyhole -->
  <circle cx="140" cy="98" r="6" fill="#111" class="glow"/>
  <rect x="138" y="100" width="4" height="12" rx="1" fill="#111"/>
  <!-- Key -->
  <g class="key">
    <line x1="155" y1="95" x2="195" y2="95" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="198" cy="95" r="8" fill="none" stroke="${GOLD}" stroke-width="3"/>
    <line x1="170" y1="95" x2="170" y2="103" stroke="${GOLD}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="180" y1="95" x2="180" y2="100" stroke="${GOLD}" stroke-width="2.5" stroke-linecap="round"/>
  </g>
</svg>`;
}

// ─── OTP Verification ────────────────────────────────────────────────────────

export function otpVerificationIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes digitPulse1{0%,100%{opacity:.4}25%{opacity:1}}
    @keyframes digitPulse2{0%,100%{opacity:.4}50%{opacity:1}}
    @keyframes digitPulse3{0%,100%{opacity:.4}75%{opacity:1}}
    @keyframes shieldGlow{0%,100%{filter:drop-shadow(0 0 0 transparent)}50%{filter:drop-shadow(0 0 12px rgba(197,27,27,.2))}}
    .d1{animation:digitPulse1 2s ease-in-out infinite}
    .d2{animation:digitPulse2 2s ease-in-out infinite}
    .d3{animation:digitPulse3 2s ease-in-out infinite}
    .shield{animation:shieldGlow 3s ease-in-out infinite}
  </style>
  <!-- Shield -->
  <g class="shield">
    <path d="M140,30 L175,45 L175,90 C175,115 140,135 140,135 C140,135 105,115 105,90 L105,45Z" fill="${DARK}" stroke="${RED}" stroke-width="2" opacity=".9"/>
  </g>
  <!-- OTP digits -->
  <g font-family="monospace" font-size="28" font-weight="700" text-anchor="middle">
    <text x="125" y="88" fill="${LIGHT}" class="d1">4</text>
    <text x="140" y="88" fill="${LIGHT}" class="d2">7</text>
    <text x="155" y="88" fill="${LIGHT}" class="d3">2</text>
  </g>
  <!-- Dots below -->
  <circle cx="125" cy="105" r="3" fill="${RED}" class="d1" opacity=".6"/>
  <circle cx="140" cy="105" r="3" fill="${RED}" class="d2" opacity=".6"/>
  <circle cx="155" cy="105" r="3" fill="${RED}" class="d3" opacity=".6"/>
</svg>`;
}

// ─── Email Changed ───────────────────────────────────────────────────────────

export function emailChangedIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes slideRight{0%,100%{transform:translateX(0);opacity:.6}50%{transform:translateX(8px);opacity:1}}
    @keyframes arrowBounce{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}
    .slide{animation:slideRight 2.5s ease-in-out infinite}
    .arrow{animation:arrowBounce 1.5s ease-in-out infinite}
  </style>
  <!-- Old envelope (faded) -->
  <g opacity=".4">
    <rect x="55" y="65" width="70" height="50" rx="5" fill="${DARK}" stroke="${SEC}" stroke-width="1"/>
    <polyline points="55,65 90,90 125,65" fill="none" stroke="${SEC}" stroke-width="1"/>
  </g>
  <!-- Arrow -->
  <g class="arrow">
    <line x1="135" y1="90" x2="155" y2="90" stroke="${RED}" stroke-width="2.5" stroke-linecap="round"/>
    <polyline points="150,84 157,90 150,96" fill="none" stroke="${RED}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <!-- New envelope (bright) -->
  <g class="slide">
    <rect x="165" y="65" width="70" height="50" rx="5" fill="${DARK}" stroke="${GREEN}" stroke-width="1.5"/>
    <polyline points="165,65 200,90 235,65" fill="none" stroke="${GREEN}" stroke-width="1"/>
    <circle cx="225" cy="65" r="8" fill="${GREEN}"/>
    <text x="225" y="69" text-anchor="middle" font-size="10" font-weight="700" fill="${DARK}">✓</text>
  </g>
</svg>`;
}

// ─── Security Alert ──────────────────────────────────────────────────────────

export function securityAlertIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes alertPulse{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
    @keyframes exclaim{0%,100%{opacity:.5}50%{opacity:1}}
    @keyframes ring1{0%{r:45;opacity:.3}100%{r:65;opacity:0}}
    @keyframes ring2{0%{r:45;opacity:.2}100%{r:75;opacity:0}}
    .alert{animation:alertPulse 1.5s ease-in-out infinite;transform-origin:140px 85px}
    .exc{animation:exclaim 1s ease-in-out infinite}
    .r1{animation:ring1 2s ease-out infinite}
    .r2{animation:ring2 2s ease-out .5s infinite}
  </style>
  <!-- Pulse rings -->
  <circle class="r1" cx="140" cy="85" r="45" fill="none" stroke="${RED}" stroke-width="1.5"/>
  <circle class="r2" cx="140" cy="85" r="45" fill="none" stroke="${RED}" stroke-width="1"/>
  <!-- Shield -->
  <g class="alert">
    <path d="M140,40 L172,53 L172,90 C172,112 140,128 140,128 C140,128 108,112 108,90 L108,53Z" fill="${RED}" opacity=".15"/>
    <path d="M140,40 L172,53 L172,90 C172,112 140,128 140,128 C140,128 108,112 108,90 L108,53Z" fill="none" stroke="${RED}" stroke-width="2"/>
  </g>
  <!-- Exclamation -->
  <g class="exc">
    <rect x="137" y="62" width="6" height="35" rx="3" fill="${RED}"/>
    <circle cx="140" cy="110" r="4" fill="${RED}"/>
  </g>
</svg>`;
}

// ─── Account Deletion Confirm ────────────────────────────────────────────────

export function accountDeletionConfirmIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes waveHand{0%,100%{transform:rotate(0deg)}15%{transform:rotate(14deg)}30%{transform:rotate(-8deg)}45%{transform:rotate(10deg)}60%{transform:rotate(0deg)}}
    @keyframes cautionPulse{0%,100%{opacity:.6}50%{opacity:1}}
    .hand{animation:waveHand 2s ease-in-out infinite;transform-origin:140px 110px}
    .caution{animation:cautionPulse 2s ease-in-out infinite}
  </style>
  <!-- Warning triangle -->
  <g class="caution">
    <polygon points="140,35 175,95 105,95" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linejoin="round"/>
    <text x="140" y="82" text-anchor="middle" font-size="24" fill="#f59e0b">!</text>
  </g>
  <!-- Person silhouette -->
  <g class="hand">
    <circle cx="140" cy="115" r="12" fill="${SEC}" opacity=".5"/>
    <rect x="130" y="130" width="20" height="25" rx="4" fill="${SEC}" opacity=".4"/>
  </g>
  <!-- Question marks -->
  <text x="95" y="70" font-size="16" fill="${SEC}" opacity=".3">?</text>
  <text x="185" y="65" font-size="14" fill="${SEC}" opacity=".25">?</text>
</svg>`;
}

// ─── Account Deleted ─────────────────────────────────────────────────────────

export function accountDeletedIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes doorClose{0%{transform:scaleX(1)}50%{transform:scaleX(.1)}100%{transform:scaleX(0)}}
    @keyframes fadeSlow{0%{opacity:.8}100%{opacity:.3}}
    .door{animation:doorClose 4s ease-in-out forwards;transform-origin:170px 90px}
    .fade{animation:fadeSlow 4s ease-in-out forwards}
  </style>
  <!-- Door frame -->
  <rect x="110" y="40" width="60" height="100" rx="3" fill="${DARK}" stroke="${SEC}" stroke-width="1.5"/>
  <!-- Door (closing) -->
  <g class="door">
    <rect x="112" y="42" width="56" height="96" rx="2" fill="#222"/>
    <circle cx="160" cy="90" r="3" fill="${GOLD}" opacity=".7"/>
  </g>
  <!-- Person walking away (fading) -->
  <g class="fade">
    <circle cx="200" cy="80" r="8" fill="${SEC}" opacity=".5"/>
    <rect x="194" y="92" width="12" height="20" rx="3" fill="${SEC}" opacity=".4"/>
    <!-- Footsteps -->
    <ellipse cx="215" cy="130" rx="4" ry="2" fill="${SEC}" opacity=".2"/>
    <ellipse cx="230" cy="130" rx="4" ry="2" fill="${SEC}" opacity=".15"/>
  </g>
</svg>`;
}

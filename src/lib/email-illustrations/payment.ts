/**
 * Animated SVG illustrations — Payment emails
 * 9 illustrations for receipts, installments, reminders, refunds
 */

const RED = '#C51B1B';
const LIGHT = '#F1F6F1';
const SEC = '#C5C5C5';
const DARK = '#1a1a1a';
const GREEN = '#22c55e';
const GOLD = '#C9A96E';
const AMBER = '#f59e0b';

export function paymentReceiptIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes receiptSlide{0%{transform:translateY(10px);opacity:.5}40%,100%{transform:translateY(0);opacity:1}}
    @keyframes checkMark{0%{stroke-dashoffset:30}50%,100%{stroke-dashoffset:0}}
    .rc{animation:receiptSlide 2.5s ease-out infinite}
    .ck{stroke-dasharray:30;animation:checkMark 2.5s ease-out infinite}
  </style>
  <g class="rc">
    <path d="M110,35 L170,35 L170,135 L165,130 L160,135 L155,130 L150,135 L145,130 L140,135 L135,130 L130,135 L125,130 L120,135 L115,130 L110,135Z" fill="${DARK}" stroke="${SEC}" stroke-width="1.5"/>
    <line x1="120" y1="55" x2="160" y2="55" stroke="${SEC}" stroke-width="1" opacity=".3"/>
    <line x1="120" y1="65" x2="155" y2="65" stroke="${SEC}" stroke-width="1" opacity=".2"/>
    <line x1="120" y1="75" x2="150" y2="75" stroke="${SEC}" stroke-width="1" opacity=".2"/>
    <line x1="120" y1="90" x2="160" y2="90" stroke="${GOLD}" stroke-width="1.5" opacity=".5"/>
    <text x="155" y="105" text-anchor="end" font-size="14" font-weight="700" fill="${GREEN}" opacity=".8">PAID</text>
  </g>
  <circle cx="165" cy="40" r="12" fill="${GREEN}" opacity=".9"/>
  <polyline class="ck" points="159,40 163,45 172,35" fill="none" stroke="${LIGHT}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

export function installmentReceivedIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
    @keyframes docPulse{0%,100%{opacity:.7}50%{opacity:1}}
    .spinner{animation:spin 1.5s linear infinite;transform-origin:165px 55px}
    .doc{animation:docPulse 2s ease-in-out infinite}
  </style>
  <g class="doc">
    <rect x="110" y="45" width="60" height="80" rx="5" fill="${DARK}" stroke="${SEC}" stroke-width="1.5"/>
    <line x1="120" y1="65" x2="160" y2="65" stroke="${SEC}" stroke-width="1" opacity=".3"/>
    <line x1="120" y1="75" x2="155" y2="75" stroke="${SEC}" stroke-width="1" opacity=".2"/>
    <line x1="120" y1="85" x2="150" y2="85" stroke="${SEC}" stroke-width="1" opacity=".2"/>
    <line x1="120" y1="100" x2="160" y2="100" stroke="${GOLD}" stroke-width="1.5" opacity=".4"/>
  </g>
  <g class="spinner">
    <circle cx="165" cy="55" r="10" fill="none" stroke="${GOLD}" stroke-width="2" stroke-dasharray="15 45" stroke-linecap="round"/>
  </g>
</svg>`;
}

export function installmentApprovedIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes fadeCheck{0%{opacity:0;transform:scale(.5)}40%,100%{opacity:1;transform:scale(1)}}
    .fc{animation:fadeCheck 2.5s ease-out infinite;transform-origin:165px 55px}
  </style>
  <rect x="110" y="45" width="60" height="80" rx="5" fill="${DARK}" stroke="${SEC}" stroke-width="1.5"/>
  <line x1="120" y1="65" x2="160" y2="65" stroke="${SEC}" stroke-width="1" opacity=".3"/>
  <line x1="120" y1="75" x2="155" y2="75" stroke="${SEC}" stroke-width="1" opacity=".2"/>
  <line x1="120" y1="85" x2="150" y2="85" stroke="${SEC}" stroke-width="1" opacity=".2"/>
  <line x1="120" y1="100" x2="160" y2="100" stroke="${GOLD}" stroke-width="1.5" opacity=".4"/>
  <g class="fc">
    <circle cx="165" cy="50" r="12" fill="${GREEN}" opacity=".9"/>
    <polyline points="159,50 163,55 172,44" fill="none" stroke="${LIGHT}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

export function installmentRejectedIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes fadeX{0%{opacity:0;transform:scale(.5)}40%,100%{opacity:1;transform:scale(1)}}
    .fx{animation:fadeX 2.5s ease-out infinite;transform-origin:165px 55px}
  </style>
  <rect x="110" y="45" width="60" height="80" rx="5" fill="${DARK}" stroke="${SEC}" stroke-width="1.5"/>
  <line x1="120" y1="65" x2="160" y2="65" stroke="${SEC}" stroke-width="1" opacity=".3"/>
  <line x1="120" y1="75" x2="155" y2="75" stroke="${SEC}" stroke-width="1" opacity=".2"/>
  <line x1="120" y1="85" x2="150" y2="85" stroke="${SEC}" stroke-width="1" opacity=".2"/>
  <g class="fx">
    <circle cx="165" cy="50" r="12" fill="${RED}" opacity=".9"/>
    <line x1="160" y1="45" x2="170" y2="55" stroke="${LIGHT}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="170" y1="45" x2="160" y2="55" stroke="${LIGHT}" stroke-width="2.5" stroke-linecap="round"/>
  </g>
</svg>`;
}

export function paymentReminderIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes tick{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
    @keyframes billPulse{0%,100%{opacity:.6}50%{opacity:1}}
    .hand{animation:tick 4s linear infinite;transform-origin:135px 80px}
    .bill{animation:billPulse 2s ease-in-out infinite}
  </style>
  <!-- Clock -->
  <circle cx="135" cy="80" r="35" fill="${DARK}" stroke="${GOLD}" stroke-width="2"/>
  <line x1="135" y1="80" x2="135" y2="58" stroke="${LIGHT}" stroke-width="2" stroke-linecap="round"/>
  <g class="hand">
    <line x1="135" y1="80" x2="155" y2="80" stroke="${RED}" stroke-width="2" stroke-linecap="round"/>
  </g>
  <circle cx="135" cy="80" r="3" fill="${GOLD}"/>
  <!-- Bill icon -->
  <g class="bill">
    <rect x="180" y="65" width="30" height="40" rx="3" fill="${DARK}" stroke="${SEC}" stroke-width="1"/>
    <text x="195" y="82" text-anchor="middle" font-size="14" fill="${GOLD}">$</text>
    <line x1="185" y1="90" x2="205" y2="90" stroke="${SEC}" stroke-width="1" opacity=".3"/>
  </g>
</svg>`;
}

export function paymentOverdueIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes warnPulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
    .warn{animation:warnPulse 1.5s ease-in-out infinite;transform-origin:140px 65px}
  </style>
  <!-- Bill -->
  <rect x="110" y="50" width="60" height="80" rx="5" fill="${DARK}" stroke="${SEC}" stroke-width="1.5"/>
  <line x1="120" y1="70" x2="160" y2="70" stroke="${SEC}" stroke-width="1" opacity=".3"/>
  <line x1="120" y1="80" x2="155" y2="80" stroke="${SEC}" stroke-width="1" opacity=".2"/>
  <line x1="120" y1="95" x2="160" y2="95" stroke="${RED}" stroke-width="1.5" opacity=".5"/>
  <text x="155" y="115" text-anchor="end" font-size="10" font-weight="700" fill="${RED}" opacity=".8">OVERDUE</text>
  <!-- Warning triangle -->
  <g class="warn">
    <polygon points="140,38 158,68 122,68" fill="${AMBER}" opacity=".9" stroke="${AMBER}" stroke-width="1" stroke-linejoin="round"/>
    <text x="140" y="63" text-anchor="middle" font-size="16" font-weight="700" fill="${DARK}">!</text>
  </g>
</svg>`;
}

export function installmentExpiringIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes sandFlow{0%{height:30}100%{height:5}}
    @keyframes sandFill{0%{height:5;y:120}100%{height:30;y:95}}
    @keyframes glassGlow{0%,100%{opacity:.7}50%{opacity:1}}
    .top{animation:sandFlow 3s ease-in-out infinite}
    .bot{animation:sandFill 3s ease-in-out infinite}
    .glass{animation:glassGlow 3s ease-in-out infinite}
  </style>
  <g class="glass">
    <!-- Hourglass frame -->
    <rect x="115" y="40" width="50" height="6" rx="2" fill="${GOLD}" opacity=".8"/>
    <rect x="115" y="134" width="50" height="6" rx="2" fill="${GOLD}" opacity=".8"/>
    <!-- Glass body -->
    <path d="M120,46 L120,75 L140,90 L160,75 L160,46" fill="none" stroke="${SEC}" stroke-width="1.5"/>
    <path d="M120,134 L120,105 L140,90 L160,105 L160,134" fill="none" stroke="${SEC}" stroke-width="1.5"/>
  </g>
  <!-- Sand top -->
  <rect class="top" x="127" y="50" width="26" height="30" rx="2" fill="${AMBER}" opacity=".6"/>
  <!-- Sand stream -->
  <line x1="140" y1="80" x2="140" y2="100" stroke="${AMBER}" stroke-width="2" opacity=".4"/>
  <!-- Sand bottom -->
  <rect class="bot" x="127" y="120" width="26" height="5" rx="2" fill="${AMBER}" opacity=".6"/>
</svg>`;
}

export function refundApprovedIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes arrowArc{0%{stroke-dashoffset:80}60%,100%{stroke-dashoffset:0}}
    @keyframes walletPop{0%{transform:scale(.9);opacity:.6}50%,100%{transform:scale(1);opacity:1}}
    .arc{stroke-dasharray:80;animation:arrowArc 2.5s ease-out infinite}
    .wallet{animation:walletPop 2.5s ease-out infinite;transform-origin:140px 90px}
  </style>
  <!-- Wallet -->
  <g class="wallet">
    <rect x="115" y="70" width="50" height="40" rx="6" fill="${DARK}" stroke="${GREEN}" stroke-width="1.5"/>
    <rect x="145" y="82" width="22" height="16" rx="3" fill="#222" stroke="${GREEN}" stroke-width="1"/>
    <circle cx="155" cy="90" r="3" fill="${GREEN}" opacity=".7"/>
  </g>
  <!-- Return arrow -->
  <path class="arc" d="M170,55 C190,40 200,70 180,80" fill="none" stroke="${GREEN}" stroke-width="2.5" stroke-linecap="round"/>
  <polygon points="178,74 185,80 180,86" fill="${GREEN}" opacity=".8"/>
  <!-- Coin -->
  <circle cx="185" cy="50" r="10" fill="${GOLD}" opacity=".7" stroke="${GOLD}" stroke-width="1"/>
  <text x="185" y="54" text-anchor="middle" font-size="10" font-weight="700" fill="${DARK}">$</text>
</svg>`;
}

export function refundRejectedIllustration(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <style>
    @keyframes fadeX{0%{opacity:0;transform:scale(.5)}40%,100%{opacity:1;transform:scale(1)}}
    .fx{animation:fadeX 2.5s ease-out infinite;transform-origin:165px 65px}
  </style>
  <!-- Wallet -->
  <rect x="115" y="70" width="50" height="40" rx="6" fill="${DARK}" stroke="${SEC}" stroke-width="1.5"/>
  <rect x="145" y="82" width="22" height="16" rx="3" fill="#222" stroke="${SEC}" stroke-width="1"/>
  <circle cx="155" cy="90" r="3" fill="${SEC}" opacity=".5"/>
  <!-- X badge -->
  <g class="fx">
    <circle cx="165" cy="65" r="12" fill="${RED}" opacity=".9"/>
    <line x1="160" y1="60" x2="170" y2="70" stroke="${LIGHT}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="170" y1="60" x2="160" y2="70" stroke="${LIGHT}" stroke-width="2.5" stroke-linecap="round"/>
  </g>
</svg>`;
}

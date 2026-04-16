# Phase 3 — Agent D: Cookie Consent Banner

## Your Role
You are a frontend engineer specializing in privacy compliance. Your task is to implement a GDPR/Law 151-compliant cookie consent banner.

## Context
- **Framework:** Next.js 15 + React 19 + TypeScript + CSS Modules
- **i18n:** next-intl (Arabic/English, RTL support critical)
- **Current problem:** No cookie consent exists — this is a legal requirement
- **Design:** Match the platform's dark theme (background: `#020504`, accent: `#C51B1B`)

## Files to Create/Modify

### 1. `[NEW] src/components/cookie-consent.tsx` — The banner component

Requirements:
- **Appears** on first visit (check localStorage `cookie-consent` key)
- **Does NOT reappear** once accepted or declined
- **Stores preference** in localStorage as `"accepted"` or `"declined"`
- **Design:** Fixed bottom banner with glassmorphism effect
  - Dark semi-transparent background
  - Red accent on CTA button  
  - RTL-compatible layout
- **Buttons:** "Accept All" (primary, red) + "Decline" (ghost/outline)
- **Text:** Bilingual — detect locale from `useLocale()` (next-intl)

Arabic text:
```
نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتتبع مصادر الزيارات.
```
English text:
```
We use cookies to improve your experience and track traffic sources.
```

Privacy policy link: `/${locale}/privacy`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import styles from './cookie-consent.module.css';

export function CookieConsent() {
  // Check localStorage on mount
  // Show banner if no preference stored
  // On accept: store 'accepted', dispatch custom event 'cookie-consent-accepted'
  // On decline: store 'declined', hide banner
}
```

### 2. `[NEW] src/components/cookie-consent.module.css`
```css
/* Fixed bottom banner, glassmorphism, RTL-compatible */
/* Use CSS custom properties matching existing design system */
.banner { /* fixed, bottom: 0, width: 100%, backdrop-filter: blur(12px) */ }
.container { /* max-width:800px, centered, flex layout */ }
.text { /* font size, color */ }
.actions { /* flex gap, buttons */ }
.accept { /* red primary button */ }
.decline { /* ghost button */ }
```

### 3. `[MODIFY] src/lib/source-tracking.ts` — Respect consent
Read the file first. Then modify the source tracking logic to:
- Check `localStorage.getItem('cookie-consent')` before setting UTM cookies
- Listen for the `cookie-consent-accepted` event to activate tracking retroactively
- If `'declined'`, skip all tracking entirely

### 4. `[MODIFY] src/app/[locale]/layout.tsx` — Mount the component
Add `<CookieConsent />` just before `</body>`. It's client-side only so no SSR issues.

## How to Approach This
1. Read these files first:
   - `src/lib/source-tracking.ts`
   - `src/app/[locale]/layout.tsx`
   - `src/components/layout/footer.tsx` (for design reference)
2. Create the component with proper TypeScript types
3. Use CSS Modules (NOT Tailwind)
4. Test that RTL works by checking `dir` on the `html` element

## Acceptance Criteria
- [ ] Banner appears on first visit and disappears after clicking either button
- [ ] Preference persisted in localStorage (survives page refresh)
- [ ] Banner never reappears after user decides
- [ ] Source tracking respects consent choice
- [ ] RTL layout correct for Arabic
- [ ] `pnpm tsc --noEmit` zero new errors
- [ ] No new npm packages added

## Constraints
- Use CSS Modules only — NO Tailwind, NO inline styles for layout
- Do NOT modify any collection files
- Do NOT modify any API routes
- Component must be `'use client'` (accesses localStorage)
- Keep it simple — no analytics SDK integration needed, just the banner itself

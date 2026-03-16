<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# بص المشكلة دي ف payload وعملت كل حاجة مش راضية تتحل

مفيش اي css خالص

المشكلة الأكثر شيوعاً في Payload CMS v3 مع Next.js هي تعارض **Tailwind CSS Preflight** مع styles الـ admin panel. خصوصاً لو `globals.css` بتعمل `@tailwind base` أو `@import 'tailwindcss'`، بيـ reset كل الـ styles بما فيها styles الـ Payload admin.

## السبب الجذري

Tailwind's base layer (`preflight`) بيعمل reset لكل الـ browser defaults والـ styles، وده بيأثر على الـ `/admin` route لأن الـ `root layout.tsx` بيحمّل `globals.css` على كل الصفحات بما فيها admin.[^1_1]

## الحلول

### ✅ الحل 1: عزل Tailwind عن الـ Admin Route

في ملف `src/app/(frontend)/layout.tsx` (أو أي layout للـ frontend)، حط الـ globals.css فيه **بدل** الـ root layout:

```tsx
// src/app/(frontend)/layout.tsx
import '../globals.css' // ← هنا بس، مش في الـ root layout

export default function FrontendLayout({ children }) {
  return <>{children}</>
}
```

وفي الـ `src/app/layout.tsx` (root):

```tsx
// ❌ شيل الـ import ده من هنا
// import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```


***

### ✅ الحل 2: استخدم CSS Layers في `globals.css`

```css
/* globals.css */
@layer tailwind-base, tailwind-components, tailwind-utilities;

@layer tailwind-base {
  @tailwind base; /* ← Preflight محصور جوه layer */
}

@tailwind components;
@tailwind utilities;
```

ده بيخلي Payload CSS (اللي بيستخدم `@layer payload-default`) أقوى من Tailwind base.[^1_2]

***

### ✅ الحل 3: فصل ملفات الـ CSS (الأنظف)

زي ما بيوضح الـ code audit ، `next.config.ts` عندك فاضي خالص. خلي فيه:[^1_3]

```ts
// next.config.ts
const nextConfig = {
  // أضف لو محتاج تتحكم في الـ CSS processing
}
```

وفي `payload.config.ts`:

```ts
admin: {
  // لو عايز تضيف CSS خاص بالـ admin
  // css: path.resolve(__dirname, 'src/styles/payload-overrides.css'),
}
```


***

### 🔍 تشخيص سريع

افتح الـ DevTools وشوف:


| الـ Check | إيه اللي تدور عليه |
| :-- | :-- |
| **Network tab** | هل فيه CSS files بتـ fail تتحمل؟ |
| **Console** | هل فيه CSS import errors؟ |
| **Elements tab** | هل `<body>` عليها Tailwind reset styles؟ |

أكثر احتمال عندك: الـ `globals.css` بتتحمل في الـ root layout وده بيشيل styles الـ Payload admin كلها.  شيل الـ import من الـ root layout وحطه في الـ frontend layout بس.[^1_1][^1_2]
<span style="display:none">[^1_10][^1_11][^1_12][^1_13][^1_14][^1_15][^1_16][^1_17][^1_18][^1_19][^1_20][^1_21][^1_22][^1_23][^1_24][^1_25][^1_26][^1_27][^1_28][^1_29][^1_30][^1_31][^1_32][^1_33][^1_34][^1_35][^1_36][^1_37][^1_38][^1_39][^1_4][^1_40][^1_41][^1_5][^1_6][^1_7][^1_8][^1_9]</span>

<div align="center">⁂</div>

[^1_1]: https://www.youtube.com/watch?v=n7AwZZVWYCA

[^1_2]: https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app

[^1_3]: code-audit.md

[^1_4]: image.jpg

[^1_5]: README.md

[^1_6]: workshops.md

[^1_7]: webinars.md

[^1_8]: program-details.md

[^1_9]: instructors.md

[^1_10]: instructor-profile.md

[^1_11]: home.md

[^1_12]: faq.md

[^1_13]: courses.md

[^1_14]: contact.md

[^1_15]: blog-post.md

[^1_16]: blog.md

[^1_17]: about.md

[^1_18]: security.md

[^1_19]: rate-limiting.md

[^1_20]: data-privacy.md

[^1_21]: 2026-07-16-session-3.md

[^1_22]: 2026-07-16-session-2.md

[^1_23]: 2026-07-15-session-2.md

[^1_24]: 2026-07-15-session.md

[^1_25]: automations.md

[^1_26]: platform-features.md

[^1_27]: api-contracts.md

[^1_28]: plan.md

[^1_29]: https://github.com/payloadcms/payload/issues/8716

[^1_30]: https://payloadcms.com/posts/blog/how-to-customize-the-look-and-feel-of-payload-with-css

[^1_31]: https://stackoverflow.com/questions/79612690/missing-props-on-field-component-payload-cms

[^1_32]: https://github.com/payloadcms/payload/issues/5074

[^1_33]: https://spin.atomicobject.com/embed-payload-cms-next-js-app/

[^1_34]: https://www.reddit.com/r/PayloadCMS/comments/1m4toh4/help_solve_the_bug_payload_cms_3480_lexical/

[^1_35]: https://forum.cmsmadesimple.org/viewtopic.php?t=17854

[^1_36]: https://github.com/payloadcms/payload/discussions/765

[^1_37]: https://forum.silverstripe.org/t/css-of-admin-page-not-showing-up/3464

[^1_38]: https://allaboutpayload.com/blog/customizing-payload-nextjs-admin-panel

[^1_39]: https://github.com/payloadcms/payload/issues/3120

[^1_40]: https://wordpress.org/support/topic/admin-page-lacks-css-styling/

[^1_41]: https://payloadcms.com/docs/admin/overview


---

# يمكن تحتاج package.json

{
  "name": "nextacademy-scaffold",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "payload generate:importmap \&\& next build",
    "generate:importmap": "payload generate:importmap",
    "start": "next start"
  },
  "dependencies": {
    "@payloadcms/db-postgres": "^3.79.0",
    "@payloadcms/next": "^3.79.0",
    "@payloadcms/richtext-lexical": "^3.79.0",
    "@payloadcms/ui": "^3.79.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "^12.35.0",
    "graphql": "^16.13.1",
    "gsap": "^3.14.2",
    "ioredis": "^5.10.0",
    "lucide-react": "^0.577.0",
    "next": "15.4.11",
    "next-intl": "^4.8.3",
    "payload": "^3.79.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "resend": "^6.9.3",
    "sharp": "0.34.2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "sass": "^1.89.1",
    "tsx": "^4.21.0",
    "typescript": "^5"
  }
}

الصورة واضحة جداً دلوقتي. المشكلة **مش Tailwind** لأنه مش موجود أصلاً في الـ `package.json`. المشكلة في `(payload)/layout.tsx` نفسه.

## السبب الأساسي

Payload v3 يعتمد بالكامل على `RootLayout` من `@payloadcms/next/layouts` عشان يحقن الـ CSS والـ JS الخاص بيه. لو الـ `layout.tsx` مكتوب كـ layout عادي، Payload مش بيلاقي styles خالص.[^2_1]

## الـ `layout.tsx` الصح

الملف الموجود عندك في `src/app/(payload)/layout.tsx` لازم يبقى **بالظبط** كده:

```tsx
import React from 'react'
import { RootLayout } from '@payloadcms/next/layouts'
import config from '@payload-config'
import { importMap } from './admin/importMap.js'  // ← .js مش .ts لأن "type": "module"

type Args = {
  children: React.ReactNode
}

export default async function Layout({ children }: Args) {
  return (
    <RootLayout config={config} importMap={importMap}>
      {children}
    </RootLayout>
  )
}
```


## خطوات الـ Fix

**1. تأكد إن `importMap.js` موجود:**

```bash
npm run generate:importmap
```

لو مش موجود، الـ admin هيفضل بلا styles ومش هيشتغل.[^2_2]

**2. تأكد مفيش `<html>` أو `<body>` في الـ layout:**

```tsx
// ❌ غلط تماماً - ده بيكسر كل CSS
export default function Layout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

الـ `RootLayout` من Payload هو اللي بيعمل الـ `<html>` و`<body>` بنفسه.

**3. تأكد إن الـ `custom.scss` مش بيعمل مشكلة:**

لو فيه import error في الـ `custom.scss`، ممكن يكسر الـ CSS كله. إما شيله مؤقتاً أو تأكد إنه valid SCSS.

## تشخيص سريع

افتح الـ browser console وشوف:


| علامة | المشكلة |
| :-- | :-- |
| `importMap not found` | لازم تشغل `generate:importmap` |
| `Cannot find module '@payload-config'` | مشكلة في `tsconfig.json` paths |
| مفيش أي errors | الـ layout.tsx مش بيستخدم `RootLayout` |

ممكن تبعتلي محتوى `layout.tsx` الحالي عشان أحدد السبب بالظبط؟
<span style="display:none">[^2_10][^2_11][^2_12][^2_13][^2_14][^2_15][^2_16][^2_3][^2_4][^2_5][^2_6][^2_7][^2_8][^2_9]</span>

<div align="center">⁂</div>

[^2_1]: https://dev.to/anmolbaranwal/how-to-get-cms-in-any-next-app-with-one-line-2mjp

[^2_2]: https://github.com/payloadcms/payload/issues/11813

[^2_3]: image.jpg

[^2_4]: https://github.com/vercel/next.js/discussions/77942

[^2_5]: https://stackoverflow.com/questions/77600623/not-found-page-demands-root-layout-meaning-multiple-root-layouts-not-possible

[^2_6]: https://payloadcms.com/docs/admin/overview

[^2_7]: https://github.com/payloadcms/payload/issues/12088

[^2_8]: https://www.reddit.com/r/nextjs/comments/1h0iekq/what_is_the_huge_push_by_payload_cms_is_it/

[^2_9]: https://oneuptime.com/blog/post/2026-01-24-fix-nextjs-layout-rendering-issues/view

[^2_10]: https://payloadcms.com/docs/admin/components

[^2_11]: https://payloadcms.com/community-help/discord/admin-ui-components-are-buggy

[^2_12]: https://www.reddit.com/r/PayloadCMS/comments/1m4toh4/help_solve_the_bug_payload_cms_3480_lexical/

[^2_13]: https://github.com/payloadcms/payload/issues/13707

[^2_14]: https://payloadcms.com/community-help/github/having-trouble-using-payload-cms-3-with-nextjs-middleware-node-error

[^2_15]: https://payloadcms.com/community-help/discord/how-to-correctly-import-custom-component

[^2_16]: https://github.com/payloadcms/payload/issues/8897


---

# /* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */

/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'
import config from '@/payload.config'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'
import React from 'react'
import './custom.scss'

import { importMap } from '../importMap.js'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout

لقيت المشكلة! فيه **خطأين** في الملف الـ generated ده.

## المشكلة الأولى (الأساسية) — مسار `importMap` غلط

```ts
// ❌ الكود الحالي - بيدور على ملف مش موجود
import { importMap } from '../importMap.js'
```

الـ `layout.tsx` موجود في `src/app/(payload)/layout.tsx`، فـ `'../importMap.js'` بيدور على `src/app/importMap.js` — الملف ده **مش موجود أصلاً**.

الـ `importMap.js` الحقيقي بيتولد جوه فولدر `admin`:

```ts
// ✅ الصح
import { importMap } from './admin/importMap.js'
```


## المشكلة الثانية — `@/payload.config` مش الـ alias الصح

```ts
// ❌ حالياً
import config from '@/payload.config'

// ✅ الصح — Payload's virtual module alias
import config from '@payload-config'
```


***

## الـ Fix الكامل للملف

```tsx
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'
import config from '@payload-config'                        // ← غيّر ده
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'
import React from 'react'
import './custom.scss'

import { importMap } from './admin/importMap.js'            // ← غيّر ده

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
```


***

## بعد التعديل

شغّل الأمرين دول بالترتيب:

```bash
# 1. ولّد الـ importMap في المكان الصح
npm run generate:importmap

# 2. شيل الـ .next cache وابدأ من أول
rm -rf .next && npm run dev
```

تأكد إن الملف `src/app/(payload)/admin/importMap.js` موجود بعد الأمر الأول — لو مش موجود، فيه مشكلة في `payload.config.ts` نفسه.


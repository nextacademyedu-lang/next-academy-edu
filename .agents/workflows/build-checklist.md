---
description: Mandatory pre-build checklist and discipline rules for every feature
---

# Build Discipline — Mandatory Workflow

> **هذا الملف يُقرأ قبل بناء أي feature أو تعديل أي collection أو إنشاء أي API route.**
> عدم اتباعه = أخطاء مكلفة.

---

## 🔴 Phase 1: READ Before You Code (Mandatory)

### Step 1.1 — Read the Relevant Docs
Before touching ANY code for a feature, you MUST read:

| What you're building | Docs to read FIRST |
|---|---|
| Any collection change | `docs/architecture/prd.md` (the entity table), `docs/engineering/code-audit.md` |
| Any UI page | `docs/wireframes/pages/<page>.md`, `docs/design/design-system.md` |
| Any API route | `docs/engineering/api-contracts.md`, `docs/architecture/data-flow.md` |
| Auth or permissions | `docs/architecture/roles-permissions.md` |
| Payment/booking logic | `docs/features/payment-scenarios.md`, `docs/architecture/data-flow.md` |
| Email/WhatsApp/calendar | `docs/features/automations.md`, `docs/features/email-templates.md` |
| Consultation feature | PRD §22-26, `docs/architecture/sitemap.md` consultation section |
| Certificate/quiz | `docs/features/certificates.md` |
| Reviews/ratings | `docs/features/reviews.md` |
| Security-related | `docs/security/security.md`, `docs/security/rate-limiting.md` |
| Cron jobs | `docs/features/cron-jobs.md` |
| i18n/RTL | `docs/design/i18n.md` |
| Error handling | `docs/engineering/error-handling.md` |

### Step 1.2 — Read the Existing Code
Before modifying any file:
1. Read the FULL file you're about to modify
2. Read files that import/export from it
3. Read the corresponding `.module.css` if UI
4. Read the Payload collection definition if touching data

---

## 🟡 Phase 2: THINK Before You Code (Mandatory)

### Step 2.1 — Scenario Analysis
For EVERY feature, enumerate:

```
✅ Happy path: What happens when everything works?
❌ Error path: What happens when it fails?
🔄 Edge cases:
   - What if the user is not authenticated?
   - What if the user has the wrong role?
   - What if the data doesn't exist (404)?
   - What if there's a race condition (e.g., two people booking the last seat)?
   - What if the input is malformed?
   - What if the user refreshes mid-flow?
   - What if the user is on mobile?
   - What if the language is Arabic (RTL)?
   - What if the database connection fails?
🔗 Side effects:
   - What other collections are affected?
   - What notifications should be triggered?
   - What CRM sync should happen?
   - What emails/WhatsApp messages should be sent?
   - What cron jobs depend on this?
```

### Step 2.2 — Dependency Map
Before coding, list:
```
📥 What this feature NEEDS to work:
   - Which collections must exist and have data?
   - Which API routes must be ready?
   - Which env variables are needed?
   - Which external services (Paymob, Resend, etc.) are required?
   - Which other features must be done first?

📤 What DEPENDS on this feature:
   - Which pages use this data?
   - Which hooks trigger from this?
   - Which crons read/write this?
   - Which other features break if this changes?
```

### Step 2.3 — User Input Checklist
Identify what you MUST ask the user BEFORE starting:
```
🔑 API keys or credentials needed?
⚙️ Configuration decisions (e.g., max installments, buffer time)?
📐 Design ambiguity (docs say different things)?
💰 Business logic uncertainty (e.g., refund policy rules)?
🌐 External service account ready (Paymob, Resend, etc.)?
```

**RULE: Ask ALL questions in ONE batch. Never drip-feed questions across multiple messages.**

---

## 🟢 Phase 3: BUILD with Discipline

### Step 3.1 — Implementation Order
Always follow this order within a feature:
```
1. Collection fields/schema (if needed)
2. Access control rules
3. Hooks (beforeChange, afterChange)
4. Input validation
5. API route (if custom endpoint needed)
6. Server-side data fetching (page.tsx)
7. UI components
8. i18n strings (ar.json + en.json)
9. Error boundaries (error.tsx)
10. Loading states (loading.tsx)
```

### Step 3.2 — Code Rules
- **Types first:** Define TypeScript interfaces before writing logic
- **No hardcoded strings:** All UI text goes in messages/*.json
- **No `any`:** Use `unknown` and narrow
- **Access control on EVERY collection change:** Use `src/lib/access-control.ts` helpers
- **Mobile-first CSS:** Default = mobile, `@media (min-width)` for larger screens
- **Server Components default:** `'use client'` only when hooks/event handlers needed

### Step 3.3 — Payload CMS Collection Checklist
When creating or modifying a collection:
```
☐ All fields match PRD table exactly
☐ Access control defined (read/create/update/delete)
☐ Hooks implemented (code generation, side effects)
☐ Input validation on all user-facing fields
☐ Admin labels in English (Payload admin panel)
☐ Timestamps (createdAt/updatedAt) auto-managed
☐ Relationships use correct relationTo slug
☐ Enum options match PRD exactly
```

---

## 🔵 Phase 4: VERIFY Before Declaring Done

### Step 4.1 — Verification Checklist
```
☐ pnpm build passes with zero errors
☐ Feature works on pnpm dev
☐ Tested with Arabic (RTL) language
☐ Tested on mobile viewport
☐ Access control verified (unauthenticated user can't access protected data)
☐ Error states handled (network failure, 404, 500)
☐ Loading states present
☐ No console errors or warnings
```

### Step 4.2 — Write Tests
```
☐ Unit test for hooks (beforeChange/afterChange logic)
☐ Unit test for access control (correct role = access, wrong role = denied)
☐ Unit test for validation (bad input = rejection)
☐ Integration test for API routes (request → response)
☐ Tests pass: pnpm test
```

---

## 🟣 Phase 5: DOCUMENT After Building

### Step 5.1 — Update Logs
```
☐ docs/logs/changelog.md — entry with timestamp, files changed, reason
☐ docs/logs/tasks.md — mark items [x] or [/]
☐ docs/logs/errors.md — if any error was encountered and solved
```

### Step 5.2 — Update Docs If Needed
If you discovered something not in the docs:
- Update the relevant doc (api-contracts.md, data-flow.md, etc.)
- Add a note in changelog explaining the doc update

---

## 🚫 NEVER Do These

1. **Never build a feature without reading its docs first**
2. **Never modify a collection without checking the PRD table**
3. **Never create an API route without checking api-contracts.md**
4. **Never skip access control** — even on "read-only" collections
5. **Never hardcode text in components** — always use i18n
6. **Never assume a field type** — check the PRD definition
7. **Never leave `console.log` in production code**
8. **Never create a page without `loading.tsx` and `error.tsx`**
9. **Never skip mobile responsiveness**
10. **Never forget to update logs after completing work**

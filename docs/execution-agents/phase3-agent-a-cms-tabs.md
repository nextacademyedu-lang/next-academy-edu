# Phase 3 — Agent A: Payload CMS Tabs for Programs & Events

## Your Role
You are a Payload CMS expert. Your task is to reorganize the `Programs` and `Events` collections to use Payload's `tabs` field group, making the admin panel significantly easier to use for non-technical content managers.

## Context
- **Framework:** Next.js 15 + Payload CMS 3 + TypeScript
- **Collections dir:** `src/collections/`
- **Current problem:** Programs and Events have 30+ fields in a flat list — admins can't find anything

## Files to Modify

### 1. `src/collections/Programs.ts`
Reorganize existing fields into 6 tabs using Payload's `{ type: 'tabs', tabs: [...] }` field:

```
Tab 1: "General" (icon: Settings)
  - name (AR/EN), slug, type (workshop/course/webinar), status, featured

Tab 2: "Content" (icon: FileText)  
  - shortDescription (AR/EN), description (AR/EN richtext), featuredImage, gallery

Tab 3: "Educational" (icon: BookOpen)
  - objectives (AR/EN), prerequisites (AR/EN), curriculum/modules

Tab 4: "Pricing" (icon: DollarSign)
  - price, discountedPrice, currency, installments enabled, installment plans

Tab 5: "SEO" (icon: Search)
  - metaTitle (AR/EN), metaDescription (AR/EN), keywords

Tab 6: "Settings" (icon: Sliders)
  - instructors (relationship), visibility, scheduling, capacity, tags
```

**CRITICAL:** 
- Use Payload v3 tabs syntax: `{ type: 'tabs', tabs: [{ label: 'General', fields: [...] }] }`
- Do NOT remove or rename any existing fields — only reorganize them
- Add `admin: { description: '...' }` to any field whose purpose is ambiguous

### 2. `src/collections/Events.ts`
Apply the same tab organization:
```
Tab 1: "General" — name, slug, status, type
Tab 2: "Content" — description, image, speakers
Tab 3: "Schedule" — startDate, endDate, location, isOnline, meetingLink
Tab 4: "Pricing" — price, capacity, registrationDeadline
Tab 5: "SEO" — metaTitle, metaDescription
Tab 6: "Settings" — instructors, tags, featured
```

## How to Approach This
1. First, read the current file structure of both collections:
   - `src/collections/Programs.ts`
   - `src/collections/Events.ts`
2. Map each existing field to its appropriate tab
3. Wrap all fields in the tabs structure
4. TypeScript must still compile — run `pnpm tsc --noEmit` to verify

## Acceptance Criteria
- [ ] Programs collection uses Payload tabs (6 tabs)
- [ ] Events collection uses Payload tabs (5-6 tabs)
- [ ] ALL existing fields preserved — no field removed or renamed
- [ ] `pnpm tsc --noEmit` has zero new errors in `src/collections/`
- [ ] `admin.description` added to at least 5 ambiguous fields

## Constraints
- Do NOT modify `src/payload.config.ts`
- Do NOT touch any other collection
- Do NOT modify migrations — tabs are purely UI, no schema change
- Do NOT add any new fields — only reorganize existing ones

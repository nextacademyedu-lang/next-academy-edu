# Phase 4 — Agent A: Delete Account Self-Service (GDPR Right to Erasure)

## Your Role
You are a full-stack engineer. Your task is to implement the "Delete My Account" feature, which is a legal requirement under Egyptian Law 151/2020 and GDPR.

## Context
- **Framework:** Next.js 15 + Payload CMS 3 + TypeScript
- **Auth:** Custom OTP-based auth via `src/lib/server-auth.ts`
- **Existing cleanup hooks:** Check `src/collections/Users.ts` for `beforeDelete` hooks
- **Current problem:** Users have no way to delete their own account — legal violation

## Files to Create/Modify

### 1. `[NEW] src/app/api/users/delete-account/route.ts`
```typescript
// DELETE /api/users/delete-account
// Auth: Must be logged in (their own account only)
// Flow:
//   1. Authenticate the request user
//   2. Confirm the body has { confirm: "DELETE" } 
//   3. Send confirmation email BEFORE deletion
//   4. Delete the user record (Payload beforeDelete hooks handle cascade)
//   5. Clear cookies/session
//   6. Return { success: true }
```

Security requirements:
- User can only delete THEIR OWN account (not others)
- Must have `{ confirm: "DELETE" }` in request body (exact string match)
- Rate limit: max 3 attempts per hour per user

### 2. `[MODIFY] src/app/[locale]/(dashboard)/dashboard/profile/page.tsx`
Add a "Danger Zone" section at the bottom of the profile page:
- Red-bordered card with "Delete Account" section
- Warning text in AR/EN about data loss
- Button that opens a confirmation modal

### 3. `[NEW] src/components/delete-account-modal.tsx`
A confirmation modal that:
- Shows warning text: "This will permanently delete your account and all data"
- Has a text input where user must type "DELETE" to confirm
- Submit button disabled until text matches exactly
- On confirm: calls `DELETE /api/users/delete-account`
- On success: redirects to homepage

### 4. `src/lib/email/auth-emails.ts` — Add account deletion confirmation email
```typescript
export async function sendAccountDeletionConfirmation(data: {
  to: string;
  userName: string;
  locale?: string | null;
}): Promise<void>
```
Subject: "Your account has been deleted" / "تم حذف حسابك"
Send BEFORE the actual deletion.

## How to Approach This
1. Read these files first:
   - `src/lib/server-auth.ts` (how to authenticate)
   - `src/collections/Users.ts` (existing beforeDelete hooks)
   - `src/lib/email/auth-emails.ts` (email pattern to follow)
   - `src/app/[locale]/(dashboard)/dashboard/profile/page.tsx` (where to add the UI)
   - `src/app/api/users/login/route.ts` (API route pattern to follow)
2. Implement API route first, then UI

## Acceptance Criteria
- [ ] `DELETE /api/users/delete-account` exists and requires auth
- [ ] Requires `{ confirm: "DELETE" }` exact match in body
- [ ] User can only delete their own account
- [ ] Confirmation email sent before deletion
- [ ] "Danger Zone" section visible in profile settings page
- [ ] Modal requires typing "DELETE" to enable the button
- [ ] `pnpm tsc --noEmit` zero new errors

## Constraints
- Use `asPayloadRequest` from `@/lib/payload-request` (NOT `req as any`)
- Use CSS Modules for modal styling
- Follow existing email patterns in `src/lib/email/auth-emails.ts`
- Do NOT touch collections, migrations, or CRM code

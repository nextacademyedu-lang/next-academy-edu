# Next Academy — Video Content Protection

> Last Updated: 2026-03-13 14:17
> Video Hosting: Bunny.net Stream / Cloudflare Stream (TBD)

---

## 1. Protection Strategy

```text
Layers:
├── Layer 1: Authentication → Only logged-in users with confirmed booking
├── Layer 2: Signed URLs → Time-limited, user-specific video URLs
├── Layer 3: DRM → Widevine/FairPlay (via Bunny.net)
├── Layer 4: Watermarking → Dynamic text overlay with user info
├── Layer 5: Download Prevention → No direct file access
└── Layer 6: Screen Recording Deterrent → CSS overlay trick
```

---

## 2. Signed URL Generation

```typescript
// lib/video.ts
async function getSignedVideoUrl(
  videoId: string, 
  userId: string, 
  bookingId: string
): Promise<string> {
  // 1. Verify user has access
  const booking = await payload.findByID({ collection: 'bookings', id: bookingId });
  if (booking.user_id !== userId) throw new ForbiddenError();
  if (booking.status !== 'confirmed') throw new ForbiddenError();
  if (booking.access_blocked) throw new ForbiddenError('Installment overdue');
  
  // 2. Generate signed URL (expires in 4 hours)
  const expiresAt = Math.floor(Date.now() / 1000) + (4 * 60 * 60);
  const token = generateHMAC(videoId, userId, expiresAt);
  
  return `https://stream.nextacademyedu.com/${videoId}?token=${token}&expires=${expiresAt}`;
}
```

### URL Properties

```text
├── Expiry: 4 hours from generation
├── IP-locked: optional (may cause issues with mobile networks)
├── User-agent locked: bound to browser session
├── Single concurrent stream: 1 device at a time
└── Referer check: only nextacademyedu.com
```

---

## 3. Dynamic Watermark

```text
Overlay (semi-transparent text on video):
├── Content: "{userName} — {userEmail}"
├── Position: random (changes every 30 seconds)
├── Opacity: 15% (visible on screenshots, not distracting)
├── Font: 14px, white text with subtle shadow
├── Purpose: discourage sharing (identifiable to user)
└── Implementation: CSS overlay positioned absolute over video element
```

```css
.video-watermark {
  position: absolute;
  color: rgba(255, 255, 255, 0.15);
  font-size: 14px;
  pointer-events: none;
  user-select: none;
  z-index: 10;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  /* Position changes via JS every 30s */
}
```

---

## 4. Download Prevention

```text
Measures:
├── No direct file URLs exposed to client
├── HLS/DASH streaming only (no MP4 download link)
├── Right-click disabled on video element (cosmetic)
├── Context menu: "devtools" detection observer (cosmetic)
├── Video element: controlsList="nodownload" 
├── HTTP headers: Content-Disposition: inline (never attachment)
├── CDN: no range request for full file (only segments)
└── Accept: these are DETERRENTS, not foolproof DRM
```

---

## 5. Access Control Matrix

| User Status | Live Session | Recordings | Materials (PDF) |
|---|---|---|---|
| Confirmed + paid | ✅ | ✅ | ✅ |
| Confirmed + partial (installment on time) | ✅ | ✅ | ✅ |
| Confirmed + installment overdue | ❌ | ❌ | ❌ |
| Cancelled | ❌ | ❌ | ❌ |
| Waitlist | ❌ | ❌ | ❌ |
| Guest (not logged in) | ❌ | ❌ | ❌ |
| Admin | ✅ (all) | ✅ (all) | ✅ (all) |
| Instructor (own programs) | ✅ | ✅ | ✅ |

---

## 6. Implementation Notes

```text
Phase 1 (MVP):
├── Signed URLs (Bunny.net or Cloudflare Stream)
├── Authentication check before video load
├── CSS watermark overlay
└── No download button

Phase 2 (Enhanced):
├── DRM integration (Widevine/FairPlay via Bunny.net DRM addon)
├── IP + device limiting (1 concurrent stream)
├── Server-side watermark burning (Bunny.net feature)
└── Analytics: who watched what, for how long

Note: Perfect copy protection is impossible. The goal is to make 
it INCONVENIENT enough that 99% of users won't bother pirating.
```

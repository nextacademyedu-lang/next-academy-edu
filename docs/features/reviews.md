# Next Academy — Reviews & Ratings System

> Last Updated: 2026-03-13 04:00

---

## 1. Trigger

- 3 days after the last session of a Round is marked "Completed", the system sends a review request (Email + WhatsApp + In-App notification).
- Follow-up reminder: 7 days after completion if no review submitted.
- Max reminders: 2 (day 3 + day 7). No more nagging.

---

## 2. Review Form (User Dashboard)

- **Location:** `/dashboard/bookings/:id` → "قيّم البرنامج" button appears post-completion.
- **Eligibility:** User must have completed ≥ 80% of sessions + payment is fully settled.
- **Fields:**
  - Overall Rating: 1-5 Stars (required)
  - Content Quality: 1-5 Stars (optional)
  - Instructor Rating: 1-5 Stars (optional)
  - What did you like most? (Optional text, 10-500 chars)
  - What could be improved? (Optional text, 10-500 chars)
  - Would you recommend this to a colleague? Yes/No (required)
- **Submit:** One review per user per booking. Cannot edit after submitting.
- **UI:** Star selector (clickable + keyboard accessible via Arrow keys)

---

## 3. Review Validation & Anti-Abuse

### 3.1 Input Validation

| Field | Validation |
|---|---|
| Star ratings | 1-5 integer only |
| Text fields | Min 10 chars, max 500 chars |
| Text content | Sanitize HTML, strip scripts |
| Profanity | Arabic + English profanity filter (word list) |
| Spam detection | Reject if same text submitted ≥ 3 times across users |
| Rate limit | Max 5 review submissions per hour per user |

### 3.2 Anti-Fake Review Protection

```text
Protections:
├── Only verified purchasers can review (booking with status: completed)
├── "حجز تم التحقق منه" badge on verified reviews
├── Cannot review a program you didn't attend
├── Cannot review if installment payments overdue
├── Time window: review allowed up to 90 days after completion
│   └── After 90 days → "فترة التقييم انتهت"
├── IP-based duplicate detection (same IP, same program)
└── Admin can flag suspicious review patterns
```

### 3.3 Profanity Filter

```text
Implementation:
├── Arabic bad words list (curated, 500+ words)
├── English bad words list (curated, 300+ words)
├── Leetspeak detection (e.g., "f@ck" → flagged)
├── Action: Replace with *** + allow submission (don't reject)
├── Admin notification: "مراجعة تحتوي على ألفاظ غير لائقة"
└── Optional: AI moderation for context-aware detection (Phase 2)
```

---

## 4. Display (Public)

### 4.1 Program Details Page (`/programs/:slug`)

```text
Review Section:
├── Average rating: ⭐ 4.7 (based on 23 reviews)
├── Rating breakdown bar chart:
│   ├── ★★★★★ ████████████████ 80% (18)
│   ├── ★★★★☆ ████████ 13% (3)
│   ├── ★★★☆☆ ██ 4% (1)
│   ├── ★★☆☆☆ █ 2% (1)
│   └── ★☆☆☆☆  0% (0)
├── Recommendation rate: "95% ينصحون بالبرنامج"
├── Top 3 reviews displayed (most helpful OR most recent — toggle)
├── "عرض كل التقييمات" → expandable section or modal
├── Filter by: rating (5,4,3,2,1), most recent, most helpful
└── No reviews yet: "كن أول شخص يقيّم البرنامج ده!"
```

### 4.2 Instructor Profile (`/instructors/:slug`)

```text
├── Aggregate rating across all programs they teach
├── Total review count
├── "عن تجربة المتدربين" section showing top 3 reviews
└── Reviews from different programs (with program name shown)
```

### 4.3 Review Card UI

```text
┌─────────────────────────────────────────┐
│ ★★★★★  ⎟  أحمد محمد  ⎟ 📅 منذ أسبوعين │
│ ✅ حجز تم التحقق منه                    │
│                                         │
│ "المحتوى ممتاز والمحاضر أكتر من رائع.   │
│  استفدت كتير في شغلي."                  │
│                                         │
│ 👍 هل كان التقييم مفيد؟  نعم (12)  لا (2)│
└─────────────────────────────────────────┘
```

---

## 5. "Helpful" Voting System

```text
Flow:
├── Each review has "هل كان التقييم مفيد؟" with 👍 Yes / 👎 No
├── One vote per user per review (toggle)
├── Sort "Most Helpful" = highest (yes - no) score
├── Reviews with > 5 "helpful" votes get priority display
├── No authentication required to vote (but rate limited by IP)
└── Auth users: can only vote once (stored in DB)
```

---

## 6. Moderation (Admin)

```text
Admin Actions (from /admin → Reviews collection):
├── Approve: review visible on public site (auto-approved by default)
├── Hide: review hidden from public (still in DB)
├── Flag: marked for internal review (still visible by default)
├── Delete: permanent removal (only for spam/legal)
├── Pin: review appears first on program page (max 2 pinned)
└── Respond: admin/instructor public response (optional, future feature)

Admin Dashboard:
├── New reviews (last 7 days)
├── Flagged reviews count
├── Average rating trend (weekly graph)
├── Programs with lowest ratings (needs attention)
└── Reviews with high "not helpful" votes
```

---

## 7. Instructor Review Response (Future Feature)

```text
Phase 2:
├── Instructor can respond to reviews (public)
├── One response per review
├── Response visible below the review
├── Admin can hide inappropriate responses
└── No further replies (not a thread)
```

---

## 8. SEO for Reviews

```text
JSON-LD Structured Data:
├── @type: AggregateRating on program pages
├── ratingValue, reviewCount, bestRating, worstRating
├── Individual reviews as @type: Review
├── Author, datePublished, reviewRating
└── Enables Google star ratings in search results
```

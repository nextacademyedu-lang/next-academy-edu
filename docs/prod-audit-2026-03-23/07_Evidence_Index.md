# Evidence Index — Production Audit

**Date:** 2026-03-23
**Total Evidence Files:** 23 (17 screenshots + 6 recordings)
**Location:** `evidence/` subdirectory

---

## Screenshots

| # | Filename | Defect/Test | Description | Timestamp |
| --- | --- | --- | --- | --- |
| 1 | `homepage_ar_above_fold_1774221712871.png` | TC-002 | Arabic homepage above-fold — hero, CTA, programs section | 02:04 AM |
| 2 | `homepage_ar_scrolled_1_1774221753617.png` | TC-002 | Arabic homepage scrolled — testimonials, instructors | 02:04 AM |
| 3 | `login_page_ar_1774221869708.png` | TC-004 | Arabic login page — form fields + RTL layout | 02:06 AM |
| 4 | `after_login_admin_1774221893356.png` | TC-006 | Admin panel after login — dashboard view | 02:06 AM |
| 5 | `admin_account_details_1774221904305.png` | TC-006 | Admin account details page | 02:06 AM |
| 6 | `admin_account_page_1774221914324.png` | TC-006 | Admin account management page | 02:06 AM |
| 7 | `programs_listing_en_1774222000000_png_1774222338151.png` | TC-016, BUG-004 | English programs listing — shows test program "sad" | 02:12 AM |
| 8 | `program_detail_sad_1774222000000_png_1774222387773.png` | BUG-004 | Test program "sad" detail page — no instructor, no description | 02:13 AM |
| 9 | `registration_page_en_1774222000000_png_1774222405004.png` | TC-008, BUG-005 | Registration page — form field layout | 02:13 AM |
| 10 | `instructors_page_en_1774222000000_png_1774222422666.png` | TC-034 | Instructors page — grid with instructor cards | 02:13 AM |
| 11 | `about_page_en_1774222000000_png_1774222446028.png` | BUG-001 | **English About page with raw i18n keys visible** | 02:14 AM |
| 12 | `contact_page_en_1774222000000_png_1774222482937.png` | TC-037 | Contact page — form renders correctly | 02:14 AM |
| 13 | `terms_page_1774223108975.png` | BUG-003 | **Terms page with test popup overlay** | 02:25 AM |
| 14 | `privacy_page_1774223120417.png` | TC-040 | Privacy policy page — renders correctly | 02:25 AM |
| 15 | `refund_policy_page_1774223140908.png` | TC-041 | Refund policy page — renders correctly | 02:25 AM |
| 16 | `faq_page_1774223150984.png` | TC-036 | FAQ page — accordions functional | 02:26 AM |
| 17 | `for_business_page_1774223161819.png` | TC-038 | For Business (B2B) landing page | 02:26 AM |

---

## Recordings (WebP videos)

| # | Filename | Defect/Test | Description | Duration |
| --- | --- | --- | --- | --- |
| 1 | `homepage_smoke_test_1774221656229.webp` | TC-002, TC-003 | Full homepage smoke test — load, scroll, verify sections | ~30s |
| 2 | `admin_login_test_1774221851433.webp` | TC-006 | Admin login flow — enter creds, redirect, verify dashboard | ~15s |
| 3 | `user_login_dashboard_1774221969435.webp` | TC-007, TC-011–015 | Student login + full dashboard walkthrough (all tabs) | ~20s |
| 4 | `programs_and_public_1774222319934.webp` | TC-016–018, TC-032–038 | Public pages tour — programs, about, instructors, contact | ~45s |
| 5 | `legal_pages_test_1774223089732.webp` | TC-039–041 | Legal pages — terms (shows BUG-003), privacy, refund | ~20s |
| 6 | `b2b_instructor_test_1774223216600.webp` | TC-026–031 | B2B manager + Instructor dashboard walkthrough | ~60s |

---

## Evidence ↔ Defect Cross-Reference

| Defect ID | Evidence Files | Key Frame / Moment |
| --- | --- | --- |
| BUG-001 | `about_page_en_1774222000000_png_1774222446028.png`, `programs_and_public_1774222319934.webp` | Screenshot: raw i18n keys in hero. Video: 0:25 mark |
| BUG-002 | `user_login_dashboard_1774221969435.webp` | Video: booking attempt at 0:18 mark shows 401 in Network tab |
| BUG-003 | `terms_page_1774223108975.png`, `legal_pages_test_1774223089732.webp` | Screenshot: popup overlay visible. Video: popup appears at 0:03 |
| BUG-004 | `programs_listing_en_1774222000000_png_1774222338151.png`, `program_detail_sad_1774222000000_png_1774222387773.png` | Screenshots: "sad" program visible in listing and detail page |
| BUG-005 | `registration_page_en_1774222000000_png_1774222405004.png` | Screenshot: form labels slightly crowded on narrow viewport |
| BUG-006 | N/A (curl output in DevOps Report) | Terminal output: `503` + `CN=TRAEFIK DEFAULT CERT` |
| BUG-007 | `user_login_dashboard_1774221969435.webp` | Video: cookie attributes visible in DevTools during login |
| BUG-008 | N/A (code analysis) | No CSRF token in POST request headers |
| BUG-009 | N/A (code analysis) | Error response format observed in API testing |
| BUG-010 | N/A (curl rapid-fire test) | No rate limiting observed on repeated login attempts |
| BUG-011 | N/A (curl header check) | Missing Cache-Control in response headers |

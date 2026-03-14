# Next Academy — Testing Strategy

> Last Updated: 2026-03-13 04:00
> Tools: Vitest (Unit/Integration), Playwright (E2E)

---

## 1. Testing Pyramid

```text
                 ╱╲
                ╱  ╲         E2E Tests (Playwright)
               ╱ 10 ╲        Critical user flows
              ╱──────╲
             ╱        ╲      Integration Tests (Vitest)
            ╱   30     ╲     API routes, hooks, services
           ╱────────────╲
          ╱              ╲   Unit Tests (Vitest)
         ╱      60        ╲  Pure functions, utils, validators
        ╱──────────────────╲

Coverage Target: 80%+ (critical paths: 100%)
```

---

## 2. Unit Tests (Vitest)

### 2.1 What to Test

```text
Pure Functions:
├── lib/installment-calculator.ts → calculateInstallments()
├── lib/price-calculator.ts → applyDiscount(), calculateVAT()
├── lib/date-utils.ts → formatDate(), isOverdue(), addBusinessDays()
├── lib/booking-code.ts → generateBookingCode()
├── lib/validation.ts → validatePhone(), validateEmail(), validateNationalId()
├── lib/slug.ts → generateSlug(), slugify()
├── lib/currency.ts → formatPrice(), convertCurrency()
└── lib/permissions.ts → canAccessResource(), isOwner()
```

### 2.2 Example Tests

```typescript
// tests/unit/installment-calculator.test.ts
describe('calculateInstallments', () => {
  it('should split amount into 2 equal installments', () => {
    const result = calculateInstallments(1000, [
      { percentage: 50, due_days: 0 },
      { percentage: 50, due_days: 30 },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].amount).toBe(500);
    expect(result[1].amount).toBe(500);
  });

  it('should handle uneven splits with rounding', () => {
    const result = calculateInstallments(1000, [
      { percentage: 33, due_days: 0 },
      { percentage: 33, due_days: 30 },
      { percentage: 34, due_days: 60 },
    ]);
    expect(result[0].amount + result[1].amount + result[2].amount).toBe(1000);
  });

  it('should calculate correct due dates', () => {
    const baseDate = new Date('2026-03-15');
    const result = calculateInstallments(3000, [
      { percentage: 50, due_days: 0 },
      { percentage: 25, due_days: 30 },
      { percentage: 25, due_days: 60 },
    ], baseDate);
    expect(result[0].due_date).toEqual(new Date('2026-03-15'));
    expect(result[1].due_date).toEqual(new Date('2026-04-14'));
    expect(result[2].due_date).toEqual(new Date('2026-05-14'));
  });
});

// tests/unit/price-calculator.test.ts
describe('applyDiscount', () => {
  it('should apply percentage discount', () => {
    expect(applyDiscount(1000, { type: 'percentage', value: 20 })).toBe(800);
  });

  it('should apply fixed discount', () => {
    expect(applyDiscount(1000, { type: 'fixed', value: 200 })).toBe(800);
  });

  it('should not go below 0', () => {
    expect(applyDiscount(100, { type: 'fixed', value: 200 })).toBe(0);
  });

  it('should handle 100% discount', () => {
    expect(applyDiscount(1000, { type: 'percentage', value: 100 })).toBe(0);
  });
});

// tests/unit/validation.test.ts
describe('validatePhone', () => {
  it('should accept valid Egyptian number', () => {
    expect(validatePhone('+201012345678')).toBe(true);
    expect(validatePhone('01012345678')).toBe(true);
  });

  it('should reject invalid numbers', () => {
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('abc')).toBe(false);
    expect(validatePhone('')).toBe(false);
  });
});
```

---

## 3. Integration Tests (Vitest)

### 3.1 What to Test

```text
API Routes:
├── POST /api/users/login → success, failure, lockout
├── POST /api/bookings → success, full round, duplicate, discount
├── POST /api/webhooks/paymob → valid sig, invalid sig, duplicate
├── POST /api/discount-codes/validate → valid, expired, max used
├── POST /api/consultation-bookings → success, slot taken
├── POST /api/installment-requests → success, duplicate
├── POST /api/waitlist → success, already joined
└── POST /api/refund-requests → eligible, not eligible

Payload CMS Hooks:
├── User afterChange → CRM sync triggered
├── Booking afterChange → email sent, CRM deal created
├── Payment afterChange → booking status updated
├── Round afterChange → recalculate seats
└── ConsultationSlot afterChange → notifications sent

Services:
├── BookingService → createBooking(), cancelBooking()
├── PaymentService → processPayment(), refundPayment()
├── NotificationService → sendEmail(), sendWhatsApp()
├── CRMService → syncContact(), syncDeal()
└── SlotGenerationService → generateSlots()
```

### 3.2 Test Database Setup

```typescript
// tests/setup.ts
import { initPayload } from './test-utils';

beforeAll(async () => {
  // Initialize Payload with test database
  await initPayload({
    db: 'postgresql://test:test@localhost:5432/nextacademy_test',
    secret: 'test-secret',
  });
});

afterAll(async () => {
  // Clean up test database
  await cleanDatabase();
});

beforeEach(async () => {
  // Seed fresh data for each test
  await seedTestData();
});
```

---

## 4. E2E Tests (Playwright)

### 4.1 Critical User Flows

```text
Flow 1: Registration → Onboarding → Dashboard
├── Visit /register
├── Fill form (name, email, phone, password)
├── Submit → redirect to /onboarding/step-1
├── Complete 3 steps
├── Verify redirect to /dashboard
└── Verify user appears in admin panel

Flow 2: Browse → Book → Pay
├── Visit /programs
├── Click a program → program detail page
├── Select a round → click "Book"
├── Login redirect if not logged in
├── Checkout page → verify price
├── Apply discount code → verify new price
├── Click "Pay" → Paymob redirect (mock)
├── Verify booking appears in /dashboard/bookings
└── Verify confirmation email sent (mock)

Flow 3: Installment Request → Approval → Payment
├── User requests installment plan
├── Admin approves from /admin
├── User receives email
├── User completes checkout within 7 days
└── Verify installment payments created

Flow 4: Consultation Booking
├── Browse /instructors/:slug
├── View available slots
├── Select slot → checkout
├── Verify booking → instructor notified
└── Verify slot status changed to "booked"

Flow 5: Admin CRUD
├── Admin logs in → /admin
├── Create program → verify appears on public site
├── Create round → verify appears on program page
├── Create session → verify appears on round schedule
├── Mark payment as paid → verify booking confirmed
└── Cancel round → verify users notified

Flow 6: Mobile Responsive
├── Set viewport to 375×812 (iPhone)
├── Verify hamburger menu works
├── Verify booking flow works on mobile
├── Verify dashboard bottom nav works
└── Verify all forms are usable
```

### 4.2 Playwright Config

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    locale: 'ar',
    timezoneId: 'Africa/Cairo',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
  ],
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 5. Security Tests

```text
Tests:
├── IDOR: Access /dashboard/bookings/:otherUserId → 403
├── Role escalation: POST /api/users with role=admin → ignored
├── XSS: Submit <script> in form fields → sanitized
├── CSRF: POST without proper token → 403
├── Rate limiting: 20 rapid login attempts → 429 after 10
├── SQL injection: ' OR 1=1 in search → no data leak
├── File upload: Upload .exe → rejected
├── Webhook: POST to /api/webhooks/paymob without valid HMAC → 401
└── Session: Use expired token → 401
```

---

## 6. Performance Tests

```text
Metrics (Lighthouse CI):
├── LCP (Largest Contentful Paint): < 2.5s
├── FID (First Input Delay): < 100ms
├── CLS (Cumulative Layout Shift): < 0.1
├── TTI (Time to Interactive): < 3.5s
└── Bundle size: < 250KB gzipped (first load)

API Response Times:
├── GET /api/programs: < 200ms (cached)
├── GET /api/search: < 300ms
├── POST /api/bookings: < 500ms
├── POST /api/payments/process: < 2s (includes Paymob API)
└── Database queries: < 100ms (with proper indexing)
```

---

## 7. CI/CD Pipeline

```text
On Pull Request:
├── pnpm lint → TypeScript errors
├── pnpm build → build errors
├── vitest run → unit + integration tests
├── playwright test → E2E tests (headless)
└── lighthouse ci → performance budget check

On Merge to Main:
├── All above +
├── Deploy to Vercel preview
├── Smoke tests on preview URL
└── If pass → auto-deploy to production

Schedule (Weekly):
├── Full security scan
├── Dependency audit (pnpm audit)
├── Full reconciliation test
└── Performance regression check
```

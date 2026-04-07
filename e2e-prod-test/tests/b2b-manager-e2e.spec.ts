import { test, expect, request, type APIRequestContext } from '@playwright/test';
import {
  getBaseUrl,
  cleanupRunId,
  createDocumentAsAdmin,
  queryCollection,
  waitForVerificationCode,
} from '../test-utils';

test.describe.configure({ mode: 'serial' });

test.describe('B2B Manager E2E Flow', () => {
  const RUN_ID = `B2B_E2E_${Date.now()}`;
  const getEmail = (name: string) => `${name}_${RUN_ID}@mail.test`.toLowerCase();

  const MGR_A_EMAIL = getEmail('b2b_mgr_a');
  const MGR_B_EMAIL = getEmail('b2b_mgr_b');
  const EMP_NEW_EMAIL = getEmail('employee_new');
  const EMP_EXIST_EMAIL = getEmail('employee_existing');
  const STUDENT_EMAIL = getEmail('student_b2btest');
  const INSTRUCTOR_EMAIL = getEmail('inst_b2btest');

  const COMPANY_A_NAME = `Company A ${RUN_ID}`;
  const COMPANY_B_NAME = `Company B ${RUN_ID}`;
  const ROUND_TITLE = `B2B Round ${RUN_ID}`;

  let apiContext: APIRequestContext;
  let roundId: number | string;
  let companyAId: number | string;
  let companyBId: number | string;
  let bulkAllocAId: number | string;
  let bulkAllocBId: number | string;
  
  let mgrAToken: string;
  let mgrAUserId: number | string;
  let employeeExistingId: number | string;

  test.beforeAll(async () => {
    // 1. Initialize API Context and Defensive Cleanup
    apiContext = await request.newContext();
    await cleanupRunId(apiContext, RUN_ID);

    // 2. Setup Data via Admin
    const prog = await createDocumentAsAdmin(apiContext, 'programs', {
      title: `B2B Program ${RUN_ID}`,
      slug: `b2b-prog-${Date.now()}`,
      status: 'published',
      price: 100,
      description: 'Test program',
    });

    const round = await createDocumentAsAdmin(apiContext, 'rounds', {
      title: ROUND_TITLE,
      program: prog.id,
      status: 'published',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      capacity: 100,
    });
    roundId = round.id as number | string;

    const compA = await createDocumentAsAdmin(apiContext, 'companies', { name: COMPANY_A_NAME });
    companyAId = compA.id as number | string;
    
    const compB = await createDocumentAsAdmin(apiContext, 'companies', { name: COMPANY_B_NAME });
    companyBId = compB.id as number | string;

    const allocA = await createDocumentAsAdmin(apiContext, 'bulk-seat-allocations', {
      company: companyAId,
      round: roundId,
      status: 'active',
      totalSeats: 3,
      notes: RUN_ID,
    });
    bulkAllocAId = allocA.id as number | string;

    // Manager B Setup directly pre-verified to reduce SMS/Email overhead
    const allocB = await createDocumentAsAdmin(apiContext, 'bulk-seat-allocations', {
      company: companyBId,
      round: roundId,
      status: 'active',
      totalSeats: 2,
      notes: RUN_ID,
    });
    bulkAllocBId = allocB.id as number | string;

    const existingUser = await createDocumentAsAdmin(apiContext, 'users', {
      email: EMP_EXIST_EMAIL,
      password: 'Password123!',
      firstName: 'Existing',
      lastName: 'Emp',
      role: 'student',
      authProvider: 'local',
      verified: true,
    });
    employeeExistingId = existingUser.id as number | string;
    // Create base profile to be safely linked later
    await createDocumentAsAdmin(apiContext, 'user-profiles', {
      user: employeeExistingId,
      onboardingCompleted: true,
    });
    
    await createDocumentAsAdmin(apiContext, 'users', {
      email: STUDENT_EMAIL,
      password: 'Password123!',
      firstName: 'Standard',
      lastName: 'Student',
      role: 'student',
      authProvider: 'local',
      verified: true,
    });
    
    await createDocumentAsAdmin(apiContext, 'users', {
      email: INSTRUCTOR_EMAIL,
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'Instructor',
      role: 'instructor',
      authProvider: 'local',
      verified: true,
    });

    const mgrB = await createDocumentAsAdmin(apiContext, 'users', {
      email: MGR_B_EMAIL,
      password: 'Password123!',
      firstName: 'Manager',
      lastName: 'B',
      role: 'b2b_manager',
      authProvider: 'local',
      verified: true,
    });
    
    await createDocumentAsAdmin(apiContext, 'user-profiles', {
      user: mgrB.id,
      company: companyBId,
      title: 'Mr',
      onboardingCompleted: true,
    });
  });

  test.afterAll(async () => {
    // 3. Final Rigorous Cleanup
    try {
      if (apiContext) {
        await cleanupRunId(apiContext, RUN_ID);
        
        const progRes = await queryCollection(apiContext, 'programs', `where[title][contains]=${RUN_ID}&limit=10&depth=0`);
        for (const p of progRes.docs) {
          if (p.id) {
            try {
              await apiContext.delete(`${getBaseUrl()}/api/programs/${p.id}`, { 
                headers: { Authorization: `JWT ${process.env.E2E_ADMIN_TOKEN}` } 
              });
            } catch {}
          }
        }
        await apiContext.dispose();
      }
    } catch (e) {
      console.warn('Final cleanup errored', e);
    }
  });


  // --- 4. OTP / Registration Flow (Manager A) ---

  test('Register B2B Manager intent', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/register`);
    
    await page.locator('text="Business Manager"').or(page.locator('text="Corporate B2B"')).or(page.locator('label', { hasText: /Business|Manager/i })).click();
    await page.fill('input[name="firstName"]', 'Mgr');
    await page.fill('input[name="lastName"]', 'A');
    await page.fill('input[name="email"]', MGR_A_EMAIL);
    await page.fill('input[name="password"]', 'Password123!');
    
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]')
    ]);

    await expect(page).toHaveURL(/.*\/verify-email/);
  });

  test('OTP invalid value rejects form', async ({ page }) => {
    const inputs = page.locator('input').filter({ hasAttribute: 'type', has: /tel|text|number/i }); 
    const isSeparated = await inputs.count() > 1;

    if (isSeparated) {
      for (let i = 0; i < 6; i++) await inputs.nth(i).fill('9');
    } else {
      await inputs.first().fill('999999');
    }
    
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/invalid|wrong|incorrect/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('OTP success promotes role to B2B manager API verification', async ({ page }) => {
    const code = await waitForVerificationCode(apiContext, MGR_A_EMAIL);
    
    await page.reload();
    const inputs = page.locator('input').filter({ hasAttribute: 'type', has: /tel|text|number/i }); 
    const isSeparated = await inputs.count() > 1;

    if (isSeparated) {
      for (let i = 0; i < 6; i++) {
        await inputs.nth(i).fill(code[i]);
      }
    } else {
      await inputs.first().fill(code);
    }
    
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/onboarding/);

    // Explicit Hard Assertion Request #1
    mgrAToken = await page.evaluate(() => localStorage.getItem('payload-token') || document.cookie.split('payload-token=')[1]?.split(';')[0]);
    expect(mgrAToken).toBeDefined();

    const userMe = await apiContext.get(`${getBaseUrl()}/api/users/me`, {
      headers: { Authorization: `JWT ${mgrAToken}` }
    });
    const userData = await userMe.json();
    
    expect(userData.user.role).toBe('b2b_manager');
    mgrAUserId = userData.user.id;
  });

  // --- 5. Onboarding constraints ---

  test('B2B onboarding requires company', async ({ page }) => {
    await page.locator('select[name="title"]').or(page.locator('label', { hasText: 'Title*' })).first().fill('Mr'); 
    await page.locator('button', { hasText: /Next|Continue|Submit|Complete/ }).click();
    await expect(page.locator('text=/required/i').first()).toBeVisible();
  });

  test('Onboarding reuse existing company directly binds correctly', async ({ page }) => {
    if (await page.locator('input[name="jobTitle"]').isVisible()) await page.fill('input[name="jobTitle"]', 'CEO');
    
    const companyInput = page.locator('input[name="companyName"], input[name="company"]');
    if (await companyInput.isVisible()) {
      await companyInput.fill(COMPANY_A_NAME);
      const suggestion = page.locator(`text="${COMPANY_A_NAME}"`).first();
      if (await suggestion.isVisible()) {
        await suggestion.click();
      }
    }
    
    const finishBtn = page.locator('button', { hasText: /Next|Continue|Submit|Complete/ }).last();
    await finishBtn.click();
    
    await expect(page).toHaveURL(/.*\/b2b-dashboard/);
    
    // Explicit Hard Assertion Request #2
    const profileRes = await queryCollection(apiContext, 'user-profiles', `where[user][equals]=${mgrAUserId}`);
    const companyLinked = typeof profileRes.docs[0].company === 'object' ? profileRes.docs[0].company.id : profileRes.docs[0].company;
    
    expect(companyLinked).toBeDefined();
    expect(String(companyLinked)).toBe(String(companyAId));
  });

  // --- 6. Guards and Gatekeeping Restrictions ---

  test('B2B route guard for unauthenticated drops to login', async ({ context }) => {
    const unauthPage = await context.newPage();
    await unauthPage.context().clearCookies();
    await unauthPage.goto(`${getBaseUrl()}/b2b-dashboard`);
    await expect(unauthPage).toHaveURL(/.*\/login/);
    await unauthPage.close();
  });

  test('B2B route guard for basic student drops to core dashboard', async ({ browser }) => {
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();
    await studentPage.goto(`${getBaseUrl()}/login`);
    await studentPage.fill('input[name="email"]', STUDENT_EMAIL);
    await studentPage.fill('input[name="password"]', 'Password123!');
    await studentPage.click('button[type="submit"]');
    await expect(studentPage).toHaveURL(/.*\/dashboard/);

    await studentPage.goto(`${getBaseUrl()}/b2b-dashboard`);
    await expect(studentPage).not.toHaveURL(/.*\/b2b-dashboard/);
    await studentContext.close();
  });

  test('B2B route guard for instructor drops to instructor dashboard', async ({ browser }) => {
    const instContext = await browser.newContext();
    const instPage = await instContext.newPage();
    await instPage.goto(`${getBaseUrl()}/login`);
    await instPage.fill('input[name="email"]', INSTRUCTOR_EMAIL);
    await instPage.fill('input[name="password"]', 'Password123!');
    await instPage.click('button[type="submit"]');
    await expect(instPage).toHaveURL(/.*\/instructor\/dashboard/);

    await instPage.goto(`${getBaseUrl()}/b2b-dashboard`);
    await expect(instPage).not.toHaveURL(/.*\/b2b-dashboard/);
    await instContext.close();
  });

  // --- 7. Scope Isolation (Dashboard & Teams) ---

  test('Team list company scope isolates cross-company users', async ({ page }) => {
    await expect(page.locator(`text=${COMPANY_A_NAME}`).first()).toBeVisible();
    await page.goto(`${getBaseUrl()}/b2b-dashboard/team`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${MGR_B_EMAIL}`)).toBeHidden();
  });

  test('Add existing student to B2B Team asserts pure link logic without duplicate user', async ({ page }) => {
    // Collect ID before action
    const existingBefore = await queryCollection(apiContext, 'users', `where[email][equals]=${EMP_EXIST_EMAIL}`);
    const originalCount = existingBefore.docs.length;
    const originalUserId = existingBefore.docs[0].id;

    const addBtn = page.locator('button', { hasText: /Add Member|Invite/i }).first();
    await addBtn.click();
    await page.fill('input[name="email"]', EMP_EXIST_EMAIL);
    await page.locator('button', { hasText: /Add|Save|Create/i }).last().click();
      
    await expect(page.locator(`text=${EMP_EXIST_EMAIL}`)).toBeVisible();

    // Explicit Hard Assertion Request #3
    const existingAfter = await queryCollection(apiContext, 'users', `where[email][equals]=${EMP_EXIST_EMAIL}`);
    const profileAfter = await queryCollection(apiContext, 'user-profiles', `where[user][equals]=${originalUserId}`);
    
    expect(existingAfter.docs.length).toBe(originalCount); // No duplicates made
    expect(existingAfter.docs[0].id).toBe(originalUserId); // Original User ID preserved

    const linkedCompanyId = typeof profileAfter.docs[0].company === 'object' ? profileAfter.docs[0].company.id : profileAfter.docs[0].company;
    expect(String(linkedCompanyId)).toBe(String(companyAId)); // Successfully connected to Manager's company
  });

  test('Add new user with weak/missing password fails loudly', async ({ page }) => {
    const addBtn = page.locator('button', { hasText: /Add Member|Invite/i }).first();
    await addBtn.click();
    await page.fill('input[name="email"]', EMP_NEW_EMAIL);
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    
    let saveBtn = page.locator('button', { hasText: /Add|Save|Create/i }).last();
    await saveBtn.click();
    await expect(page.locator('text=/required|must contain/i').first()).toBeVisible();

    await page.fill('input[name="password"]', 'weak');
    await saveBtn.click();
    await expect(page.locator('text=/8 characters/i').first()).toBeVisible();
    
    await page.locator('button[aria-label="Close"]').click();
  });

  test('Add new valid user to team successfully', async ({ page }) => {
    const addBtn = page.locator('button', { hasText: /Add Member|Invite/i }).first();
    await addBtn.click();
    await page.fill('input[name="email"]', EMP_NEW_EMAIL);
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="password"]', 'StrongPass1!');
    
    await page.locator('button', { hasText: /Add|Save|Create/i }).last().click();
    await expect(page.locator(`text=${EMP_NEW_EMAIL}`)).toBeVisible();
  });

  test('Add admin user blocked', async ({ page }) => {
    await page.locator('button', { hasText: /Add Member|Invite/i }).first().click();
    await page.fill('input[name="email"]', process.env.E2E_ADMIN_EMAIL || 'admin@nextacademyedu.com');
    await page.locator('button', { hasText: /Add|Save|Create/i }).last().click();

    await expect(page.locator('.toast, [role="alert"]').filter({ hasText: /conflict|unauthorized|blocked/i })).toBeVisible();
    await page.locator('button[aria-label="Close"]').click();
  });

  test('Cannot add user already linked to another company', async ({ page }) => {
    await page.locator('button', { hasText: /Add Member|Invite/i }).first().click();
    await page.fill('input[name="email"]', MGR_B_EMAIL); // MGR B linked to B
    await page.locator('button', { hasText: /Add|Save|Create/i }).last().click();

    await expect(page.locator('.toast, [role="alert"]').filter({ hasText: /already|belongs/i })).toBeVisible();
    await page.locator('button[aria-label="Close"]').click();
  });
  
  test('Remove member UI logic correctly unlinks without user deletion', async ({ page }) => {
    const containerRow = page.locator('tr, li').filter({ hasText: EMP_EXIST_EMAIL }).first();
    await containerRow.locator('button[aria-label="Remove"], button[aria-label="Delete"]').click();
    
    await page.click('button:has-text("Confirm"), button:has-text("Delete")');
    await expect(page.locator(`text=${EMP_EXIST_EMAIL}`)).toBeHidden();

    // Explicit Hard Assertion Request #4
    const existingCheck = await queryCollection(apiContext, 'users', `where[email][equals]=${EMP_EXIST_EMAIL}`);
    const profileCheck = await queryCollection(apiContext, 'user-profiles', `where[user][equals]=${existingCheck.docs[0].id}`);
    
    expect(existingCheck.docs.length).toBe(1); // STILL EXISTS (User not deleted)
    expect(profileCheck.docs[0].company).toBeFalsy(); // UNLINKED (company=null or undefined)
  });

  // --- 8. Bulk Allocations Validations ---
  
  test('Bulk Allocation renders correctly scoped target', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/b2b-dashboard/bulk-seats`);
    await expect(page.locator(`text=${ROUND_TITLE}`)).toBeVisible();

    const allocCount = await page.locator('tr').filter({ hasText: ROUND_TITLE }).count();
    expect(allocCount).toBe(1); // Ensures MGR_B's allocation is hidden
  });

  test('Allocate seat generates booking sync accurately', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/b2b-dashboard/bulk-seats`);
    await page.locator('button', { hasText: /Allocate/i }).first().click();
    
    await page.click(`text=${EMP_NEW_EMAIL}`);
    await page.click('button:has-text("Confirm Allocation"), button:has-text("Save")');

    // Expected Remaining logic in frontend
    await expect(page.locator('text=/2 available|2 remaining/i').first()).toBeVisible();

    // Explicit Hard Assertion Request #5
    const bookingSearch = await queryCollection(
      apiContext,
      'bookings',
      `where[user.email][equals]=${EMP_NEW_EMAIL}&depth=2`
    );
    
    expect(bookingSearch.docs.length).toBe(1); // Booking was successfully created
    
    const dbBooking = bookingSearch.docs[0];
    expect(['pending', 'reserved', 'confirmed']).toContain(dbBooking.status); // Default allocation payload statuses
    expect(String(typeof dbBooking.round === 'object' ? dbBooking.round?.id : dbBooking.round)).toBe(String(roundId));

    // InternalNotes modification to ensure Cleanup runner successfully grabs it post-test
    if (dbBooking.id) {
       await createDocumentAsAdmin(apiContext, 'bookings', {
         ...dbBooking,
         internalNotes: RUN_ID
       } as any); 
    }
  });

  test('Duplicate seat allocation blocked', async ({ page }) => {
    await page.locator('button', { hasText: /Allocate/i }).first().click();
    
    const alreadyAllocatedUser = page.locator(`text=${EMP_NEW_EMAIL}`);
    if (await alreadyAllocatedUser.isEnabled()) {
       await alreadyAllocatedUser.click();
       await page.click('button:has-text("Confirm Allocation"), button:has-text("Save")');
       await expect(page.locator('.toast, [role="alert"]').filter({ hasText: /already/i })).toBeVisible();
    } else {
       const classes = await alreadyAllocatedUser.getAttribute('class');
       expect(classes).toMatch(/disabled|opacity-/);
    }
    
    await page.locator('button[aria-label="Close"]').click();
  });

  // --- 9. Negative API Checks for Data Leaks ---

  test('Manager B Context Complete Isolation', async ({ browser }) => {
    const bCtx = await browser.newContext();
    const bPage = await bCtx.newPage();

    await bPage.goto(`${getBaseUrl()}/login`);
    await bPage.fill('input[name="email"]', MGR_B_EMAIL);
    await bPage.fill('input[name="password"]', 'Password123!');
    await bPage.click('button[type="submit"]');

    await expect(bPage).toHaveURL(/.*\/b2b-dashboard/);
    await expect(bPage.locator(`text=${COMPANY_B_NAME}`)).toBeVisible();

    await bPage.goto(`${getBaseUrl()}/b2b-dashboard/team`);
    await bPage.waitForLoadState('networkidle');
    await expect(bPage.locator(`text=${MGR_A_EMAIL}`)).toBeHidden();
    await expect(bPage.locator(`text=${EMP_NEW_EMAIL}`)).toBeHidden();

    await bCtx.close();
  });

  test('Manager A cannot view Company B allocations (Strict API Access)', async ({ request }) => {
    const allocCheck = await request.get(`${getBaseUrl()}/api/bulk-seat-allocations/${bulkAllocBId}`, {
      headers: { Authorization: `JWT ${mgrAToken}` }
    });
    
    expect([403, 404, 401]).toContain(allocCheck.status());
  });
});

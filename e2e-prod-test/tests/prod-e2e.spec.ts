import { expect, test, type APIRequestContext } from '@playwright/test';
import {
  cleanupRunId,
  createDocumentAsAdmin,
  getBaseUrl,
  loginUser,
  queryCollection,
  updateDocumentAsAdmin,
  userRequest,
  waitForVerificationCode,
} from '../test-utils';

type RelationId = number | string;
type JsonRecord = Record<string, unknown>;

const RUN_ID = `PROD_E2E_${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
const PASSWORD = `Aa!${RUN_ID}x9`;

const emailFor = (label: string) => `${label}_${RUN_ID}@test.com`.toLowerCase();

const EMAIL_ROLE_ESCALATION = emailFor('role_escalation');
const EMAIL_INVALID_INTENT = emailFor('invalid_intent');
const EMAIL_STUDENT = emailFor('student');
const EMAIL_PRIMARY = emailFor('inst_primary');
const EMAIL_PRELINKED = emailFor('inst_prelinked');
const EMAIL_DUP = emailFor('inst_dup');
const EMAIL_CONFLICT = emailFor('inst_conflict');
const EMAIL_CONFLICT_OWNER = emailFor('inst_conflict_owner');
const EMAIL_OTP_INVALID = emailFor('otp_invalid');
const EMAIL_VERIFY_LIMIT = emailFor('otp_verify_limit');
const EMAIL_SEND_LIMIT = emailFor('otp_send_limit');
const EMAIL_SECONDARY = emailFor('inst_secondary');

const PROFILE_BIO = {
  root: {
    type: 'root',
    version: 1,
    format: '',
    indent: 0,
    direction: null,
    children: [
      {
        type: 'paragraph',
        version: 1,
        format: '',
        indent: 0,
        direction: null,
        children: [
          {
            type: 'text',
            version: 1,
            text: 'Instructor profile bio for e2e submission.',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
          },
        ],
      },
    ],
  },
};

const state: {
  primaryInstructorId?: RelationId;
  primaryToken?: string;
  studentToken?: string;
  secondaryInstructorId?: RelationId;
  secondaryToken?: string;
  conflictUserToken?: string;
  serviceId?: RelationId;
  programId?: RelationId;
} = {};

function relationToId(value: unknown): RelationId | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : trimmed;
  }
  if (value && typeof value === 'object' && 'id' in value) {
    return relationToId((value as { id?: unknown }).id);
  }
  return null;
}

async function postJson(
  request: APIRequestContext,
  path: string,
  body: JsonRecord,
): Promise<{ status: number; data: JsonRecord }> {
  const res = await request.post(`${getBaseUrl()}${path}`, {
    data: body,
    headers: { 'Content-Type': 'application/json' },
  });

  const data = (await res.json().catch(() => ({}))) as JsonRecord;
  return { status: res.status(), data };
}

async function getUserByEmail(request: APIRequestContext, email: string) {
  const result = await queryCollection(
    request,
    'users',
    `where[email][equals]=${encodeURIComponent(email)}&limit=1&depth=0`,
  );

  expect(result.docs.length).toBe(1);
  return result.docs[0] as JsonRecord;
}

async function getInstructorsByEmail(request: APIRequestContext, email: string) {
  return queryCollection(
    request,
    'instructors',
    `where[email][equals]=${encodeURIComponent(email)}&limit=20&depth=0`,
  );
}

async function registerPublicUser(
  request: APIRequestContext,
  payload: {
    email: string;
    firstName: string;
    lastName: string;
    signupIntent?: string;
    role?: string;
    instructorId?: number;
  },
) {
  const result = await postJson(request, '/api/users', {
    email: payload.email,
    password: PASSWORD,
    firstName: payload.firstName,
    lastName: payload.lastName,
    ...(payload.signupIntent !== undefined ? { signupIntent: payload.signupIntent } : {}),
    ...(payload.role !== undefined ? { role: payload.role } : {}),
    ...(payload.instructorId !== undefined ? { instructorId: payload.instructorId } : {}),
  });

  expect([200, 201]).toContain(result.status);
  return result;
}

async function sendOtpAndVerify(request: APIRequestContext, email: string) {
  const sendOtp = await postJson(request, '/api/auth/send-otp', { email });
  expect([200, 201]).toContain(sendOtp.status);

  const otp = await waitForVerificationCode(request, email, 20, 1000);
  const verifyOtp = await postJson(request, '/api/auth/verify-otp', { email, code: otp });
  expect(verifyOtp.status).toBe(200);
}

async function registerAndVerify(
  request: APIRequestContext,
  payload: {
    email: string;
    firstName: string;
    lastName: string;
    signupIntent: 'student' | 'instructor';
  },
) {
  await registerPublicUser(request, payload);
  await sendOtpAndVerify(request, payload.email);
  return getUserByEmail(request, payload.email);
}

test.describe('Production Instructor Flow - Full Coverage', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(180000);

  test.afterAll(async ({ request }) => {
    try {
      const summary = await cleanupRunId(request, RUN_ID);
      console.log(`[cleanup] ${RUN_ID}`, summary);
    } catch (error) {
      console.warn(`[cleanup] ${RUN_ID} failed:`, error);
    }
  });

  test('1) UI: /instructors CTA routes to instructor-intent signup', async ({ page }) => {
    await page.goto('/en/instructors');
    const cta = page.locator('a[href*="/register?intent=instructor"]').first();
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/en\/register\?intent=instructor/);
  });

  test('2) Public register cannot escalate role/instructor relation', async ({ request }) => {
    await registerPublicUser(request, {
      email: EMAIL_ROLE_ESCALATION,
      firstName: 'Escalation',
      lastName: 'Attempt',
      signupIntent: 'instructor',
      role: 'admin',
      instructorId: 999999,
    });

    const user = await getUserByEmail(request, EMAIL_ROLE_ESCALATION);
    expect(user.signupIntent).toBe('instructor');
    expect(user.role).toBe('user');
    expect(relationToId(user.instructorId)).toBeNull();
  });

  test('3) Invalid signupIntent normalizes to student', async ({ request }) => {
    await registerPublicUser(request, {
      email: EMAIL_INVALID_INTENT,
      firstName: 'Intent',
      lastName: 'Fallback',
      signupIntent: 'hacker',
    });

    const user = await getUserByEmail(request, EMAIL_INVALID_INTENT);
    expect(user.signupIntent).toBe('student');
    expect(user.role).toBe('user');
  });

  test('4) Student signup + OTP verify keeps user as student account (no instructor link)', async ({ request }) => {
    const student = await registerAndVerify(request, {
      email: EMAIL_STUDENT,
      firstName: 'Student',
      lastName: 'User',
      signupIntent: 'student',
    });

    expect(student.emailVerified).toBe(true);
    expect(student.signupIntent).toBe('student');
    expect(student.role).toBe('user');
    expect(relationToId(student.instructorId)).toBeNull();

    state.studentToken = await loginUser(request, EMAIL_STUDENT, PASSWORD);
  });

  test('5) Fresh instructor signup + OTP auto-creates and auto-links instructor profile', async ({ request }) => {
    const user = await registerAndVerify(request, {
      email: EMAIL_PRIMARY,
      firstName: 'Primary',
      lastName: 'Instructor',
      signupIntent: 'instructor',
    });

    const instructorId = relationToId(user.instructorId);
    expect(user.emailVerified).toBe(true);
    expect(user.signupIntent).toBe('instructor');
    expect(user.role).toBe('instructor');
    expect(instructorId).not.toBeNull();

    state.primaryInstructorId = instructorId as RelationId;
    state.primaryToken = await loginUser(request, EMAIL_PRIMARY, PASSWORD);

    const profile = await userRequest<{ profile?: { id?: string | number; verificationStatus?: string; isActive?: boolean } }>(
      request,
      state.primaryToken,
      'GET',
      '/api/instructor/profile',
    );

    expect(profile.status).toBe(200);
    expect(String(profile.data?.profile?.id)).toBe(String(instructorId));
    expect(profile.data?.profile?.verificationStatus).toBe('draft');
    expect(profile.data?.profile?.isActive).toBe(false);
  });

  test('6) Prelinked profile auto-links to existing instructor (no duplicate)', async ({ request }) => {
    const prelinked = await createDocumentAsAdmin(request, 'instructors', {
      firstName: 'Prelinked',
      lastName: 'Instructor',
      slug: `prelinked-${RUN_ID.toLowerCase()}`,
      email: EMAIL_PRELINKED,
      isActive: false,
      verificationStatus: 'draft',
    });

    const prelinkedId = relationToId(prelinked.id);
    expect(prelinkedId).not.toBeNull();

    const user = await registerAndVerify(request, {
      email: EMAIL_PRELINKED,
      firstName: 'Prelinked',
      lastName: 'User',
      signupIntent: 'instructor',
    });

    expect(user.role).toBe('instructor');
    expect(relationToId(user.instructorId)).toBe(prelinkedId);

    const instructors = await getInstructorsByEmail(request, EMAIL_PRELINKED);
    expect(instructors.docs.length).toBe(1);
    expect(relationToId(instructors.docs[0].id)).toBe(prelinkedId);
  });

  test('7) Duplicate instructor profiles with same email block auto-link (safe skip)', async ({ request }) => {
    await createDocumentAsAdmin(request, 'instructors', {
      firstName: 'DupOne',
      lastName: 'Instructor',
      slug: `dup-one-${RUN_ID.toLowerCase()}`,
      email: EMAIL_DUP,
      isActive: false,
      verificationStatus: 'draft',
    });

    await createDocumentAsAdmin(request, 'instructors', {
      firstName: 'DupTwo',
      lastName: 'Instructor',
      slug: `dup-two-${RUN_ID.toLowerCase()}`,
      email: EMAIL_DUP,
      isActive: false,
      verificationStatus: 'draft',
    });

    const user = await registerAndVerify(request, {
      email: EMAIL_DUP,
      firstName: 'Dup',
      lastName: 'User',
      signupIntent: 'instructor',
    });

    expect(user.role).toBe('user');
    expect(relationToId(user.instructorId)).toBeNull();

    const instructors = await getInstructorsByEmail(request, EMAIL_DUP);
    expect(instructors.docs.length).toBe(2);

    const dupToken = await loginUser(request, EMAIL_DUP, PASSWORD);
    const dupProfile = await userRequest(request, dupToken, 'GET', '/api/instructor/profile');
    expect(dupProfile.status).toBe(403);
  });

  test('8) Conflict: existing linked user prevents takeover auto-link', async ({ request }) => {
    const conflictInstructor = await createDocumentAsAdmin(request, 'instructors', {
      firstName: 'Conflict',
      lastName: 'Instructor',
      slug: `conflict-${RUN_ID.toLowerCase()}`,
      email: EMAIL_CONFLICT,
      isActive: true,
      verificationStatus: 'approved',
    });
    const conflictInstructorId = relationToId(conflictInstructor.id);
    expect(conflictInstructorId).not.toBeNull();

    await createDocumentAsAdmin(request, 'users', {
      email: EMAIL_CONFLICT_OWNER,
      password: PASSWORD,
      firstName: 'Conflict',
      lastName: 'Owner',
      role: 'instructor',
      signupIntent: 'instructor',
      emailVerified: true,
      instructorId: conflictInstructorId,
    });

    const user = await registerAndVerify(request, {
      email: EMAIL_CONFLICT,
      firstName: 'Conflict',
      lastName: 'Candidate',
      signupIntent: 'instructor',
    });

    expect(user.role).toBe('user');
    expect(relationToId(user.instructorId)).toBeNull();

    const owner = await getUserByEmail(request, EMAIL_CONFLICT_OWNER);
    expect(owner.role).toBe('instructor');
    expect(relationToId(owner.instructorId)).toBe(conflictInstructorId);

    state.conflictUserToken = await loginUser(request, EMAIL_CONFLICT, PASSWORD);
  });

  test('9) OTP validation: invalid format and wrong code rejected', async ({ request }) => {
    const badFormat = await postJson(request, '/api/auth/verify-otp', {
      email: EMAIL_PRIMARY,
      code: '12A',
    });
    expect(badFormat.status).toBe(400);

    await registerPublicUser(request, {
      email: EMAIL_OTP_INVALID,
      firstName: 'Otp',
      lastName: 'Invalid',
      signupIntent: 'student',
    });

    const sendOtp = await postJson(request, '/api/auth/send-otp', { email: EMAIL_OTP_INVALID });
    expect([200, 201]).toContain(sendOtp.status);

    const actualCode = await waitForVerificationCode(request, EMAIL_OTP_INVALID, 20, 1000);
    const wrongCode = actualCode === '000000' ? '111111' : '000000';

    const wrong = await postJson(request, '/api/auth/verify-otp', {
      email: EMAIL_OTP_INVALID,
      code: wrongCode,
    });
    expect(wrong.status).toBe(400);
  });

  test('10) OTP verify rate-limit triggers 429 after repeated bad attempts', async ({ request }) => {
    await registerPublicUser(request, {
      email: EMAIL_VERIFY_LIMIT,
      firstName: 'Otp',
      lastName: 'Limit',
      signupIntent: 'student',
    });

    const sendOtp = await postJson(request, '/api/auth/send-otp', { email: EMAIL_VERIFY_LIMIT });
    expect([200, 201]).toContain(sendOtp.status);

    const actualCode = await waitForVerificationCode(request, EMAIL_VERIFY_LIMIT, 20, 1000);
    const wrongCode = actualCode === '000000' ? '111111' : '000000';

    const statuses: number[] = [];
    for (let i = 0; i < 6; i += 1) {
      const res = await postJson(request, '/api/auth/verify-otp', {
        email: EMAIL_VERIFY_LIMIT,
        code: wrongCode,
      });
      statuses.push(res.status);
    }

    expect(statuses.some((status) => status === 400)).toBe(true);
    expect(statuses[statuses.length - 1]).toBe(429);
  });

  test('11) OTP send rate-limit triggers 429 on 4th request', async ({ request }) => {
    await registerPublicUser(request, {
      email: EMAIL_SEND_LIMIT,
      firstName: 'Otp',
      lastName: 'SendLimit',
      signupIntent: 'student',
    });

    const statuses: number[] = [];
    for (let i = 0; i < 4; i += 1) {
      const res = await postJson(request, '/api/auth/send-otp', { email: EMAIL_SEND_LIMIT });
      statuses.push(res.status);
    }

    expect(statuses[0]).toBe(200);
    expect(statuses[3]).toBe(429);
  });

  test('12) Profile submit rejects incomplete profile with missing fields', async ({ request }) => {
    expect(state.primaryToken).toBeTruthy();

    const submitIncomplete = await userRequest<{ missingFields?: string[] }>(
      request,
      state.primaryToken as string,
      'POST',
      '/api/instructor/profile/submit',
    );

    expect(submitIncomplete.status).toBe(400);
    expect(Array.isArray(submitIncomplete.data?.missingFields)).toBe(true);
    expect((submitIncomplete.data?.missingFields || []).length).toBeGreaterThan(0);
  });

  test('13) Profile pending submission appears in admin queue', async ({ request }) => {
    expect(state.primaryToken).toBeTruthy();
    expect(state.primaryInstructorId).toBeTruthy();

    const patchProfile = await userRequest<{ profile?: { verificationStatus?: string } }>(
      request,
      state.primaryToken as string,
      'PATCH',
      '/api/instructor/profile',
      {
        firstName: 'Primary',
        lastName: 'Instructor',
        jobTitle: 'Business Coach',
        tagline: 'Helping founders scale',
        bioAr: PROFILE_BIO,
      },
    );

    expect(patchProfile.status).toBe(200);

    const submit = await userRequest<{ submitted?: boolean; status?: string }>(
      request,
      state.primaryToken as string,
      'POST',
      '/api/instructor/profile/submit',
    );

    expect(submit.status).toBe(200);
    expect(submit.data?.submitted).toBe(true);
    expect(submit.data?.status).toBe('pending');

    const queue = await queryCollection(
      request,
      'instructors',
      `where[and][0][id][equals]=${encodeURIComponent(String(state.primaryInstructorId))}&where[and][1][verificationStatus][equals]=pending&limit=1&depth=0`,
    );

    expect(queue.docs.length).toBe(1);
    expect(queue.docs[0].isActive).toBe(false);
  });

  test('14) Rejection then instructor edit resets verificationStatus to draft', async ({ request }) => {
    expect(state.primaryInstructorId).toBeTruthy();
    expect(state.primaryToken).toBeTruthy();

    const rejected = await updateDocumentAsAdmin(
      request,
      'instructors',
      state.primaryInstructorId as RelationId,
      {
        verificationStatus: 'rejected',
        rejectionReason: 'Missing docs',
      },
    );
    expect(rejected.verificationStatus).toBe('rejected');

    const patchedAfterReject = await userRequest<{
      profile?: { verificationStatus?: string; rejectionReason?: string | null };
    }>(
      request,
      state.primaryToken as string,
      'PATCH',
      '/api/instructor/profile',
      {
        tagline: 'Updated after rejection',
      },
    );

    expect(patchedAfterReject.status).toBe(200);
    expect(patchedAfterReject.data?.profile?.verificationStatus).toBe('draft');
    expect(patchedAfterReject.data?.profile?.rejectionReason ?? null).toBeNull();
  });

  test('15) Resubmit after draft then admin approve, approved profile cannot resubmit', async ({ request }) => {
    expect(state.primaryInstructorId).toBeTruthy();
    expect(state.primaryToken).toBeTruthy();

    const resubmit = await userRequest<{ submitted?: boolean; status?: string }>(
      request,
      state.primaryToken as string,
      'POST',
      '/api/instructor/profile/submit',
    );

    expect(resubmit.status).toBe(200);
    expect(resubmit.data?.submitted).toBe(true);
    expect(resubmit.data?.status).toBe('pending');

    const approved = await updateDocumentAsAdmin(
      request,
      'instructors',
      state.primaryInstructorId as RelationId,
      { verificationStatus: 'approved' },
    );
    expect(approved.verificationStatus).toBe('approved');

    const profile = await userRequest<{ profile?: { verificationStatus?: string; isActive?: boolean } }>(
      request,
      state.primaryToken as string,
      'GET',
      '/api/instructor/profile',
    );

    expect(profile.status).toBe(200);
    expect(profile.data?.profile?.verificationStatus).toBe('approved');
    expect(profile.data?.profile?.isActive).toBe(true);

    const submitAfterApproval = await userRequest<{
      submitted?: boolean;
      status?: string;
      message?: string;
    }>(
      request,
      state.primaryToken as string,
      'POST',
      '/api/instructor/profile/submit',
    );

    expect(submitAfterApproval.status).toBe(200);
    expect(submitAfterApproval.data?.submitted).toBe(false);
    expect(submitAfterApproval.data?.status).toBe('approved');
  });

  test('16) Student and unlinked user are forbidden from instructor endpoints', async ({ request }) => {
    expect(state.studentToken).toBeTruthy();
    expect(state.conflictUserToken).toBeTruthy();

    const studentProfile = await userRequest(request, state.studentToken as string, 'GET', '/api/instructor/profile');
    expect(studentProfile.status).toBe(403);

    const studentServicesCreate = await userRequest(request, state.studentToken as string, 'POST', '/api/instructor/consultation-types', {
      title: 'Not allowed',
      durationMinutes: 30,
      price: 10,
    });
    expect(studentServicesCreate.status).toBe(403);

    const studentProgramsCreate = await userRequest(request, state.studentToken as string, 'POST', '/api/instructor/program-submissions', {
      titleAr: 'غير مسموح',
      shortDescriptionAr: 'غير مسموح',
      descriptionAr: 'غير مسموح',
      sessionsCount: 2,
    });
    expect(studentProgramsCreate.status).toBe(403);

    const unlinkedProfile = await userRequest(request, state.conflictUserToken as string, 'GET', '/api/instructor/profile');
    expect(unlinkedProfile.status).toBe(403);
  });

  test('17) Create secondary instructor account for ownership boundary tests', async ({ request }) => {
    const secondaryInstructor = await createDocumentAsAdmin(request, 'instructors', {
      firstName: 'Secondary',
      lastName: 'Instructor',
      slug: `secondary-${RUN_ID.toLowerCase()}`,
      email: EMAIL_SECONDARY,
      isActive: true,
      verificationStatus: 'approved',
    });

    const secondaryInstructorId = relationToId(secondaryInstructor.id);
    expect(secondaryInstructorId).not.toBeNull();
    state.secondaryInstructorId = secondaryInstructorId as RelationId;

    await createDocumentAsAdmin(request, 'users', {
      email: EMAIL_SECONDARY,
      password: PASSWORD,
      firstName: 'Secondary',
      lastName: 'Instructor',
      role: 'instructor',
      signupIntent: 'instructor',
      emailVerified: true,
      instructorId: secondaryInstructorId,
    });

    state.secondaryToken = await loginUser(request, EMAIL_SECONDARY, PASSWORD);
  });

  test('18) Consultation types: validation + CRUD + ownership boundaries', async ({ request }) => {
    expect(state.primaryToken).toBeTruthy();
    expect(state.secondaryToken).toBeTruthy();

    const invalidDuration = await userRequest(request, state.primaryToken as string, 'POST', '/api/instructor/consultation-types', {
      title: 'Invalid Duration',
      durationMinutes: -1,
      price: 100,
    });
    expect(invalidDuration.status).toBe(400);

    const created = await userRequest<{ doc?: { id?: string | number } }>(
      request,
      state.primaryToken as string,
      'POST',
      '/api/instructor/consultation-types',
      {
        title: `Service ${RUN_ID}`,
        description: 'Full coverage service',
        durationMinutes: 60,
        price: 250,
        currency: 'EGP',
        meetingType: 'online',
        maxParticipants: 1,
        isActive: true,
      },
    );
    expect(created.status).toBe(200);
    const createdServiceId = relationToId(created.data?.doc?.id);
    expect(createdServiceId).not.toBeNull();
    state.serviceId = createdServiceId as RelationId;

    const invalidMaxParticipants = await userRequest(
      request,
      state.primaryToken as string,
      'PATCH',
      `/api/instructor/consultation-types/${state.serviceId}`,
      { maxParticipants: 0 },
    );
    expect(invalidMaxParticipants.status).toBe(400);

    const tamperBySecondary = await userRequest(
      request,
      state.secondaryToken as string,
      'PATCH',
      `/api/instructor/consultation-types/${state.serviceId}`,
      { price: 9999 },
    );
    expect([403, 404]).toContain(tamperBySecondary.status);

    const deleteService = await userRequest<{ deleted?: boolean }>(
      request,
      state.primaryToken as string,
      'DELETE',
      `/api/instructor/consultation-types/${state.serviceId}`,
    );
    expect(deleteService.status).toBe(200);
    expect(deleteService.data?.deleted).toBe(true);

    const deleteAgain = await userRequest(
      request,
      state.primaryToken as string,
      'DELETE',
      `/api/instructor/consultation-types/${state.serviceId}`,
    );
    expect(deleteAgain.status).toBe(404);
  });

  test('19) Availability: validation + save + persistence + forbidden for student', async ({ request }) => {
    expect(state.primaryToken).toBeTruthy();
    expect(state.studentToken).toBeTruthy();

    const invalidBody = await userRequest(request, state.primaryToken as string, 'PUT', '/api/instructor/availability', {});
    expect(invalidBody.status).toBe(400);

    const invalidDay = await userRequest(request, state.primaryToken as string, 'PUT', '/api/instructor/availability', {
      availability: [{ dayOfWeek: 8, startTime: '09:00', endTime: '10:00' }],
    });
    expect(invalidDay.status).toBe(400);

    const save = await userRequest<{ success?: boolean }>(
      request,
      state.primaryToken as string,
      'PUT',
      '/api/instructor/availability',
      {
        availability: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '11:00', bufferMinutes: 10, isActive: true },
          { dayOfWeek: 3, startTime: '12:00', endTime: '15:00', bufferMinutes: 15, isActive: true },
        ],
      },
    );
    expect(save.status).toBe(200);
    expect(save.data?.success).toBe(true);

    const getAvailability = await userRequest<{ docs?: Array<{ dayOfWeek?: number }> }>(
      request,
      state.primaryToken as string,
      'GET',
      '/api/instructor/availability?limit=50',
    );
    expect(getAvailability.status).toBe(200);

    const days = (getAvailability.data?.docs || []).map((doc) => doc.dayOfWeek);
    expect(days).toContain(1);
    expect(days).toContain(3);

    const studentAvailability = await userRequest(request, state.studentToken as string, 'GET', '/api/instructor/availability?limit=10');
    expect(studentAvailability.status).toBe(403);
  });

  test('20) Program submissions full lifecycle + boundaries + not-found behavior', async ({ request }) => {
    expect(state.primaryToken).toBeTruthy();
    expect(state.secondaryToken).toBeTruthy();

    const invalidCreate = await userRequest(
      request,
      state.primaryToken as string,
      'POST',
      '/api/instructor/program-submissions',
      {
        descriptionAr: 'Missing required fields',
        sessionsCount: 0,
      },
    );
    expect(invalidCreate.status).toBe(400);

    const created = await userRequest<{ doc?: { id?: string | number; status?: string } }>(
      request,
      state.primaryToken as string,
      'POST',
      '/api/instructor/program-submissions',
      {
        type: 'course',
        titleAr: `برنامج ${RUN_ID}`,
        shortDescriptionAr: 'وصف قصير',
        descriptionAr: 'وصف تفصيلي للبرنامج',
        sessionsCount: 4,
        durationHours: 12,
        price: 1200,
        currency: 'EGP',
      },
    );

    expect(created.status).toBe(200);
    const createdProgramId = relationToId(created.data?.doc?.id);
    expect(createdProgramId).not.toBeNull();
    state.programId = createdProgramId as RelationId;
    expect(created.data?.doc?.status).toBe('draft');

    const submit = await userRequest<{ submitted?: boolean; doc?: { status?: string } }>(
      request,
      state.primaryToken as string,
      'POST',
      `/api/instructor/program-submissions/${state.programId}/submit`,
    );
    expect(submit.status).toBe(200);
    expect(submit.data?.submitted).toBe(true);
    expect(submit.data?.doc?.status).toBe('pending');

    const tamperBySecondary = await userRequest(
      request,
      state.secondaryToken as string,
      'PATCH',
      `/api/instructor/program-submissions/${state.programId}`,
      { descriptionAr: 'tamper' },
    );
    expect([403, 404]).toContain(tamperBySecondary.status);

    const rejected = await updateDocumentAsAdmin(
      request,
      'instructor-program-submissions',
      state.programId as RelationId,
      {
        status: 'rejected',
        reviewNotes: 'Need improvements',
      },
    );
    expect(rejected.status).toBe('rejected');

    const editedAfterReject = await userRequest<{ doc?: { status?: string } }>(
      request,
      state.primaryToken as string,
      'PATCH',
      `/api/instructor/program-submissions/${state.programId}`,
      {
        descriptionAr: 'Updated after rejection',
      },
    );
    expect(editedAfterReject.status).toBe(200);
    expect(editedAfterReject.data?.doc?.status).toBe('draft');

    const resubmit = await userRequest<{ submitted?: boolean; doc?: { status?: string } }>(
      request,
      state.primaryToken as string,
      'POST',
      `/api/instructor/program-submissions/${state.programId}/submit`,
    );
    expect(resubmit.status).toBe(200);
    expect(resubmit.data?.submitted).toBe(true);
    expect(resubmit.data?.doc?.status).toBe('pending');

    const approved = await updateDocumentAsAdmin(
      request,
      'instructor-program-submissions',
      state.programId as RelationId,
      {
        status: 'approved',
        reviewNotes: 'Approved',
        reviewedAt: new Date().toISOString(),
      },
    );
    expect(approved.status).toBe('approved');

    const list = await userRequest<{ docs?: Array<{ id?: string | number; status?: string }> }>(
      request,
      state.primaryToken as string,
      'GET',
      '/api/instructor/program-submissions?limit=100',
    );
    expect(list.status).toBe(200);

    const approvedDoc = (list.data?.docs || []).find(
      (doc) => String(doc.id) === String(state.programId),
    );
    expect(approvedDoc?.status).toBe('approved');

    const deleteOk = await userRequest<{ deleted?: boolean }>(
      request,
      state.primaryToken as string,
      'DELETE',
      `/api/instructor/program-submissions/${state.programId}`,
    );
    expect(deleteOk.status).toBe(200);
    expect(deleteOk.data?.deleted).toBe(true);

    const deleteAgain = await userRequest(
      request,
      state.primaryToken as string,
      'DELETE',
      `/api/instructor/program-submissions/${state.programId}`,
    );
    expect(deleteAgain.status).toBe(404);

    const missingService = await userRequest(
      request,
      state.primaryToken as string,
      'PATCH',
      '/api/instructor/consultation-types/999999999',
      { price: 150 },
    );
    expect(missingService.status).toBe(404);

    const missingProgram = await userRequest(
      request,
      state.primaryToken as string,
      'PATCH',
      '/api/instructor/program-submissions/999999999',
      { descriptionAr: 'x' },
    );
    expect(missingProgram.status).toBe(404);
  });
});

console.log(`[e2e] RUN_ID=${RUN_ID} BASE_URL=${getBaseUrl()}`);

/**
 * Auth API Helpers
 * Typed fetch wrappers for all authentication endpoints.
 */

interface AuthResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface LoginData {
  user: UserData;
  token: string;
  exp: number;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  gender?: 'male' | 'female';
  role: 'user' | 'admin' | 'instructor' | 'b2b_manager';
  emailVerified: boolean;
  preferredLanguage: 'ar' | 'en';
  picture?: { url: string } | null;
  instructorId?: string | { id: string } | null;
}

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  preferredLanguage?: 'ar' | 'en';
}

async function handleResponse<T>(response: Response): Promise<AuthResponse<T>> {
  try {
    const data = await response.json();

    if (!response.ok) {
      // Payload CMS returns errors in different formats
      const errorMessage =
        data?.errors?.[0]?.message ||
        data?.message ||
        data?.error ||
        'An unexpected error occurred';
      return { success: false, error: errorMessage };
    }

    return { success: true, data };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse<LoginData>> {
  const response = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  return handleResponse<LoginData>(response);
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthResponse<{ doc: UserData }>> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return handleResponse<{ doc: UserData }>(response);
}

export async function getCurrentUser(): Promise<AuthResponse<{ user: UserData | null }>> {
  const response = await fetch('/api/users/me', {
    method: 'GET',
    credentials: 'include',
  });

  return handleResponse<{ user: UserData | null }>(response);
}

export async function logoutUser(): Promise<AuthResponse<void>> {
  const response = await fetch('/api/users/logout', {
    method: 'POST',
    credentials: 'include',
  });

  return handleResponse<void>(response);
}

export async function forgotPassword(email: string): Promise<AuthResponse<void>> {
  const response = await fetch('/api/users/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  return handleResponse<void>(response);
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<AuthResponse<void>> {
  const response = await fetch('/api/users/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });

  return handleResponse<void>(response);
}

export async function sendVerificationCode(
  email: string,
): Promise<AuthResponse<{ message: string }>> {
  const response = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  return handleResponse<{ message: string }>(response);
}

export async function verifyOtp(
  email: string,
  code: string,
): Promise<AuthResponse<{ verified: boolean }>> {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  return handleResponse<{ verified: boolean }>(response);
}

/**
 * Redirect to Google OAuth flow.
 * This triggers a full-page redirect — not a fetch call.
 */
export function redirectToGoogle(redirectAfterLogin = '/dashboard'): void {
  const params = new URLSearchParams({ redirect: redirectAfterLogin });
  window.location.href = `/api/auth/google?${params.toString()}`;
}

export type { AuthResponse, LoginData, UserData, RegisterPayload };

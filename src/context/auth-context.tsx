'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  sendVerificationCode,
  type UserData,
  type RegisterPayload,
  type AuthResponse,
} from '@/lib/auth-api';

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse<unknown>>;
  register: (data: RegisterPayload) => Promise<AuthResponse<unknown>>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const result = await getCurrentUser();
      if (result.success && result.data?.user) {
        setUser(result.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse<unknown>> => {
      const result = await loginUser(email, password);

      if (result.success && result.data) {
        const userData = result.data.user;

        // If email is not verified, send OTP and signal caller
        if (!userData.emailVerified) {
          const otpResult = await sendVerificationCode(email);
          if (!otpResult.success) {
            console.warn('[auth-context] Failed to send verification OTP on login:', otpResult.error);
          }
          return {
            success: false,
            error: 'EMAIL_NOT_VERIFIED',
            data: { email, otpSent: otpResult.success },
          };
        }

        // Confirm that the server session/cookie was actually established.
        // This prevents false "logged-in" client state when cookie write fails.
        let serverUser: UserData | null = null;
        for (let attempt = 0; attempt < 3; attempt += 1) {
          const me = await getCurrentUser();
          if (me.success && me.data?.user) {
            serverUser = me.data.user;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 120));
        }

        if (!serverUser) {
          setUser(null);
          return {
            success: false,
            error: 'SESSION_NOT_ESTABLISHED',
          };
        }

        setUser(serverUser);
      }

      return result;
    },
    [],
  );

  const register = useCallback(
    async (data: RegisterPayload): Promise<AuthResponse<unknown>> => {
      const result = await registerUser(data);

      if (result.success && result.data) {
        // After registration, auto-login to set the cookie
        const loginResult = await loginUser(data.email, data.password);

        if (loginResult.success && loginResult.data) {
          // Send OTP for email verification
          const otpResult = await sendVerificationCode(data.email);
          if (!otpResult.success) {
            console.warn('[auth-context] Failed to send verification OTP on register:', otpResult.error);
          }

          return {
            success: true,
            data: {
              email: data.email,
              requiresVerification: true,
              otpSent: otpResult.success,
            },
          };
        }
      }

      return result;
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

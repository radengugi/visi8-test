import { getStorage, removeStorage, setStorage } from '@/services/storage';
import { AuthSession, AuthState, AuthStore, LoginCredentials, User } from '@/types/user.types';
import { create } from 'zustand';
import { resetQueryClient } from '@/providers/query-provider';

// Storage keys
const STORAGE_KEY = 'auth_session';

// Hardcoded valid credentials
const VALID_EMAIL = 'test@example.com';
const VALID_PASSWORD = '123456';

// Mock user data for successful login
const MOCK_USER: User = {
  id: '1',
  email: VALID_EMAIL,
  name: 'Test User',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Create initial auth state
 */
const createInitialState = (): AuthState => ({
  isLoggedIn: false,
  user: null,
  isLoading: false,
  error: null,
  emailError: null,
  passwordError: null,
});

const saveSession = async (isLoggedIn: boolean, user: User | null): Promise<void> => {
  const session: AuthSession = {
    isLoggedIn,
    user,
    timestamp: Date.now(),
  };
  await setStorage(STORAGE_KEY, session);
};

const clearSession = async (): Promise<void> => {
  await removeStorage(STORAGE_KEY);
};

// Create the auth store
export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  ...createInitialState(),

  /**
   * Login action
   * @param credentials - Email and password
   * @throws Error if credentials are invalid
   */
  login: async (credentials: LoginCredentials): Promise<void> => {
    const { email, password } = credentials;

    set({ isLoading: true, error: null, emailError: null, passwordError: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validate both credentials and collect individual errors
      let emailError: string | null = null;
      let passwordError: string | null = null;

      if (email !== VALID_EMAIL) {
        emailError = 'Email tidak terdaftar';
      }

      if (password !== VALID_PASSWORD) {
        passwordError = 'Password salah!';
      }

      // If there are any errors, throw them
      if (emailError || passwordError) {
        set({
          isLoading: false,
          emailError,
          passwordError,
          isLoggedIn: false,
          user: null,
        });
        throw new Error('Login failed');
      }

      // Successful login
      set({
        isLoggedIn: true,
        user: MOCK_USER,
        isLoading: false,
        error: null,
        emailError: null,
        passwordError: null,
      });

      // Save session to storage
      await saveSession(true, MOCK_USER);
    } catch (error) {
      set({
        isLoading: false,
        isLoggedIn: false,
        user: null,
      });
      throw error;
    }
  },

  /**
   * Logout action
   * Clears auth state, storage, and query cache
   */
  logout: async (): Promise<void> => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Clear state
      set(createInitialState());

      // Clear session from storage
      await clearSession();

      // Clear TanStack Query cache to prevent data leaks
      try {
        resetQueryClient();
      } catch (queryError) {
        console.warn('Failed to reset query cache:', queryError);
        // Don't throw - logout should succeed even if cache reset fails
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },
  
  restoreSession: async (): Promise<void> => {
    set({ isLoading: true, error: null });

    try {
      // Get session from storage
      const session = await getStorage<AuthSession>(STORAGE_KEY);

      if (session && session.isLoggedIn && session.user) {
        // Check if session is not too old (24 hours)
        const sessionAge = Date.now() - session.timestamp;
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge < maxSessionAge) {
          set({
            isLoggedIn: true,
            user: session.user,
            isLoading: false,
            error: null,
          });
          return;
        } else {
          // Session expired, clear it
          await clearSession();
        }
      }

      // No valid session found
      set({
        ...createInitialState(),
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to restore session';
      set({
        ...createInitialState(),
        error: errorMessage,
      });
    }
  },

  /**
   * Set error message
   */
  setError: (error: string | null): void => {
    set({ error });
  },

  /**
   * Clear error message
   */
  clearError: (): void => {
    set({ error: null });
  },
}));

/**
 * Combined selector hooks for better performance
 *
 * ✅ FIXED: Using individual selectors combined to prevent infinite loops
 * The key insight: Don't return objects from selectors - combine hooks instead
 */

/**
 * Complete auth state - combines multiple individual selectors
 * This prevents infinite loops by using separate subscriptions
 */
export const useAuthState = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  return { isLoggedIn, user, isLoading, error };
};

/**
 * Auth state with validation errors - for login form
 * Combines individual selectors to prevent infinite loops
 */
export const useAuthFormState = () => {
  const isLoading = useAuthStore((state) => state.isLoading);
  const emailError = useAuthStore((state) => state.emailError);
  const passwordError = useAuthStore((state) => state.passwordError);

  return { isLoading, emailError, passwordError };
};

/**
 * User info for UI display
 * Combines individual selectors to prevent infinite loops
 */
export const useAuthUser = () => {
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return { user, isLoggedIn };
};

/**
 * Individual selector hooks
 * Use these when you only need a single value
 * These are safe and won't cause infinite loops
 */
export const useIsLoggedIn = () => useAuthStore((state) => state.isLoggedIn);
export const useUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useEmailError = () => useAuthStore((state) => state.emailError);
export const usePasswordError = () => useAuthStore((state) => state.passwordError);

/**
 * Auth actions hook
 * Actions are stable references in Zustand, so this is safe
 * Returns an object of action functions
 */
export const useAuthActions = () => ({
  login: useAuthStore((state) => state.login),
  logout: useAuthStore((state) => state.logout),
  restoreSession: useAuthStore((state) => state.restoreSession),
  setError: useAuthStore((state) => state.setError),
  clearError: useAuthStore((state) => state.clearError),
});

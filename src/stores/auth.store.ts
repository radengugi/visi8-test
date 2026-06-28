import { getStorage, removeStorage, setStorage } from '@/services/storage';
import { AuthSession, AuthState, AuthStore, LoginCredentials, User } from '@/types/user.types';
import { create } from 'zustand';
import { resetQueryClient } from '@/providers/query-provider';

const STORAGE_KEY = 'auth_session';
const VALID_EMAIL = 'test@example.com';
const VALID_PASSWORD = '123456';
const MOCK_USER: User = {
  id: '1',
  email: VALID_EMAIL,
  name: 'Test User',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const createInitialState = (): AuthState => ({
  isLoggedIn: false,
  user: null,
  isLoading: false,
  error: null,
  emailError: null,
  passwordError: null,
});

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
      await new Promise<void>(resolve => setTimeout(resolve, 500));

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
      await setStorage(STORAGE_KEY, {
        isLoggedIn: true,
        user: MOCK_USER,
        timestamp: Date.now(),
      } as AuthSession);
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
      await new Promise<void>(resolve => setTimeout(resolve, 300));

      // Clear state and storage
      set(createInitialState());
      await removeStorage(STORAGE_KEY);

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
          await removeStorage(STORAGE_KEY);
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

// ========== Selector Hooks ==========
// Using individual selectors combined to prevent infinite loops

// Combined selectors
export const useAuthState = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  return { isLoggedIn, user, isLoading, error };
};

// Individual selectors
export const useIsLoggedIn = () => useAuthStore((state) => state.isLoggedIn);
export const useUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useEmailError = () => useAuthStore((state) => state.emailError);
export const usePasswordError = () => useAuthStore((state) => state.passwordError);

// Actions
export const useAuthActions = () => ({
  login: useAuthStore((state) => state.login),
  logout: useAuthStore((state) => state.logout),
  restoreSession: useAuthStore((state) => state.restoreSession),
  setError: useAuthStore((state) => state.setError),
  clearError: useAuthStore((state) => state.clearError),
});

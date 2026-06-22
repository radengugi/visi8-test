/**
 * User interface definition
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Auth session interface for storage
 */
export interface AuthSession {
  isLoggedIn: boolean;
  user: User | null;
  timestamp: number;
}

/**
 * Auth state interface
 */
export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  emailError: string | null;
  passwordError: string | null;
}

/**
 * Auth store actions interface
 */
export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Combined auth store interface
 */
export interface AuthStore extends AuthState, AuthActions {}

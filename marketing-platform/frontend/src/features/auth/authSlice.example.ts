/**
 * @fileoverview Authentication Redux Slice
 * 
 * Manages authentication state including user data, login/logout actions,
 * and authentication status. Uses Redux Toolkit for simplified state management.
 * 
 * @module features/auth/authSlice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';

/**
 * User interface representing authenticated user data
 * 
 * @interface User
 * @property {string} id - Unique user identifier
 * @property {string} email - User email address
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {string} role - User's role in the system
 */
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

/**
 * Authentication state interface
 * 
 * @interface AuthState
 * @property {User | null} user - Currently authenticated user or null if not authenticated
 * @property {string | null} token - Authentication token
 * @property {'idle' | 'loading' | 'succeeded' | 'failed'} status - Current authentication status
 * @property {string | null} error - Error message if authentication failed
 */
interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

/**
 * Login credentials interface
 * 
 * @interface LoginCredentials
 * @property {string} email - User's email address
 * @property {string} password - User's password
 */
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Initial authentication state
 * 
 * @constant {AuthState} initialState
 */
const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
};

/**
 * Async thunk for user login
 * 
 * Authenticates a user with email and password, returning user data and token on success.
 * 
 * @async
 * @function loginUser
 * @param {LoginCredentials} credentials - User login credentials
 * @returns {Promise<{user: User, token: string}>} Authentication response with user and token
 * @throws {Error} If authentication fails
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  }
);

/**
 * Async thunk for user logout
 * 
 * Logs out the current user and clears authentication state.
 * 
 * @async
 * @function logoutUser
 * @returns {Promise<void>}
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
  }
);

/**
 * Authentication slice containing reducers and actions
 * 
 * @constant {Slice} authSlice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Clears authentication error
     * 
     * @function clearError
     * @param {AuthState} state - Current authentication state
     * @returns {void}
     */
    clearError: (state) => {
      state.error = null;
    },
    
    /**
     * Sets authentication token
     * 
     * @function setToken
     * @param {AuthState} state - Current authentication state
     * @param {PayloadAction<string>} action - Action with token payload
     * @returns {void}
     */
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Login failed';
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
      });
  },
});

// Selectors

/**
 * Selects the current authenticated user
 * 
 * @function selectUser
 * @param {RootState} state - Redux root state
 * @returns {User | null} Current user or null
 */
export const selectUser = (state: RootState) => state.auth.user;

/**
 * Selects the authentication loading status
 * 
 * @function selectAuthLoading
 * @param {RootState} state - Redux root state
 * @returns {boolean} True if authentication is loading
 */
export const selectAuthLoading = (state: RootState) => state.auth.status === 'loading';

/**
 * Selects user initials from first and last name
 * 
 * @function selectUserInitials
 * @param {RootState} state - Redux root state
 * @returns {string} User initials or empty string
 */
export const selectUserInitials = (state: RootState) => {
  const user = state.auth.user;
  if (!user) return '';
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
};

/**
 * Selects user full name
 * 
 * @function selectUserFullName
 * @param {RootState} state - Redux root state
 * @returns {string} User's full name or empty string
 */
export const selectUserFullName = (state: RootState) => {
  const user = state.auth.user;
  if (!user) return '';
  return `${user.firstName} ${user.lastName}`;
};

/**
 * Selects user display information (role and email)
 * 
 * @function selectUserDisplayInfo
 * @param {RootState} state - Redux root state
 * @returns {string} User role or empty string
 */
export const selectUserDisplayInfo = (state: RootState) => {
  const user = state.auth.user;
  if (!user) return '';
  return user.role;
};

export const { clearError, setToken } = authSlice.actions;
export default authSlice.reducer;

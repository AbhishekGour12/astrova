import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,          // Stores logged-in user info
  loading: false,      // Indicates if auth-related operation is in progress
  isAuthenticated: false, // Easy flag for checking auth status
  error: null,         // For any login/logout errors
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Start loading (e.g., before login request)
    setLoading: (state, action) => {
      state.loading = action.payload ?? true;
      state.error = null;
    },

    // When login succeeds
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.isAuthenticated = true;
      state.error = null;
    },

    // When logout succeeds
    logoutSuccess: (state) => {
      state.user = null;
      state.loading = false;
      state.isAuthenticated = false;
      state.error = null;
    },

    // When login or logout fails
    authError: (state, action) => {
      state.error = action.payload || 'Authentication failed';
      state.loading = false;
      state.isAuthenticated = false;
    },
  },
});

// ✅ Export actions
export const { setLoading, loginSuccess, logoutSuccess, authError } = authSlice.actions;

// ✅ Export reducer
export default authSlice.reducer;

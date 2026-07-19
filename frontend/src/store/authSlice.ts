import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "@/lib/api";

export type User = {
  id: string;
  username: string;
  email: string;
  name: string;
  about: string;
  avatar: string;
};

type AuthState = {
  user: User | null;
  // `initialized` flips true once we've checked for an existing session on load,
  // so protected pages don't redirect before we know whether the user is logged in.
  initialized: boolean;
};

type AuthResponse = { user: User };

// --- Thunks: each one talks to the backend and returns data for the reducers. ---
// The JWT lives in an httpOnly cookie the browser sends automatically, so there's
// no token to handle on the client anymore.

export const signupUser = createAsyncThunk(
  "auth/signup",
  (payload: { username: string; email: string; password: string }) =>
    apiRequest<AuthResponse>("/auth/signup", { method: "POST", body: payload }),
);

export const loginUser = createAsyncThunk(
  "auth/login",
  (payload: { email: string; password: string }) =>
    apiRequest<AuthResponse>("/auth/login", { method: "POST", body: payload }),
);

export const forgotPassword = createAsyncThunk("auth/forgot", (payload: { email: string }) =>
  apiRequest<{ message: string }>("/auth/forgot-password", { method: "POST", body: payload }),
);

export const resetPassword = createAsyncThunk(
  "auth/reset",
  (payload: { email: string; password: string }) =>
    apiRequest<{ message: string }>("/auth/reset-password", { method: "POST", body: payload }),
);

// Runs once on app load: asks the backend who we are. If the cookie is missing
// or invalid the request 401s and we stay logged out.
export const loadUser = createAsyncThunk("auth/loadUser", () =>
  apiRequest<AuthResponse>("/auth/me"),
);

// Clears the cookie server-side, then we wipe local state.
export const logoutUser = createAsyncThunk("auth/logout", () =>
  apiRequest<{ message: string }>("/auth/logout", { method: "POST" }),
);

// Save profile changes (name, about, username).
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  (payload: { name?: string; about?: string; username?: string }) =>
    apiRequest<{ user: User }>("/users/me", { method: "PUT", body: payload }),
);

// Upload a new profile picture (base64 data URL) to the server → Cloudinary.
export const updateAvatar = createAsyncThunk("auth/updateAvatar", (image: string) =>
  apiRequest<{ user: User }>("/users/me/avatar", { method: "POST", body: { image } }),
);

// Permanently delete the account (and log out).
export const deleteAccount = createAsyncThunk("auth/deleteAccount", () =>
  apiRequest<{ message: string }>("/users/me", { method: "DELETE" }),
);

const initialState: AuthState = {
  user: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Signup and login both log the user straight in.
    const onAuthed = (state: AuthState, action: { payload: AuthResponse }) => {
      state.user = action.payload.user;
    };
    builder.addCase(signupUser.fulfilled, onAuthed);
    builder.addCase(loginUser.fulfilled, onAuthed);

    // Restoring a session from the cookie.
    builder.addCase(loadUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.initialized = true;
    });
    builder.addCase(loadUser.rejected, (state) => {
      state.initialized = true;
    });

    // Logout clears the user regardless of whether the request succeeded.
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
    });
    builder.addCase(logoutUser.rejected, (state) => {
      state.user = null;
    });

    // Reflect saved profile changes in the current user.
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload.user;
    });
    builder.addCase(updateAvatar.fulfilled, (state, action) => {
      state.user = action.payload.user;
    });
    builder.addCase(deleteAccount.fulfilled, (state) => {
      state.user = null;
    });
  },
});

export default authSlice.reducer;

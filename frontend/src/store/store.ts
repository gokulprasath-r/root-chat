import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import chatReducer from "./chatSlice";

// Central Redux store. Feature slices get registered in the `reducer` map below
// as the app grows (auth, chats, messages, etc.).
export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
  },
});

// These inferred types are what the typed hooks rely on, so components stay
// type-safe without us hand-writing the shape of the state.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

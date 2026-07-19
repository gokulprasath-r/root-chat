"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { loadUser } from "./authSlice";

// Fires once when the app mounts: tries to restore a session from a saved token
// so a logged-in user stays logged in across refreshes.
function SessionLoader({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);
  return <>{children}</>;
}

// The Redux store lives on the client, but the App Router renders on the server
// by default. This wrapper is a client component so we can drop it into the
// root layout and make the store available to every component below it.
export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionLoader>{children}</SessionLoader>
    </Provider>
  );
}

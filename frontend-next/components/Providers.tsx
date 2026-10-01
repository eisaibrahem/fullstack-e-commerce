"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { useEffect } from "react";
import { loadFromStorage } from "@/store/authSlice";
import { AuthRedirector } from "./AuthRedirector";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(loadFromStorage());
  }, []);

  return (
    <Provider store={store}>
      <AuthRedirector />
      {children}
    </Provider>
  );
}

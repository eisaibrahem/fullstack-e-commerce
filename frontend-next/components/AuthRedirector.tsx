"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { subscribeUnauthorized } from "@/lib/auth-events";

export function AuthRedirector() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    return subscribeUnauthorized(() => {
      dispatch(logout());
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/register") {
        router.replace("/login");
      }
    });
  }, [dispatch, router]);

  return null;
}

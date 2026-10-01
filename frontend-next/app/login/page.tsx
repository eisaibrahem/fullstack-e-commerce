"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login } from "@/store/authSlice";
import { LoginForm } from "./_components/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/products");
    }
  }, [isAuthenticated, router]);

  return (
    <LoginForm
      loading={status === "loading"}
      error={status === "rejected" ? error : null}
      onSubmit={(values) => dispatch(login(values))}
    />
  );
}

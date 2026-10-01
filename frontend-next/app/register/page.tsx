"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { register } from "@/store/authSlice";
import { RegisterForm } from "./_components/RegisterForm";
import type { RegisterFormValues } from "./_components/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/products");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (values: RegisterFormValues) => {
    dispatch(register(values));
  };

  return (
    <RegisterForm
      loading={status === "loading"}
      error={status === "rejected" ? error : null}
      onSubmit={handleSubmit}
    />
  );
}

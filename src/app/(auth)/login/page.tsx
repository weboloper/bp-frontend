"use client";

import { useSearchParams } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  return <LoginForm redirectUrl={redirectUrl} />;
}

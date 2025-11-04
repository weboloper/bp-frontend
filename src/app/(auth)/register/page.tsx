"use client";

import { useSearchParams } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  return <RegisterForm redirectUrl={redirectUrl} />;
}

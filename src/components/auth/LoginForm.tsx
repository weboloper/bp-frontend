"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

interface LoginFormProps {
  redirectUrl?: string;
}

export default function LoginForm({ redirectUrl = "/dashboard" }: LoginFormProps) {
  const [serverError, setServerError] = useState<string>("");
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError("");

      // Login and set HTTPOnly cookies
      await authAPI.login({
        username: data.username,
        password: data.password,
      });

      // Fetch user data and update AuthContext state
      await checkAuth();

      // Success - redirect to dashboard or specified redirect URL
      router.push(redirectUrl);
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle network errors or server being offline
      if (
        error.isNetworkError ||
        error.message === "Unable to connect to server"
      ) {
        setServerError(
          "Unable to connect to server. Please check your connection and try again."
        );
        return;
      }

      // Handle field-specific validation errors from Django backend
      if (error.username) {
        setError("username", {
          type: "server",
          message: Array.isArray(error.username)
            ? error.username[0]
            : error.username,
        });
      }
      if (error.password) {
        setError("password", {
          type: "server",
          message: Array.isArray(error.password)
            ? error.password[0]
            : error.password,
        });
      }

      // Handle non-field errors
      if (error.non_field_errors) {
        setServerError(
          Array.isArray(error.non_field_errors)
            ? error.non_field_errors[0]
            : error.non_field_errors
        );
      } else if (error.detail) {
        setServerError(error.detail);
      } else if (
        error.message &&
        !error.username &&
        !error.password
      ) {
        // Fallback for other server errors (500, etc.)
        setServerError(error.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Giriş yapın</h1>
          <p className="text-balance text-muted-foreground">
            Login to your BP Frontend account
          </p>
        </div>

        <Field data-invalid={!!errors.username}>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            placeholder="Enter your username"
            aria-invalid={!!errors.username}
            {...register("username")}
          />
          {errors.username && (
            <FieldError>{errors.username.message}</FieldError>
          )}
        </Field>

        <Field data-invalid={!!errors.password}>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/accounts/password-reset-request"
              className="ml-auto text-sm underline-offset-2 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <FieldError>{errors.password.message}</FieldError>
          )}
        </Field>

        {serverError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Hata!</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Field>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </Field>

        <SocialLoginButtons redirectUrl={redirectUrl} />

        <FieldDescription className="text-center">
          Don&apos;t have an account? <Link href="/register">Sign up</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  passwordResetRequestSchema,
  type PasswordResetRequestFormData,
} from "@/lib/schemas/auth";
import { authAPI } from "@/lib/api";
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

export default function PasswordResetRequestPage() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string>("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetRequestFormData>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: PasswordResetRequestFormData) => {
    try {
      setServerError("");

      await authAPI.requestPasswordReset(data.email);

      // Success!
      setSuccess(true);
    } catch (error: any) {
      console.error("Password reset request error:", error);

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
      if (error.email) {
        setError("email", {
          type: "server",
          message: Array.isArray(error.email) ? error.email[0] : error.email,
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
      } else if (error.message && !error.email) {
        // Fallback for other server errors (500, etc.)
        setServerError(error.message);
      }
    }
  };

  if (success) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Email Sent Successfully!
          </h2>
          <p className="text-muted-foreground">
            If an account exists with this email address, you will receive a
            password reset link shortly.
          </p>
          <p className="text-sm text-muted-foreground">
            Please check your inbox and spam folder.
          </p>
          <Link href="/login">
            <Button variant="outline" className="mt-4">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-balance text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </p>
        </div>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
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
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Remember your password? <Link href="/login">Sign in</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}

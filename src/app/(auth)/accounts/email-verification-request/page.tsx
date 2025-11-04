"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  emailVerificationRequestSchema,
  type EmailVerificationRequestFormData,
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

export default function EmailVerificationRequestPage() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string>("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EmailVerificationRequestFormData>({
    resolver: zodResolver(emailVerificationRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: EmailVerificationRequestFormData) => {
    try {
      setServerError("");

      await authAPI.requestEmailVerification(data.email);

      // Success!
      setSuccess(true);
    } catch (error: any) {
      console.error("Email verification request error:", error);

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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Check Your Email
          </h2>
          <p className="text-muted-foreground">
            If an account exists with the email address you provided, you will
            receive email verification instructions.
          </p>
          <p className="text-sm text-muted-foreground">
            Please check your inbox and follow the link to verify your email.
          </p>
          <Link href="/login">
            <Button variant="outline" className="mt-4">
              Return to Login
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
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-balance text-muted-foreground">
            Enter your email address and we&apos;ll send you instructions to
            verify your email
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
            {isSubmitting ? "Sending..." : "Send Verification Email"}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Already verified? <Link href="/login">Sign in</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}

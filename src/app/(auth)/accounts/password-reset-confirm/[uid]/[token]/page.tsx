"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  passwordResetConfirmSchema,
  type PasswordResetConfirmFormData,
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

export default function PasswordResetConfirmPage() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const router = useRouter();
  const params = useParams();
  const uid = params.uid as string;
  const token = params.token as string;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetConfirmFormData>({
    resolver: zodResolver(passwordResetConfirmSchema),
    defaultValues: {
      password1: "",
      password2: "",
    },
  });

  const onSubmit = async (data: PasswordResetConfirmFormData) => {
    try {
      setServerError("");

      await authAPI.confirmPasswordReset(
        uid,
        token,
        data.password1,
        data.password2
      );

      // Success!
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Password reset confirm error:", error);

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
      if (error.password || error.password1) {
        setError("password1", {
          type: "server",
          message: Array.isArray(error.password || error.password1)
            ? (error.password || error.password1)[0]
            : error.password || error.password1,
        });
      }
      if (error.password2) {
        setError("password2", {
          type: "server",
          message: Array.isArray(error.password2)
            ? error.password2[0]
            : error.password2,
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
        !error.password &&
        !error.password1 &&
        !error.password2
      ) {
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
            Password Reset Successfully!
          </h2>
          <p className="text-muted-foreground">
            Your password has been reset successfully.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Set new password</h1>
          <p className="text-balance text-muted-foreground">
            Please enter your new password below
          </p>
        </div>

        <Field data-invalid={!!errors.password1}>
          <FieldLabel htmlFor="password1">New Password</FieldLabel>
          <Input
            id="password1"
            type="password"
            placeholder="Enter new password"
            aria-invalid={!!errors.password1}
            {...register("password1")}
          />
          {errors.password1 && (
            <FieldError>{errors.password1.message}</FieldError>
          )}
        </Field>

        <Field data-invalid={!!errors.password2}>
          <FieldLabel htmlFor="password2">Confirm New Password</FieldLabel>
          <Input
            id="password2"
            type="password"
            placeholder="Confirm new password"
            aria-invalid={!!errors.password2}
            {...register("password2")}
          />
          {errors.password2 && (
            <FieldError>{errors.password2.message}</FieldError>
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
            {isSubmitting ? "Resetting password..." : "Reset Password"}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Remember your password? <Link href="/login">Sign in</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}

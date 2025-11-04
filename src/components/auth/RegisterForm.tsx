"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth";
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
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

interface RegisterFormProps {
  redirectUrl?: string;
}

export default function RegisterForm({ redirectUrl = "/dashboard" }: RegisterFormProps) {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password1: "",
      password2: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError("");

      await authAPI.register({
        username: data.username,
        email: data.email,
        password1: data.password1,
        password2: data.password2,
      });

      // Success!
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);

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
      if (error.email) {
        setError("email", {
          type: "server",
          message: Array.isArray(error.email) ? error.email[0] : error.email,
        });
      }
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
        !error.username &&
        !error.email &&
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
            Registration Successful!
          </h2>
          <p className="text-muted-foreground">
            Your account has been created successfully.
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
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-balance text-muted-foreground">
            Sign up for your BP Frontend account
          </p>
        </div>

        <Field data-invalid={!!errors.username}>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            placeholder="Choose a username"
            aria-invalid={!!errors.username}
            {...register("username")}
          />
          {errors.username && (
            <FieldError>{errors.username.message}</FieldError>
          )}
        </Field>

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

        <Field data-invalid={!!errors.password1}>
          <FieldLabel htmlFor="password1">Password</FieldLabel>
          <Input
            id="password1"
            type="password"
            placeholder="Create a password"
            aria-invalid={!!errors.password1}
            {...register("password1")}
          />
          {errors.password1 && (
            <FieldError>{errors.password1.message}</FieldError>
          )}
        </Field>

        <Field data-invalid={!!errors.password2}>
          <FieldLabel htmlFor="password2">Confirm Password</FieldLabel>
          <Input
            id="password2"
            type="password"
            placeholder="Confirm your password"
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
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </Field>

        <SocialLoginButtons redirectUrl={redirectUrl} />

        <FieldDescription className="text-center">
          Already have an account? <Link href="/login">Sign in</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}

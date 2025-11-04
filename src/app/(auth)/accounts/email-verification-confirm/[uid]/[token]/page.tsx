"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authAPI } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EmailVerificationConfirmPage() {
  const [success, setSuccess] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();
  const params = useParams();

  const uid = params.uid as string;
  const token = params.token as string;

  useEffect(() => {
    const verifyEmail = async () => {
      // Validate that uid and token are present
      if (!uid || !token) {
        setInvalidLink(true);
        setIsVerifying(false);
        setErrorMessage("Invalid verification link");
        return;
      }

      try {
        await authAPI.confirmEmailVerify(uid, token);

        // Success!
        setSuccess(true);
        setIsVerifying(false);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (error: any) {
        console.error("Email verification confirm error:", error);

        // Handle network errors or server being offline
        if (
          error.isNetworkError ||
          error.message === "Unable to connect to server"
        ) {
          setErrorMessage(
            "Unable to connect to server. Please try again later."
          );
        } else if (error.detail) {
          setErrorMessage(error.detail);
        } else if (error.message) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Email verification failed");
        }

        setInvalidLink(true);
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [uid, token, router]);

  // Loading state
  if (isVerifying) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-500 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Verifying Your Email
          </h2>
          <p className="text-muted-foreground">
            Please wait while we verify your email address...
          </p>
        </div>
      </div>
    );
  }

  // Invalid link state
  if (invalidLink) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Verification Failed
          </h2>
          <p className="text-muted-foreground">
            {errorMessage || "This email verification link is invalid or has expired."}
          </p>
          <p className="text-sm text-muted-foreground">
            Please request a new verification email.
          </p>
          <div className="pt-4 flex gap-4 justify-center">
            <Link href="/accounts/email-verification-request">
              <Button variant="outline">Request new link</Button>
            </Link>
            <Link href="/login">
              <Button variant="default">Return to login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
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
            Email Verified Successfully!
          </h2>
          <p className="text-muted-foreground">
            Your email address has been verified.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  // This should never be reached
  return null;
}

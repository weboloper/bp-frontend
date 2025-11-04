import { z } from "zod";

// Login form validation schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register form validation schema
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens"
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password1: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    password2: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password1 === data.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Password reset request form validation schema
export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
});

export type PasswordResetRequestFormData = z.infer<typeof passwordResetRequestSchema>;

// Password reset confirm form validation schema
export const passwordResetConfirmSchema = z
  .object({
    password1: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    password2: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password1 === data.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  });

export type PasswordResetConfirmFormData = z.infer<typeof passwordResetConfirmSchema>;

// Email verification request form validation schema
export const emailVerificationRequestSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
});

export type EmailVerificationRequestFormData = z.infer<typeof emailVerificationRequestSchema>;

// Profile update form validation schema
export const profileUpdateSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  birth_date: z
    .string()
    .min(1, "Birth date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must be in YYYY-MM-DD format"),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  avatar: z
    .custom<FileList>()
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return files[0].size <= 5 * 1024 * 1024; // 5MB
      },
      { message: "Avatar must be less than 5MB" }
    )
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        return allowedTypes.includes(files[0].type);
      },
      { message: "Avatar must be a JPEG, PNG, or WebP image" }
    ),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

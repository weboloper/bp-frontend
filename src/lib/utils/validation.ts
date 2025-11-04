// Form validation utilities

export interface ValidationError {
  field: string;
  message: string;
}

export const validators = {
  // Email validation
  email: (value: string): string | null => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Invalid email address';
    return null;
  },

  // Username validation
  username: (value: string): string | null => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 30) return 'Username must be less than 30 characters';
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    return null;
  },

  // Password validation
  password: (value: string): string | null => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
    return null;
  },

  // Password confirmation
  passwordConfirm: (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  },

  // Required field
  required: (value: string, fieldName: string): string | null => {
    if (!value || value.trim() === '') return `${fieldName} is required`;
    return null;
  },
};

// Validate entire form
export const validateForm = (
  fields: Record<string, string>,
  rules: Record<string, (value: string) => string | null>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  Object.entries(rules).forEach(([field, validator]) => {
    const error = validator(fields[field]);
    if (error) {
      errors.push({ field, message: error });
    }
  });

  return errors;
};

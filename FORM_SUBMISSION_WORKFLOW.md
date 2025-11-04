# Form Submission Workflow Pattern

Bu doküman, tüm form submit işlemlerinde kullanılacak standart workflow'u açıklar. Bu pattern güvenli, type-safe, ve maintainable bir yapı sağlar.

## 📋 İçindekiler

1. [Genel Mimari](#genel-mimari)
2. [Adım Adım Uygulama](#adım-adım-uygulama)
3. [Error Handling](#error-handling)
4. [Örnek Kod Şablonları](#örnek-kod-şablonları)
5. [Best Practices](#best-practices)

---

## Genel Mimari

### 4 Katmanlı Yapı

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Page Component (UI)                          │
│  - React Hook Form + Zod validation                    │
│  - User interaction & feedback                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 2: API Client (lib/api)                         │
│  - Type-safe API calls                                 │
│  - Client-side error handling                          │
│  - Network error detection                             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Next.js API Route (app/api)                  │
│  - Server-side proxy                                   │
│  - HTTPOnly cookie management                          │
│  - JSON parse error handling                           │
│  - Environment variable protection                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Django Backend                               │
│  - Business logic                                      │
│  - Database operations                                 │
│  - Field & non-field errors                           │
└─────────────────────────────────────────────────────────┘
```

---

## Adım Adım Uygulama

### Adım 1: Zod Schema Tanımla

**Dosya:** `src/lib/schemas/[feature].ts`

```typescript
import { z } from "zod";

// Form validation schema
export const myFormSchema = z.object({
  fieldName: z
    .string()
    .min(1, "Field is required")
    .min(3, "Minimum 3 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

// TypeScript type inference
export type MyFormData = z.infer<typeof myFormSchema>;
```

**Özellikler:**

- ✅ Client-side validation
- ✅ Type safety
- ✅ Reusable schema
- ✅ Custom error messages

---

### Adım 2: Next.js API Route Oluştur

**Dosya:** `src/app/api/my-endpoint/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call Django backend
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${baseUrl}/api/your-endpoint/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // Django returned HTML error page instead of JSON (likely 500)
      console.error(
        "Django returned non-JSON response:",
        response.status,
        jsonError
      );
      return NextResponse.json(
        {
          error: "Server error",
          detail: "Backend server encountered an error",
        },
        { status: response.status || 500 }
      );
    }

    // Return response as-is (success or Django validation errors)
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("API error:", error);

    // Network error: Django offline, connection refused, timeout, etc.
    if (
      error.cause?.code === "ECONNREFUSED" ||
      error.message?.includes("fetch failed")
    ) {
      return NextResponse.json(
        {
          error: "Unable to connect to server",
          detail: "Backend service is unavailable",
          isNetworkError: true,
        },
        { status: 503 }
      );
    }

    // Unexpected error (request body parse error, etc.)
    return NextResponse.json(
      { error: "Internal server error", detail: error.message },
      { status: 500 }
    );
  }
}
```

**Özellikler:**

- ✅ JSON parse error handling (Django 500 HTML response)
- ✅ Network error detection (ECONNREFUSED, fetch failed)
- ✅ Status code preservation (returns Django's status as-is)
- ✅ Single responsibility (no duplicate error handling)
- ✅ Detailed logging for debugging

---

### Adım 3: API Client Fonksiyonu

**Dosya:** `src/lib/api/[feature].ts`

```typescript
export interface MyRequestData {
  fieldName: string;
  email: string;
}

export const myAPI = {
  submit: async (data: MyRequestData) => {
    try {
      const response = await fetch("/api/my-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        // If response is not JSON (e.g., 500 error with HTML)
        const error: any = new Error("Server error. Please try again later.");
        error.status = response.status;
        throw error;
      }

      if (!response.ok) {
        // Throw error with field-specific errors attached
        const error: any = new Error(
          responseData.error || responseData.detail || "Request failed"
        );
        Object.assign(error, responseData); // Include all field-specific errors
        throw error;
      }

      return responseData;
    } catch (error: any) {
      // Handle network errors
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        const networkError: any = new Error("Unable to connect to server");
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  },
};
```

**Özellikler:**

- ✅ Type-safe request/response
- ✅ Network error handling
- ✅ Field error preservation
- ✅ Reusable API calls

---

### Adım 4: Page Component (React Hook Form + Zod)

**Dosya:** `src/app/my-page/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { myFormSchema, type MyFormData } from "@/lib/schemas/my-schema";
import { myAPI } from "@/lib/api/my-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export default function MyPage() {
  const [serverError, setServerError] = useState<string>("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MyFormData>({
    resolver: zodResolver(myFormSchema),
    defaultValues: {
      fieldName: "",
      email: "",
    },
  });

  const onSubmit = async (data: MyFormData) => {
    try {
      setServerError("");

      await myAPI.submit({
        fieldName: data.fieldName,
        email: data.email,
      });

      // Success handling
      alert("Success!");
    } catch (error: any) {
      console.error("Submission error:", error);

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
      if (error.fieldName) {
        setError("fieldName", {
          type: "server",
          message: Array.isArray(error.fieldName)
            ? error.fieldName[0]
            : error.fieldName,
        });
      }
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
      } else if (error.message && !error.fieldName && !error.email) {
        // Fallback for other server errors (500, etc.)
        setServerError(error.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={!!errors.fieldName}>
          <FieldLabel htmlFor="fieldName">Field Name</FieldLabel>
          <Input
            id="fieldName"
            type="text"
            placeholder="Enter field name"
            aria-invalid={!!errors.fieldName}
            {...register("fieldName")}
          />
          {errors.fieldName && (
            <FieldError>{errors.fieldName.message}</FieldError>
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

        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Field>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
```

**Özellikler:**

- ✅ Zod validation
- ✅ React Hook Form integration
- ✅ Field-level errors (red border + label)
- ✅ Server errors in Alert component
- ✅ Loading states
- ✅ Network error handling

---

## Error Handling

### Error Flow Diyagramı

```
┌──────────────────────────────────────────────────────────┐
│ Error Type                    → Handler → UI Display     │
├──────────────────────────────────────────────────────────┤
│ Network Error (offline)       → Layer 2 → Alert         │
│ Django 500 (HTML response)    → Layer 3 → Alert         │
│ Django 500 (JSON)             → Layer 2 → Alert         │
│ Django 400 (field errors)     → Layer 1 → FieldError    │
│ Django 400 (non-field errors) → Layer 1 → Alert         │
│ Client validation error       → Layer 1 → FieldError    │
└──────────────────────────────────────────────────────────┘
```

### Error Örnekleri

#### 1. Network Error (Django Offline)

```json
{
  "error": "Unable to connect to backend server",
  "detail": "The backend service is currently unavailable",
  "isNetworkError": true
}
```

**UI:** Alert - "Unable to connect to server..."

#### 2. Django Field Errors (400)

```json
{
  "username": ["This field must be unique."],
  "email": ["Enter a valid email address."]
}
```

**UI:** Red border + red label + FieldError per field

#### 3. Django Non-Field Errors (400)

```json
{
  "non_field_errors": ["Invalid credentials."]
}
```

**UI:** Alert - "Invalid credentials."

#### 4. Django 500 (HTML)

```json
{
  "error": "Server error",
  "detail": "Backend returned an invalid response",
  "status": 500
}
```

**UI:** Alert - "Server error. Please try again later."

---

## Örnek Kod Şablonları

### Minimum Viable Pattern

```typescript
// 1. Schema (lib/schemas/my-schema.ts)
export const schema = z.object({
  field: z.string().min(1, "Required"),
});

// 2. API Route (app/api/my-endpoint/route.ts)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await res.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: "Server error", detail: "Backend error" },
        { status: res.status || 500 }
      );
    }

    // Return as-is (preserves status code)
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    // Network error
    if (
      error.cause?.code === "ECONNREFUSED" ||
      error.message?.includes("fetch failed")
    ) {
      return NextResponse.json(
        { error: "Unable to connect to server", isNetworkError: true },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// 3. API Client (lib/api/my-api.ts)
export const api = {
  submit: async (data: any) => {
    try {
      const res = await fetch("/api/my-endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let json;
      try {
        json = await res.json();
      } catch {
        throw new Error("Server error");
      }

      if (!res.ok) {
        const error: any = new Error(json.error || "Failed");
        Object.assign(error, json);
        throw error;
      }

      return json;
    } catch (error: any) {
      if (error.message === "Failed to fetch") {
        const networkError: any = new Error("Unable to connect to server");
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  },
};

// 4. Component (app/my-page/page.tsx)
const [serverError, setServerError] = useState("");
const {
  register,
  handleSubmit,
  setError,
  formState: { errors },
} = useForm({
  resolver: zodResolver(schema),
});

const onSubmit = async (data) => {
  try {
    setServerError("");
    await api.submit(data);
  } catch (error: any) {
    if (error.isNetworkError) {
      setServerError("Unable to connect to server");
      return;
    }
    if (error.field) {
      setError("field", { message: error.field[0] });
    } else {
      setServerError(error.message);
    }
  }
};
```

---

## Best Practices

### ✅ DO's

1. **Always use Zod for validation**

   - Client-side validation ilk savunma hattı
   - Type safety garanti eder

2. **Handle all error types**

   - Network errors
   - JSON parse errors
   - Field errors
   - Non-field errors

3. **Use Shadcn Alert for server errors**

   ```tsx
   <Alert variant="destructive">
     <AlertCircle className="h-4 w-4" />
     <AlertTitle>Error!</AlertTitle>
     <AlertDescription>{serverError}</AlertDescription>
   </Alert>
   ```

4. **Use FieldError for field errors**

   ```tsx
   <Field data-invalid={!!errors.fieldName}>
     <FieldLabel>Field Name</FieldLabel>
     <Input aria-invalid={!!errors.fieldName} {...register("fieldName")} />
     {errors.fieldName && <FieldError>{errors.fieldName.message}</FieldError>}
   </Field>
   ```

5. **Always log errors**

   ```typescript
   console.error("Error context:", error);
   ```

6. **Clear server errors on retry**
   ```typescript
   const onSubmit = async (data) => {
     setServerError(""); // Clear previous errors
     try { ... }
   }
   ```

### ❌ DON'Ts

1. **Don't skip validation layers**

   - Client validation (Zod)
   - Server validation (Django)

2. **Don't expose backend URLs to client**

   - Use Next.js API routes as proxy
   - Environment variables server-side only

3. **Don't ignore network errors**

   - Always handle `Failed to fetch`
   - Provide user-friendly messages

4. **Don't use plain text for errors**

   - Use Alert component for visibility
   - Include error icons

5. **Don't forget loading states**
   ```tsx
   <Button disabled={isSubmitting}>
     {isSubmitting ? "Loading..." : "Submit"}
   </Button>
   ```

---

## State Management Pattern

### API Calls ve State İlişkisi

**KURAL:** State yönetimi gerektiren API calls için AuthContext (veya ilgili Context) kullan.

#### ✅ State Gerektiren API Calls

**Pattern:**

```
UI Component
  → AuthContext.functionName()
    → authAPI.functionName() (API call)
    → setState() (State güncelle)
  → UI güncelle/redirect
```

**Örnekler:**

1. **Logout** (User state temizleme)

   ```typescript
   // AuthContext.tsx
   const logout = async () => {
     try {
       setIsLoading(true);
       await authAPI.logout(); // API call
       setUser(null); // State temizle
     } finally {
       setIsLoading(false);
     }
   };

   // DashboardHeader.tsx
   const handleLogout = async () => {
     await logout(); // AuthContext.logout
     router.push("/login");
   };
   ```

2. **Update Profile** (User state güncelleme)

   ```typescript
   // AuthContext'te
   const updateProfile = async (data) => {
     await authAPI.updateProfile(data);
     setUser(updatedUser);
   };
   ```

3. **Delete Account** (User state temizleme)
   ```typescript
   // AuthContext'te
   const deleteAccount = async () => {
     await authAPI.deleteAccount();
     setUser(null);
   };
   ```

#### ✅ State Gerektirmeyen API Calls

**Pattern:**

```
UI Component
  → authAPI.functionName() (API call)
  → checkAuth() (Gerekirse state fetch)
  → UI güncelle/redirect
```

**Örnekler:**

1. **Login** (Form handling page'de)

   ```typescript
   // Login Page
   await authAPI.login(credentials); // API call + cookie set
   await checkAuth(); // State fetch
   router.push("/dashboard");
   ```

2. **Register** (State değişikliği yok)

   ```typescript
   // Register Page
   await authAPI.register(data); // API call
   router.push("/login"); // Login'de state set edilecek
   ```

3. **Password Reset** (State değişikliği yok)
   ```typescript
   // Password Reset Page
   await authAPI.resetPassword(email);
   setSuccess(true);
   ```

#### 🎯 Karar Ağacı

```
API call yapacaksın
  ↓
State değişikliği gerekiyor mu?
  ↓                           ↓
YES                          NO
  ↓                           ↓
AuthContext'te               Direkt authAPI
fonksiyon yaz                kullan
  ↓                           ↓
authAPI çağır +              Manuel state update
state güncelle               (gerekirse)
```

#### ⚠️ ÖNEMLİ NOTLAR

1. **State gerektiren API'lerde direkt authAPI çağırma!**

   ```typescript
   // ❌ YANLIŞ
   await authAPI.logout(); // State temizlenmiyor!

   // ✅ DOĞRU
   await logout(); // AuthContext.logout (state temizliyor)
   ```

2. **AuthContext'te gereksiz wrapper yapma!**

   ```typescript
   // ❌ YANLIŞ
   const refreshUser = async () => {
     await checkAuth(); // Gereksiz wrapper
   };

   // ✅ DOĞRU
   // checkAuth'u direkt export et
   ```

3. **Login/Register için AuthContext'te fonksiyon yazma!**
   - Form handling page'de kalmalı (FORM_SUBMISSION_WORKFLOW)
   - Error handling page'de (Zod + React Hook Form)
   - State sonradan `checkAuth()` ile eklenir

---

## Checklist

Her form submit için:

- [ ] Zod schema oluşturuldu (`lib/schemas`)
- [ ] Next.js API route eklendi (`app/api`)
- [ ] API client fonksiyonu yazıldı (`lib/api`)
- [ ] React Hook Form + Zod resolver kullanıldı
- [ ] Field errors `FieldError` ile gösteriliyor
- [ ] Server errors `Alert` ile gösteriliyor
- [ ] Network errors handle ediliyor
- [ ] Loading states var
- [ ] Console logging eklendi
- [ ] TypeScript types tanımlı

---

## Referanslar

### Canlı Örnekler (Production-Ready)

- **Page Component:** [src/app/(auth)/register/page.tsx](<src/app/(auth)/register/page.tsx>)

  - React Hook Form + Zod integration
  - Field-level ve server-level error handling
  - Network error detection
  - Success state management

- **API Client (authAPI):** [src/lib/api/auth.ts](src/lib/api/auth.ts)

  - `authAPI.register()` fonksiyonu referans implementasyon
  - Network error handling (`Failed to fetch`)
  - `isNetworkError` flag pattern
  - `Object.assign()` ile field error preservation
  - JSON parse error handling

- **API Route:** [src/app/api/auth/register/route.ts](src/app/api/auth/register/route.ts)

  - Django proxy pattern
  - JSON parse error handling (500 HTML response)
  - Network error detection (ECONNREFUSED)
  - Status code passthrough (v1.1 optimizasyonu)

- **Zod Schema:** [src/lib/schemas/auth.ts](src/lib/schemas/auth.ts)
  - Validation rules
  - Custom error messages
  - Type inference

### Neden authAPI.register() try-catch blokları gereklidir?

`src/lib/api/auth.ts` dosyasındaki try-catch blokları **kritik** ve **kaldırılmamalıdır**:

1. **Browser-level network errors**: Next.js API route'una bile ulaşılamadığında (`Failed to fetch`)
2. **isNetworkError flag**: UI'da farklı mesaj göstermek için gerekli
3. **JSON parse errors**: Route.ts'den gelen malformed JSON'u yakalar
4. **Field error preservation**: `Object.assign(error, data)` Django'nun field errorlarını korur

Bu pattern zaten "Adım 3: API Client Fonksiyonu" bölümünde dokümante edilmiştir.

---

## Changelog

### Version 1.1 (2025-11-02)

- ✅ Route.ts'de gereksiz `if (!response.ok)` kontrolü kaldırıldı
- ✅ Django status code'ları artık olduğu gibi passthrough ediliyor
- ✅ Daha temiz ve minimal error handling
- ✅ Minimum Viable Pattern güncellendi
- ✅ Network error handling iyileştirildi

### Version 1.0 (2025-11-02)

- 🎉 İlk versiyon yayınlandı
- ✅ 4 katmanlı workflow pattern
- ✅ Zod + React Hook Form integration
- ✅ Comprehensive error handling
- ✅ Shadcn UI Alert kullanımı

---

**Son Güncelleme:** 2025-11-02
**Versiyon:** 1.1

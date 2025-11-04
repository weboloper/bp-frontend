"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileUpdateSchema,
  type ProfileUpdateFormData,
} from "@/lib/schemas/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Pencil, Upload, X } from "lucide-react";
import { format } from "date-fns";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      first_name: user?.profile?.first_name || "",
      last_name: user?.profile?.last_name || "",
      birth_date: user?.profile?.birth_date || "",
      bio: user?.profile?.bio || "",
    },
  });

  const avatarFiles = watch("avatar");

  // Preview avatar when file is selected
  useEffect(() => {
    if (avatarFiles && avatarFiles.length > 0) {
      const file = avatarFiles[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [avatarFiles]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

  const getUserInitials = () => {
    if (!user?.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  const fullName =
    user.profile?.first_name && user.profile?.last_name
      ? `${user.profile.first_name} ${user.profile.last_name}`
      : "Not set";

  const onSubmit = async (data: ProfileUpdateFormData) => {
    try {
      setServerError("");
      setSuccessMessage("");

      await updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        birth_date: data.birth_date,
        bio: data.bio,
        avatar: data.avatar && data.avatar.length > 0 ? data.avatar[0] : null,
      });

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      setAvatarPreview(null);
    } catch (error: any) {
      console.error("Profile update error:", error);

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
      if (error.avatar) {
        setError("avatar", {
          type: "server",
          message: Array.isArray(error.avatar) ? error.avatar[0] : error.avatar,
        });
      }
      if (error.first_name) {
        setError("first_name", {
          type: "server",
          message: Array.isArray(error.first_name)
            ? error.first_name[0]
            : error.first_name,
        });
      }
      if (error.last_name) {
        setError("last_name", {
          type: "server",
          message: Array.isArray(error.last_name)
            ? error.last_name[0]
            : error.last_name,
        });
      }
      if (error.birth_date) {
        setError("birth_date", {
          type: "server",
          message: Array.isArray(error.birth_date)
            ? error.birth_date[0]
            : error.birth_date,
        });
      }
      if (error.bio) {
        setError("bio", {
          type: "server",
          message: Array.isArray(error.bio) ? error.bio[0] : error.bio,
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
        !error.first_name &&
        !error.last_name &&
        !error.birth_date &&
        !error.bio
      ) {
        setServerError(error.message);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setServerError("");
    setSuccessMessage("");
    setAvatarPreview(null);
    reset({
      first_name: user?.profile?.first_name || "",
      last_name: user?.profile?.last_name || "",
      birth_date: user?.profile?.birth_date || "",
      bio: user?.profile?.bio || "",
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Free</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {successMessage && (
        <Alert
          variant="default"
          className="border-green-500 bg-green-50 text-green-900"
        >
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="size-24">
                <AvatarImage
                  src={avatarPreview || user.profile?.avatar || undefined}
                  alt={user.username}
                />
                <AvatarFallback className="text-2xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              {isEditing && avatarPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarPreview(null);
                    reset({ ...watch(), avatar: undefined });
                  }}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive text-white p-1 hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-semibold">{fullName}</h3>
                <div className="flex gap-2">
                  {user.is_active && <Badge variant="success">Active</Badge>}
                  {user.is_verified && (
                    <Badge variant="secondary">Verified</Badge>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground">@{user.username}</p>
              <div className="pt-2 flex items-center gap-2">
                <Label
                  htmlFor="avatar-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-accent"
                >
                  <Upload className="h-4 w-4" />
                  {avatarPreview ? "Change" : "Upload Avatar"}
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  {...register("avatar")}
                />
                {avatarPreview && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={async () => {
                      try {
                        setServerError("");
                        setSuccessMessage("");
                        const file =
                          avatarFiles && avatarFiles.length > 0
                            ? avatarFiles[0]
                            : null;
                        if (!file) return;

                        await updateProfile({
                          first_name: user.profile?.first_name || "",
                          last_name: user.profile?.last_name || "",
                          birth_date: user.profile?.birth_date || "",
                          bio: user.profile?.bio || "",
                          avatar: file,
                        });

                        setSuccessMessage("Avatar updated successfully!");
                        setAvatarPreview(null);
                      } catch (error: any) {
                        console.error("Avatar upload error:", error);
                        if (error.avatar) {
                          setServerError(
                            Array.isArray(error.avatar)
                              ? error.avatar[0]
                              : error.avatar
                          );
                        } else if (error.detail) {
                          setServerError(error.detail);
                        } else {
                          setServerError(
                            error.message || "Failed to upload avatar"
                          );
                        }
                      }
                    }}
                  >
                    Save Avatar
                  </Button>
                )}
              </div>
              {errors.avatar && (
                <p className="text-sm text-destructive mt-1">
                  {errors.avatar.message as string}
                </p>
              )}
              {serverError && avatarPreview && (
                <p className="text-sm text-destructive mt-1">{serverError}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input value={user.username} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email} disabled />
                  </div>

                  <Field data-invalid={!!errors.first_name}>
                    <FieldLabel htmlFor="first_name">First Name</FieldLabel>
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="Enter first name"
                      aria-invalid={!!errors.first_name}
                      {...register("first_name")}
                    />
                    {errors.first_name && (
                      <FieldError>{errors.first_name.message}</FieldError>
                    )}
                  </Field>

                  <Field data-invalid={!!errors.last_name}>
                    <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                    <Input
                      id="last_name"
                      type="text"
                      placeholder="Enter last name"
                      aria-invalid={!!errors.last_name}
                      {...register("last_name")}
                    />
                    {errors.last_name && (
                      <FieldError>{errors.last_name.message}</FieldError>
                    )}
                  </Field>

                  <Field data-invalid={!!errors.birth_date}>
                    <FieldLabel htmlFor="birth_date">Birth Date</FieldLabel>
                    <Input
                      id="birth_date"
                      type="date"
                      aria-invalid={!!errors.birth_date}
                      {...register("birth_date")}
                    />
                    {errors.birth_date && (
                      <FieldError>{errors.birth_date.message}</FieldError>
                    )}
                  </Field>

                  <div className="space-y-2">
                    <Label>Account Status</Label>
                    <div className="flex gap-2">
                      <Badge
                        variant={user.is_active ? "success" : "destructive"}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge
                        variant={user.is_verified ? "secondary" : "outline"}
                      >
                        {user.is_verified ? "Verified" : "Not Verified"}
                      </Badge>
                      <Badge
                        variant={user.has_password ? "secondary" : "outline"}
                      >
                        {user.has_password ? "Password Set" : "No Password"}
                      </Badge>
                    </div>
                  </div>

                  <Field data-invalid={!!errors.bio} className="md:col-span-2">
                    <FieldLabel htmlFor="bio">Bio</FieldLabel>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself"
                      aria-invalid={!!errors.bio}
                      rows={3}
                      {...register("bio")}
                    />
                    {errors.bio && (
                      <FieldError>{errors.bio.message}</FieldError>
                    )}
                  </Field>
                </div>

                {serverError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error!</AlertTitle>
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </FieldGroup>
            </form>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={user.username} disabled />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email} disabled />
              </div>

              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={user.profile?.first_name || ""}
                  disabled
                  placeholder="Not set"
                />
              </div>

              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={user.profile?.last_name || ""}
                  disabled
                  placeholder="Not set"
                />
              </div>

              <div className="space-y-2">
                <Label>Birth Date</Label>
                <Input
                  value={user.profile?.birth_date || ""}
                  disabled
                  placeholder="Not set"
                />
              </div>

              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex gap-2">
                  <Badge variant={user.is_active ? "success" : "destructive"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant={user.is_verified ? "secondary" : "outline"}>
                    {user.is_verified ? "Verified" : "Not Verified"}
                  </Badge>
                  <Badge variant={user.has_password ? "secondary" : "outline"}>
                    {user.has_password ? "Password Set" : "No Password"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Bio</Label>
                <Textarea
                  value={user.profile?.bio || ""}
                  disabled
                  placeholder="No bio"
                  rows={3}
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Account Details */}
          <div className="space-y-3">
            <h4 className="font-semibold">Account Details</h4>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date Joined:</span>
                <span className="font-medium">
                  {format(new Date(user.date_joined), "PPP")}
                </span>
              </div>
              {user.last_login && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Login:</span>
                  <span className="font-medium">
                    {format(new Date(user.last_login), "PPP p")}
                  </span>
                </div>
              )}
              {user.profile?.updated_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Profile Updated:
                  </span>
                  <span className="font-medium">
                    {format(new Date(user.profile.updated_at), "PPP p")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

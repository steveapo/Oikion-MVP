"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmailPreauthModal } from "@/components/auth/email-preauth-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/shared/icons";
import { updateUserProfile, ProfileFormData } from "@/actions/update-user-name";
import { updateUsername } from "@/actions/update-username";
import { checkUsernameAvailability } from "@/actions/check-username-availability";
import { useDebounce } from "@/hooks/use-debounce";
import imageCompression from "browser-image-compression";

interface User {
  id: string;
  email?: string | null;
  image?: string | null;
  username?: string | null;
  usernameLastChangedAt?: Date | null;
  usernameChangeCount?: number | null;
  onboardingCompletedAt?: Date | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  company?: string | null;
  description?: string | null;
}

interface UserProfileFormProps {
  user: User;
}

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers")
    .optional(),
  email: z.string().email("Enter a valid email"),
  image: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^data:image\//.test(val) ||
        /^https?:\/\//.test(val),
      {
        message: "Provide a valid image file",
      }
    ),
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  phone: z.string().optional(),
  company: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof profileSchema>;

export function UserProfileForm({ user }: UserProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [currentUser, setCurrentUser] = useState(user);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "locked"
  >("idle");
  const [canChangeUsernameAt, setCanChangeUsernameAt] = useState<Date | null>(null);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    clearErrors,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: currentUser.username || "",
      email: currentUser.email || "",
      image: currentUser.image || "",
      firstName: currentUser.firstName || "",
      lastName: currentUser.lastName || "",
      phone: currentUser.phone || "",
      company: currentUser.company || "",
      description: currentUser.description || "",
    },
  });

  // Update form when currentUser changes
  useEffect(() => {
    reset({
      username: currentUser.username || "",
      email: currentUser.email || "",
      image: currentUser.image || "",
      firstName: currentUser.firstName || "",
      lastName: currentUser.lastName || "",
      phone: currentUser.phone || "",
      company: currentUser.company || "",
      description: currentUser.description || "",
    });
  }, [currentUser, reset]);

  const username = watch("username");
  const emailValue = watch("email") || "";
  const debouncedUsername = useDebounce(username, 800); // Increased delay
  const [lastCheckedUsername, setLastCheckedUsername] = useState<string>("");

  // Check if username can be changed (3-month restriction)
  useEffect(() => {
    const isIncompleteProfile = !currentUser.onboardingCompletedAt;
    const changeCount = currentUser.usernameChangeCount || 0;
    const hasUsedBothChanges = changeCount >= 2;

    if (currentUser.usernameLastChangedAt) {
      const lastChanged = new Date(currentUser.usernameLastChangedAt);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      // For incomplete profiles: Lock after 2 changes AND within 3 months
      // For complete profiles: Lock after any change within 3 months
      const shouldLock = lastChanged > threeMonthsAgo &&
                        (isIncompleteProfile ? hasUsedBothChanges : true);

      if (shouldLock) {
        const canChangeAt = new Date(lastChanged);
        canChangeAt.setMonth(canChangeAt.getMonth() + 3);
        setCanChangeUsernameAt(canChangeAt);
        setUsernameStatus("locked");
      }
    }
  }, [currentUser.usernameLastChangedAt, currentUser.usernameChangeCount, currentUser.onboardingCompletedAt]);

  // Real-time username availability checking - only check once per unique username
  useEffect(() => {
    // Don't check if empty, same as original, locked, or already checked this exact username
    if (!debouncedUsername ||
        debouncedUsername === currentUser.username ||
        debouncedUsername === lastCheckedUsername ||
        usernameStatus === "locked") {
      if (debouncedUsername === currentUser.username) {
        setUsernameStatus("idle");
      }
      return;
    }

    // Validate length before making request
    if (debouncedUsername.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    // Only check if we haven't checked this exact username before
    setUsernameStatus("checking");
    setLastCheckedUsername(debouncedUsername);

    checkUsernameAvailability(debouncedUsername).then((result) => {
      if (result.available) {
        setUsernameStatus("available");
      } else {
        setUsernameStatus("taken");
      }
    });
  }, [debouncedUsername, currentUser.username, lastCheckedUsername, usernameStatus]);

  // Track whether the email has changed and require verification
  useEffect(() => {
    const normalizedCurrent = (currentUser.email || "").toLowerCase();
    const normalizedNew = (emailValue || "").toLowerCase();
    if (normalizedNew === normalizedCurrent) {
      setEmailVerified(true);
    } else {
      setEmailVerified(false);
    }
  }, [emailValue, currentUser.email]);

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      let usernameUpdated = false;
      const normalizedCurrentEmail = (currentUser.email || "").toLowerCase();
      const normalizedNewEmail = (data.email || "").toLowerCase();

      // If email changed but not verified, block save
      if (normalizedNewEmail !== normalizedCurrentEmail && !emailVerified) {
        toast.error("Please verify your new email before saving");
        return;
      }

      // Handle username update separately (has 3-month restriction)
      if (data.username && data.username !== currentUser.username) {
        const usernameResult = await updateUsername(currentUser.id, data.username);

        if (!usernameResult.success) {
          toast.error("Username update failed", {
            description: usernameResult.error,
          });
          return;
        }
        usernameUpdated = true;
      }

      // Update other profile fields
      const { username: _, ...profileData } = data;
      const result = await updateUserProfile(currentUser.id, profileData as ProfileFormData);

      if (result.status !== "success") {
        toast.error("Something went wrong.", {
          description: "Your profile was not updated. Please try again.",
        });
      } else {
        // Update the currentUser state with the new data
        setCurrentUser(prev => ({
          ...prev,
          ...profileData,
          username: usernameUpdated ? data.username : prev.username,
          usernameChangeCount: usernameUpdated ? (prev.usernameChangeCount || 0) + 1 : prev.usernameChangeCount,
          usernameLastChangedAt: usernameUpdated ? new Date() : prev.usernameLastChangedAt,
        }));

        // Reset form with the new values to keep them displayed
        reset(data);

        if (usernameUpdated) {
          toast.success("Profile and username updated successfully!", {
            description: "You can change your username again in 3 months.",
          });
          // Refresh the page to update the username lock status and banner
          window.location.reload();
        } else {
          toast.success("Profile updated successfully!");
          // If onboarding was incomplete, mark it as complete in session to hide banner next render
          try {
            const res = await fetch('/api/user/mark-onboarded', { method: 'POST' });
            if (!res.ok) {
              // fallback: soft refresh to update session/banner state
              window.location.reload();
            }
          } catch {
            window.location.reload();
          }
        }
      }
    });
  };

  const descriptionLength = watch("description")?.length || 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Username Field (Editable with 3-month restriction) */}
      <div className="space-y-2">
        <Label htmlFor="username">
          Username <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            @
          </span>
          <Input
            id="username"
            placeholder="johndoe"
            className="pl-7"
            {...register("username")}
            disabled={isPending || usernameStatus === "locked"}
            aria-invalid={!!errors.username}
            aria-describedby="username-error username-status username-help"
          />
          {usernameStatus === "checking" && (
            <Icons.spinner className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
          {usernameStatus === "available" && username !== user.username && (
            <Icons.check className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-green-600" />
          )}
          {usernameStatus === "taken" && (
            <Icons.close className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-destructive" />
          )}
          {usernameStatus === "locked" && (
            <Icons.lock className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          )}
        </div>
        {errors.username && (
          <p id="username-error" className="text-sm text-destructive">
            {errors.username.message}
          </p>
        )}
        {usernameStatus === "available" && username !== user.username && (
          <p id="username-status" className="text-sm text-green-600">
            This username is available
          </p>
        )}
        {usernameStatus === "taken" && (
          <p id="username-status" className="text-sm text-destructive">
            This username is already taken
          </p>
        )}
        {usernameStatus === "locked" && canChangeUsernameAt && (
          <p id="username-help" className="text-sm text-amber-600">
            You can change your username again on {canChangeUsernameAt.toLocaleDateString()}
          </p>
        )}
        {usernameStatus !== "locked" && (() => {
          const isIncompleteProfile = !currentUser.onboardingCompletedAt;
          const changeCount = currentUser.usernameChangeCount || 0;
          const remainingChanges = isIncompleteProfile ? Math.max(0, 2 - changeCount) : 0;

          if (isIncompleteProfile && remainingChanges > 0) {
            return (
              <p id="username-help" className="text-xs text-blue-600">
                You have {remainingChanges} change{remainingChanges !== 1 ? 's' : ''} remaining. After that, you can change your username once every 3 months.
              </p>
            );
          }

          return (
            <p id="username-help" className="text-xs text-muted-foreground">
              You can change your username once every 3 months
            </p>
          );
        })()}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register("email")}
            disabled={isPending}
            aria-invalid={!!errors.email}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowVerifyEmail(true)}
            disabled={!emailValue || (emailValue.toLowerCase() === (currentUser.email || "").toLowerCase())}
          >
            Verify email
          </Button>
        </div>
        {!emailVerified && emailValue && emailValue.toLowerCase() !== (currentUser.email || "").toLowerCase() && (
          <p className="text-xs text-amber-600">You must verify the new email before saving.</p>
        )}
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}

        <Dialog
          open={showVerifyEmail}
          onOpenChange={(open) => {
            setShowVerifyEmail(open);
            if (!open) {
              const el = document.getElementById('email') as HTMLInputElement | null;
              el?.focus();
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify your new email</DialogTitle>
              <DialogDescription>We sent a 6-digit code to {emailValue}. Enter it below to continue.</DialogDescription>
            </DialogHeader>
            {emailValue && (
              <EmailPreauthModal
                email={emailValue}
                onVerified={() => {
                  setEmailVerified(true);
                  setShowVerifyEmail(false);
                  const el = document.getElementById('email') as HTMLInputElement | null;
                  el?.focus();
                }}
              />
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowVerifyEmail(false)}>
                Cancel email verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Avatar Upload */}
      <div className="space-y-2">
        <Label htmlFor="avatar">Profile Picture <span className="text-muted-foreground text-xs">(Optional)</span></Label>
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          disabled={isPending}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const options = {
                maxSizeMB: 0.3,
                maxWidthOrHeight: 512,
                useWebWorker: true,
                fileType: "image/avif",
                initialQuality: 0.85,
              } as const;
              const compressed = await imageCompression(file, options);
              const reader = new FileReader();
              reader.onloadend = () => {
                const dataUrl = reader.result as string;
                // Store as data URL (can be swapped for Cloud storage URL later)
                setValue("image", dataUrl, { shouldDirty: true, shouldValidate: true });
                clearErrors("image");
              };
              reader.readAsDataURL(compressed);
            } catch (err) {
              console.error("Avatar compression failed", err);
            }
          }}
        />
        {errors.image && (
          <p className="text-sm text-destructive">{errors.image.message}</p>
        )}
      </div>

      {/* First Name */}
      <div className="space-y-2">
        <Label htmlFor="firstName">
          First Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="firstName"
          {...register("firstName")}
          disabled={isPending}
          aria-invalid={!!errors.firstName}
        />
        {errors.firstName && (
          <p className="text-sm text-destructive">{errors.firstName.message}</p>
        )}
      </div>

      {/* Last Name */}
      <div className="space-y-2">
        <Label htmlFor="lastName">
          Last Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="lastName"
          {...register("lastName")}
          disabled={isPending}
          aria-invalid={!!errors.lastName}
        />
        {errors.lastName && (
          <p className="text-sm text-destructive">{errors.lastName.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone Number <span className="text-muted-foreground text-xs">(Optional)</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          {...register("phone")}
          disabled={isPending}
          aria-invalid={!!errors.phone}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Company */}
      <div className="space-y-2">
        <Label htmlFor="company">
          Company <span className="text-muted-foreground text-xs">(Optional)</span>
        </Label>
        <Input
          id="company"
          placeholder="Acme Inc."
          {...register("company")}
          disabled={isPending}
          aria-invalid={!!errors.company}
        />
        {errors.company && (
          <p className="text-sm text-destructive">{errors.company.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          About You <span className="text-muted-foreground text-xs">(Optional)</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Tell us a bit about yourself..."
          className="min-h-[100px] resize-none"
          {...register("description")}
          disabled={isPending}
          aria-invalid={!!errors.description}
          maxLength={500}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
        <p className="text-xs text-muted-foreground text-right">
          {descriptionLength} / 500
        </p>
      </div>

      <Button 
        type="submit" 
        disabled={isPending || (!isDirty && usernameStatus !== "available") || ((emailValue.toLowerCase() !== (currentUser.email || "").toLowerCase()) && !emailVerified)}
      >
        {isPending ? (
          <>
            <Icons.spinner className="mr-2 size-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Icons.check className="mr-2 size-4" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  );
}


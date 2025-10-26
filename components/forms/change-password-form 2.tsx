"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { changePasswordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/shared/icons";
import { changePassword } from "@/actions/change-password";

type FormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [show, setShow] = useState<{ current: boolean; next: boolean; confirm: boolean }>({ current: false, next: false, confirm: false });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const res = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      if (!res.success) {
        toast.error(res.error || "Failed to change password");
        return;
      }
      toast.success(hasPassword ? "Password updated" : "Password set successfully");
      reset({ currentPassword: "", newPassword: "", confirmNewPassword: "", hasPassword: true });
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {hasPassword && (
      <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
        <div className="relative">
            <Input id="currentPassword" type={show.current ? "text" : "password"} disabled={isPending} {...register("currentPassword")} />
        </div>
        {errors.currentPassword && (
          <p className="text-sm text-destructive">{errors.currentPassword.message as string}</p>
        )}
      </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="newPassword">{hasPassword ? "New Password" : "Set Password"}</Label>
        <Input id="newPassword" type={show.next ? "text" : "password"} disabled={isPending} {...register("newPassword")} />
        {errors.newPassword && (
          <p className="text-sm text-destructive">{errors.newPassword.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmNewPassword">{hasPassword ? "Confirm New Password" : "Confirm Password"}</Label>
        <Input id="confirmNewPassword" type={show.confirm ? "text" : "password"} disabled={isPending} {...register("confirmNewPassword")} />
        {errors.confirmNewPassword && (
          <p className="text-sm text-destructive">{errors.confirmNewPassword.message as string}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Icons.spinner className="mr-2 size-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>Save Password</>
        )}
      </Button>
    </form>
  );
}



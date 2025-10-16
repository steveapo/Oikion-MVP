"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMemberRole } from "@/actions/members";
import { canAssignRole } from "@/lib/roles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Icons } from "@/components/shared/icons";

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
}

interface UpdateMemberRoleDialogProps {
  member: Member;
  currentUserRole: UserRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  role: z.nativeEnum(UserRole),
});

type FormValues = z.infer<typeof formSchema>;

const roleLabels: Record<UserRole, { label: string; description: string }> = {
  ORG_OWNER: {
    label: "Owner",
    description: "Full access to everything, including billing",
  },
  ADMIN: {
    label: "Admin",
    description: "Manage members and all organization content",
  },
  AGENT: {
    label: "Agent",
    description: "Create and edit properties and clients",
  },
  VIEWER: {
    label: "Viewer",
    description: "Read-only access to organization data",
  },
};

export function UpdateMemberRoleDialog({
  member,
  currentUserRole,
  open,
  onOpenChange,
}: UpdateMemberRoleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: member.role,
    },
  });

  async function onSubmit(data: FormValues) {
    if (data.role === member.role) {
      toast.info("Role unchanged");
      onOpenChange(false);
      return;
    }

    setIsLoading(true);

    const result = await updateMemberRole(member.id, data.role);

    setIsLoading(false);

    if (result.success) {
      toast.success("Member role updated");
      onOpenChange(false);
      // Trigger a revalidation
      window.location.reload();
    } else {
      toast.error(result.error || "Failed to update role");
    }
  }

  // Get roles that the current user can assign
  const availableRoles = Object.values(UserRole).filter((role) =>
    canAssignRole(currentUserRole, role)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Member Role</DialogTitle>
          <DialogDescription>
            Update the role for {member.name || member.email}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">
                              {roleLabels[role].label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {roleLabels[role].description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {roleLabels[field.value]?.description}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Update Role
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

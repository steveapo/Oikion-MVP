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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateMemberRole, transferOwnership } from "@/actions/members";
import { getAssignableRolesByUser } from "@/lib/roles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Icons } from "@/components/shared/icons";
import { AlertTriangle, Crown } from "lucide-react";

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
}

interface UpdateMemberRoleDialogProps {
  member: Member;
  currentUserRole: UserRole;
  currentUserId: string; // Added to check if trying to change own role
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
  currentUserId,
  open,
  onOpenChange,
}: UpdateMemberRoleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);

  // Check if this is the user's own profile
  const isSelf = member.id === currentUserId;

  // Check if trying to change to ORG_OWNER (requires transfer ownership)
  const isTransferOwnership = !isSelf && currentUserRole === UserRole.ORG_OWNER;

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

    // Handle transfer ownership
    if (data.role === UserRole.ORG_OWNER) {
      if (!showTransferConfirm) {
        setShowTransferConfirm(true);
        return;
      }

      setIsLoading(true);
      const result = await transferOwnership(member.id);
      setIsLoading(false);

      if (result.success) {
        toast.success("Ownership transferred successfully");
        onOpenChange(false);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to transfer ownership");
        setShowTransferConfirm(false);
      }
      return;
    }

    // Regular role change
    setIsLoading(true);
    const result = await updateMemberRole(member.id, data.role);
    setIsLoading(false);

    if (result.success) {
      toast.success("Member role updated");
      onOpenChange(false);
      window.location.reload();
    } else {
      toast.error(result.error || "Failed to update role");
    }
  }

  // Get roles that the current user can assign
  const availableRoles = getAssignableRolesByUser(currentUserRole).filter(role => {
    // Filter out current member's role from dropdown to show it's already assigned
    // ADMINs cannot assign ORG_OWNER or ADMIN roles
    if (currentUserRole === UserRole.ADMIN) {
      return role === UserRole.AGENT || role === UserRole.VIEWER;
    }
    return true;
  });

  // Users cannot change their own role
  if (isSelf) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Your Role</DialogTitle>
            <DialogDescription>
              You cannot change your own role.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {currentUserRole === UserRole.ORG_OWNER
                ? "As an owner, you can transfer ownership to another member if needed."
                : "Contact an organization owner or administrator to change your role."}
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Member Role</DialogTitle>
          <DialogDescription>
            Update the role for {member.name || member.email}
          </DialogDescription>
        </DialogHeader>

        {showTransferConfirm && (
          <Alert className="border-orange-500">
            <Crown className="h-4 w-4 text-orange-500" />
            <AlertDescription className="space-y-2">
              <p className="font-semibold">Transfer Ownership</p>
              <p className="text-sm">
                You are about to transfer organization ownership to{" "}
                <strong>{member.name || member.email}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                • You will become an Administrator
                <br />
                • The new owner will have full control
                <br />• This action cannot be undone
              </p>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setShowTransferConfirm(false);
                    }}
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
                              {role === UserRole.ORG_OWNER && currentUserRole === UserRole.ORG_OWNER && (
                                <span className="ml-2 text-xs text-orange-500">(Transfer)</span>
                              )}
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
                onClick={() => {
                  setShowTransferConfirm(false);
                  onOpenChange(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                {showTransferConfirm ? "Confirm Transfer" : "Update Role"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

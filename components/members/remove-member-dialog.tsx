"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { removeMember } from "@/actions/members";
import { Icons } from "@/components/shared/icons";

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
}

interface RemoveMemberDialogProps {
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RemoveMemberDialog({
  member,
  open,
  onOpenChange,
}: RemoveMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleRemove() {
    setIsLoading(true);

    const result = await removeMember(member.id);

    setIsLoading(false);

    if (result.success) {
      toast.success("Member removed from organization");
      onOpenChange(false);
      // Trigger a revalidation
      window.location.reload();
    } else {
      toast.error(result.error || "Failed to remove member");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {member.name || member.email} from your organization?
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This action will remove the member from your organization. They will lose access to all organization data.
            They can be re-invited later if needed.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemove}
            disabled={isLoading}
          >
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Remove Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

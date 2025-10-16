"use client";

import { UserRole } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle } from "lucide-react";
import { getRoleDisplayName } from "@/lib/roles";

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
}

interface RemoveMemberModalProps {
  member: Member | null;
  onClose: () => void;
  onConfirm: (member: Member) => void;
  isLoading: boolean;
}

export function RemoveMemberModal({
  member,
  onClose,
  onConfirm,
  isLoading,
}: RemoveMemberModalProps) {
  if (!member) return null;

  return (
    <AlertDialog open={!!member} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Remove Member
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {member.name || member.email}
              </span>{" "}
              from the organization?
            </p>
            <p>
              They will immediately lose access to all organization data. Any content
              they created will remain in the system but will be attributed to their
              user account.
            </p>
            <p className="text-xs">
              Current role: <span className="font-medium">{getRoleDisplayName(member.role)}</span>
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(member)}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove Member"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

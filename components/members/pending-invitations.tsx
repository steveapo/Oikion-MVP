"use client";

import { useState } from "react";
import { UserRole, InvitationStatus } from "@prisma/client";
import { toast } from "sonner";
import { Clock, Mail, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cancelInvite, resendInvite } from "@/actions/invitations";
import { Icons } from "@/components/shared/icons";

interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  inviter: { name: string | null; email: string | null };
}

interface PendingInvitationsProps {
  invitations: Invitation[];
}

const roleLabels: Record<UserRole, string> = {
  ORG_OWNER: "Owner",
  ADMIN: "Admin",
  AGENT: "Agent",
  VIEWER: "Viewer",
};

export function PendingInvitations({ invitations }: PendingInvitationsProps) {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const handleCancel = async (invitationId: string) => {
    setLoadingIds(prev => new Set(prev).add(invitationId));

    const result = await cancelInvite(invitationId);

    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(invitationId);
      return next;
    });

    if (result.success) {
      toast.success("Invitation cancelled");
      // Trigger a revalidation
      window.location.reload();
    } else {
      toast.error(result.error || "Failed to cancel invitation");
    }
  };

  const handleResend = async (invitationId: string) => {
    setLoadingIds(prev => new Set(prev).add(invitationId));

    const result = await resendInvite(invitationId);

    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(invitationId);
      return next;
    });

    if (result.success) {
      toast.success("Invitation resent");
    } else {
      toast.error(result.error || "Failed to resend invitation");
    }
  };

  const getTimeLeft = (expiresAt: Date) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Expires today";
    if (diffDays === 1) return "Expires tomorrow";
    return `${diffDays} days left`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>
          Invitations waiting to be accepted
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Invited By</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => {
              const isLoading = loadingIds.has(invitation.id);
              const timeLeft = getTimeLeft(invitation.expiresAt);
              const isExpiringSoon = timeLeft.includes("today") || timeLeft.includes("tomorrow");

              return (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{invitation.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{roleLabels[invitation.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {invitation.inviter.name || invitation.inviter.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={`text-sm ${
                          isExpiringSoon ? "text-amber-600 font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {timeLeft}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isLoading}>
                          {isLoading ? (
                            <Icons.spinner className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleResend(invitation.id)}>
                          Resend invitation
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCancel(invitation.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          Cancel invitation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {invitations.length === 0 && (
          <div className="flex min-h-[150px] items-center justify-center text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">No pending invitations</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

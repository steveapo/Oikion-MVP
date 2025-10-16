"use client";

import { useState } from "react";
import { InvitationStatus } from "@prisma/client";
import { cancelInvitation, resendInvitation } from "@/actions/invitations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Clock, Mail, X, Loader2, MailCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getRoleDisplayName } from "@/lib/roles";

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  inviter: {
    name: string | null;
    email: string | null;
  };
}

interface InvitationsListProps {
  invitations: Invitation[];
  onUpdate?: () => void;
}

export function InvitationsList({ invitations, onUpdate }: InvitationsListProps) {
  const [loadingInviteId, setLoadingInviteId] = useState<string | null>(null);
  const [action, setAction] = useState<"cancel" | "resend" | null>(null);

  const handleCancel = async (invitationId: string) => {
    setLoadingInviteId(invitationId);
    setAction("cancel");
    
    try {
      const result = await cancelInvitation(invitationId);
      
      if (result.success) {
        toast.success("Invitation canceled");
        onUpdate?.();
      } else {
        toast.error(result.error || "Failed to cancel invitation");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Failed to cancel invitation:", error);
    } finally {
      setLoadingInviteId(null);
      setAction(null);
    }
  };

  const handleResend = async (invitationId: string) => {
    setLoadingInviteId(invitationId);
    setAction("resend");
    
    try {
      const result = await resendInvitation(invitationId);
      
      if (result.success) {
        toast.success("Invitation resent");
      } else {
        toast.error(result.error || "Failed to resend invitation");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Failed to resend invitation:", error);
    } finally {
      setLoadingInviteId(null);
      setAction(null);
    }
  };

  const getStatusBadge = (status: InvitationStatus, expiresAt: Date) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (isExpired && status === InvitationStatus.PENDING) {
      return <Badge variant="secondary">Expired</Badge>;
    }
    
    switch (status) {
      case InvitationStatus.PENDING:
        return <Badge variant="outline">Pending</Badge>;
      case InvitationStatus.ACCEPTED:
        return <Badge variant="default">Accepted</Badge>;
      case InvitationStatus.CANCELED:
        return <Badge variant="destructive">Canceled</Badge>;
      case InvitationStatus.EXPIRED:
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingInvitations = invitations.filter(inv => inv.status === InvitationStatus.PENDING);
  const otherInvitations = invitations.filter(inv => inv.status !== InvitationStatus.PENDING);

  if (invitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending Invitations
          </CardTitle>
          <CardDescription>
            No pending invitations at this time
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Invitations
        </CardTitle>
        <CardDescription>
          Manage pending and past invitations to your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingInvitations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Pending Invitations</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvitations.map((invitation) => {
                    const isExpired = new Date(invitation.expiresAt) < new Date();
                    const isLoading = loadingInviteId === invitation.id;
                    
                    return (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">{invitation.email}</TableCell>
                        <TableCell>{getRoleDisplayName(invitation.role as any)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {invitation.inviter.name || invitation.inviter.email}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className={isExpired ? "text-destructive" : "text-muted-foreground"}>
                              {formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(invitation.status, invitation.expiresAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!isExpired && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResend(invitation.id)}
                                disabled={isLoading}
                              >
                                {isLoading && action === "resend" ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <MailCheck className="h-4 w-4 mr-1" />
                                    Resend
                                  </>
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancel(invitation.id)}
                              disabled={isLoading}
                            >
                              {isLoading && action === "cancel" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {otherInvitations.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Past Invitations</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>{getRoleDisplayName(invitation.role as any)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {invitation.inviter.name || invitation.inviter.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>{getStatusBadge(invitation.status, invitation.expiresAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

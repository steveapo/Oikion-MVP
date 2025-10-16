"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { updateUserRole, removeUser } from "@/actions/members";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Users, Loader2, Trash2, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getRoleDisplayName, canAssignRole } from "@/lib/roles";
import { RemoveMemberModal } from "./remove-member-modal";

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: Date;
  image: string | null;
}

interface MembersListProps {
  members: Member[];
  currentUserId: string;
  currentUserRole: UserRole;
  onUpdate?: () => void;
}

export function MembersList({ members, currentUserId, currentUserRole, onUpdate }: MembersListProps) {
  const [loadingMemberId, setLoadingMemberId] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    if (memberId === currentUserId) {
      toast.error("You cannot change your own role");
      return;
    }

    if (!canAssignRole(currentUserRole, newRole)) {
      toast.error("You don't have permission to assign this role");
      return;
    }

    setLoadingMemberId(memberId);
    
    try {
      const result = await updateUserRole({
        targetUserId: memberId,
        newRole,
      });
      
      if (result.success) {
        toast.success("Member role updated");
        onUpdate?.();
      } else {
        toast.error(result.error || "Failed to update role");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Failed to update role:", error);
    } finally {
      setLoadingMemberId(null);
    }
  };

  const handleRemove = async (member: Member) => {
    setLoadingMemberId(member.id);
    
    try {
      const result = await removeUser(member.id);
      
      if (result.success) {
        toast.success("Member removed from organization");
        setMemberToRemove(null);
        onUpdate?.();
      } else {
        toast.error(result.error || "Failed to remove member");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Failed to remove member:", error);
    } finally {
      setLoadingMemberId(null);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ORG_OWNER:
        return "default";
      case UserRole.ADMIN:
        return "secondary";
      case UserRole.AGENT:
        return "outline";
      case UserRole.VIEWER:
        return "outline";
      default:
        return "outline";
    }
  };

  const getAssignableRoles = (): UserRole[] => {
    const roleHierarchy = {
      [UserRole.ORG_OWNER]: 4,
      [UserRole.ADMIN]: 3,
      [UserRole.AGENT]: 2,
      [UserRole.VIEWER]: 1,
    };

    const currentLevel = roleHierarchy[currentUserRole];
    
    return Object.entries(roleHierarchy)
      .filter(([, level]) => level <= currentLevel)
      .map(([r]) => r as UserRole)
      .sort((a, b) => roleHierarchy[b] - roleHierarchy[a]);
  };

  const assignableRoles = getAssignableRoles();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Organization Members
          </CardTitle>
          <CardDescription>
            Manage member roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const isCurrentUser = member.id === currentUserId;
                  const isLoading = loadingMemberId === member.id;
                  
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name || ""}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {(member.name || member.email || "?").charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {member.name || "Unknown"}
                              {isCurrentUser && (
                                <span className="text-xs text-muted-foreground ml-2">(You)</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.email}
                      </TableCell>
                      <TableCell>
                        {isCurrentUser ? (
                          <Badge variant={getRoleBadgeVariant(member.role)}>
                            <Shield className="h-3 w-3 mr-1" />
                            {getRoleDisplayName(member.role)}
                          </Badge>
                        ) : (
                          <Select
                            value={member.role}
                            onValueChange={(value) => handleRoleChange(member.id, value as UserRole)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {assignableRoles.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {getRoleDisplayName(role)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(member.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isCurrentUser && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMemberToRemove(member)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RemoveMemberModal
        member={memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemove}
        isLoading={loadingMemberId === memberToRemove?.id}
      />
    </>
  );
}

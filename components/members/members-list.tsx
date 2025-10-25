"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
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
  DropdownMenuSeparator,
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
import { UserAvatar } from "@/components/shared/user-avatar";
import { UpdateMemberRoleDialog } from "./update-member-role-dialog";
import { RemoveMemberDialog } from "./remove-member-dialog";
import { canManageMembers, getAssignableRolesByUser } from "@/lib/roles";

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  image: string | null;
  createdAt: Date;
}

interface MembersListProps {
  members: Member[];
  currentUserId: string;
  canManage: boolean;
  currentUserRole: UserRole;
}

export function MembersList({
  members,
  currentUserId,
  canManage,
  currentUserRole,
}: MembersListProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const handleChangeRole = (member: Member) => {
    setSelectedMember(member);
    setIsRoleDialogOpen(true);
  };

  const handleRemove = (member: Member) => {
    setSelectedMember(member);
    setIsRemoveDialogOpen(true);
  };

  const canModifyMember = (member: Member) => {
    if (!canManage) return false;
    if (member.id === currentUserId) return false;
    return true;
  };

  const canChangeMemberRole = (member: Member) => {
    if (!canModifyMember(member)) return false;
    // Check if current user has any roles they can assign
    const assignableRoles = getAssignableRolesByUser(currentUserRole);
    return assignableRoles.length > 0;
  };

  const getRoleBadgeVariant = (role: UserRole): "default" | "secondary" | "outline" | "destructive" => {
    const variants: Record<UserRole, "default" | "secondary" | "outline" | "destructive"> = {
      ORG_OWNER: "default",
      ADMIN: "secondary",
      AGENT: "outline",
      VIEWER: "outline",
    };
    return variants[role];
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{""}</CardTitle>
          <CardDescription>
            {members.length === 1 
              ? ""
              : ""
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("tableHeaders.member")}</TableHead>
                <TableHead>{t("tableHeaders.role")}</TableHead>
                <TableHead>{t("tableHeaders.joined")}</TableHead>
                {canManage && <TableHead className="w-[70px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        user={{
                          name: member.name || null,
                          image: member.image || null,
                        }}
                        className="h-8 w-8"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {member.name || ""}
                          {member.id === currentUserId && (
                            <span className="ml-2 text-xs text-muted-foreground">{""}</span>
                          )}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {tRoles(member.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(member.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      {canModifyMember(member) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">{""}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{""}</DropdownMenuLabel>
                            {canChangeMemberRole(member) && (
                              <>
                                <DropdownMenuItem onClick={() => handleChangeRole(member)}>
                                  {""}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleRemove(member)}
                              className="text-destructive focus:text-destructive"
                            >
                              {""}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {members.length === 0 && (
            <div className="flex min-h-[200px] items-center justify-center text-center">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{""}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMember && (
        <>
          <UpdateMemberRoleDialog
            member={selectedMember}
            currentUserRole={currentUserRole}
            currentUserId={currentUserId}
            open={isRoleDialogOpen}
            onOpenChange={setIsRoleDialogOpen}
          />
          <RemoveMemberDialog
            member={selectedMember}
            open={isRemoveDialogOpen}
            onOpenChange={setIsRemoveDialogOpen}
          />
        </>
      )}
    </>
  );
}

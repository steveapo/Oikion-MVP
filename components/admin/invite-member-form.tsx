"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { inviteUser } from "@/actions/invitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, UserPlus } from "lucide-react";
import { ROLE_DESCRIPTIONS, getRoleDisplayName } from "@/lib/roles";

interface InviteMemberFormProps {
  currentUserRole: UserRole;
  onSuccess?: () => void;
}

export function InviteMemberForm({ currentUserRole, onSuccess }: InviteMemberFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.AGENT);
  const [isLoading, setIsLoading] = useState(false);

  // Get assignable roles based on current user's role
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !role) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await inviteUser({ email, role });
      
      if (result.success) {
        toast.success(`Invitation sent to ${email}`);
        setEmail("");
        setRole(UserRole.AGENT);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to send invitation");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Failed to invite user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite New Member
        </CardTitle>
        <CardDescription>
          Send an invitation email to add a new member to your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
              disabled={isLoading}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{getRoleDisplayName(r)}</span>
                      <span className="text-xs text-muted-foreground">
                        {ROLE_DESCRIPTIONS[r]}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {role && (
              <p className="text-xs text-muted-foreground">
                {ROLE_DESCRIPTIONS[role]}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

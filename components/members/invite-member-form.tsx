"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteUser } from "@/actions/invitations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Icons } from "@/components/shared/icons";

const inviteFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(UserRole),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

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

export function InviteMemberForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: UserRole.AGENT,
    },
  });

  async function onSubmit(data: InviteFormValues) {
    setIsLoading(true);

    const result = await inviteUser(data.email, data.role);

    setIsLoading(false);

    if (result.success) {
      toast.success("Invitation sent successfully");
      form.reset();
    } else {
      toast.error(result.error || "Failed to send invitation");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite New Member</CardTitle>
        <CardDescription>
          Send an invitation to join your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="colleague@example.com"
                      type="email"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    They will receive an email invitation to join
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      {Object.entries(roleLabels).map(([value, roleInfo]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{roleInfo.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {roleInfo.description}
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

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

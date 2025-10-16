"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { updateOrganization } from "@/actions/organizations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100),
  plan: z.enum(["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"]),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrganizationSettingsFormProps {
  organization: {
    id: string;
    name: string;
    plan?: string;
    isPersonal?: boolean;
  };
}

const planLabels = {
  FREE: "Free",
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
};

const planDescriptions = {
  FREE: "Basic features for getting started",
  STARTER: "Essential features for small teams",
  PROFESSIONAL: "Advanced features for growing businesses",
  ENTERPRISE: "Full-featured plan for large organizations",
};

export function OrganizationSettingsForm({
  organization,
}: OrganizationSettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization.name,
      plan: (organization.plan as any) || "FREE",
    },
  });

  async function onSubmit(data: OrganizationFormData) {
    setIsSaving(true);

    const result = await updateOrganization(organization.id, data);

    if (result.success) {
      toast.success("Organization settings updated");
    } else {
      toast.error(result.error || "Failed to update organization");
    }

    setIsSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Settings</CardTitle>
        <CardDescription>
          Manage your organization name and plan settings.
          {organization.isPersonal && (
            <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Personal
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Organization"
                      {...field}
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the display name of your organization.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSaving}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(planLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{label}</span>
                            <span className="text-xs text-muted-foreground">
                              {planDescriptions[value as keyof typeof planDescriptions]}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the plan tier for this organization (frontend only).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

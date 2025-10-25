"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { updateOrganization } from "@/actions/organizations";
import { useOrganizationContext } from "@/lib/organization-context";
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
  const { triggerReload } = useOrganizationContext();
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
      toast.success("Organization updated");
      // Trigger reload to update org name in switcher
      triggerReload("update");
    } else {
      toast.error(result.error || "Failed to update organization");
    }

    setIsSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <CardDescription>
          Update your organization settings
          {organization.isPersonal && (
            <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Personal workspace
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"Organization name"}
                      {...field}
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormDescription>
                    This name is visible to members
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
                        <SelectValue placeholder={"Select a plan"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(planLabels).map((value) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{(planLabels as any)[value]}</span>
                            <span className="text-xs text-muted-foreground">
                              {(planDescriptions as any)[value]
                            }</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a plan that fits your needs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

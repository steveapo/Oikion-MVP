"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClientType } from "@prisma/client";
import { toast } from "sonner";
import { X } from "lucide-react";

import { clientFormSchema, type ClientFormData } from "@/lib/validations/client";
import { createClient, updateClient } from "@/actions/clients";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";

interface ClientFormProps {
  defaultValues?: Partial<ClientFormData>;
  isEditing?: boolean;
  clientId?: string;
}

export function ClientForm({ defaultValues, isEditing = false, clientId }: ClientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tagInput, setTagInput] = useState("");

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      clientType: defaultValues?.clientType || ClientType.PERSON,
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      secondaryEmail: defaultValues?.secondaryEmail || "",
      secondaryPhone: defaultValues?.secondaryPhone || "",
      tags: defaultValues?.tags || [],
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    startTransition(async () => {
      try {
        if (isEditing && clientId) {
          // Update existing client
          const result = await updateClient(clientId, data);
          
          if (result.success) {
            toast.success("Client updated successfully!");
            router.push(`/dashboard/relations/${clientId}`);
            router.refresh();
          }
        } else {
          // Create new client
          const result = await createClient(data);
          
          if (result.success) {
            toast.success("Client created successfully!");
            router.push(`/dashboard/relations/${result.clientId}`);
            router.refresh();
          }
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : isEditing ? "Failed to update client" : "Failed to create client"
        );
      }
    });
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;

    const currentTags = form.getValues("tags") || [];
    if (currentTags.includes(trimmedTag)) {
      toast.error("Tag already exists");
      return;
    }

    if (currentTags.length >= 20) {
      toast.error("Maximum 20 tags allowed");
      return;
    }

    form.setValue("tags", [...currentTags, trimmedTag]);
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Client Type */}
        <FormField
          control={form.control}
          name="clientType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ClientType.PERSON}>Person</SelectItem>
                  <SelectItem value={ClientType.COMPANY}>Company</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose whether this is an individual or a company
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    form.watch("clientType") === ClientType.COMPANY
                      ? "Company Name"
                      : "Full Name"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Primary Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Primary Contact</h3>
          <p className="text-sm text-muted-foreground">
            At least one contact method (email or phone) is required
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+30 210 123 4567"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Secondary Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Secondary Contact (Optional)</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="secondaryEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="secondary@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondaryPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+30 210 987 6543"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    maxLength={50}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </div>

                {field.value && field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 rounded-full hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <FormDescription>
                Add tags to categorize and filter clients (max 20 tags)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Client" : "Create Client"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInteraction, getOrganizationProperties } from "@/actions/interactions";
import { interactionFormSchema, type InteractionFormData } from "@/lib/validations/interaction";
import { InteractionType } from "@prisma/client";
import { toast } from "sonner";
import { useEffect } from "react";
import { TOAST_SUCCESS, TOAST_ERROR } from "@/lib/toast-messages";

interface AddInteractionModalProps {
  clientId: string;
  children: React.ReactNode;
}

interface Property {
  id: string;
  propertyType: string;
  price: number;
  address: {
    city: string;
    region?: string | null;
  } | null;
}

export function AddInteractionModal({ clientId, children }: AddInteractionModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);

  const form = useForm<InteractionFormData>({
    resolver: zodResolver(interactionFormSchema),
    defaultValues: {
      interactionType: InteractionType.CALL,
      clientId,
      summary: "",
      timestamp: new Date(),
    },
  });

  useEffect(() => {
    if (open) {
      const loadProperties = async () => {
        try {
          const props = await getOrganizationProperties();
          setProperties(props);
        } catch (error) {
          console.error("Failed to load properties:", error);
        }
      };
      loadProperties();
    }
  }, [open]);

  const onSubmit = async (data: InteractionFormData) => {
    setIsSubmitting(true);
    
    try {
      const result = await createInteraction(data);
      
      if (!result.success) {
        // Handle validation errors
        if (result.validationErrors) {
          Object.entries(result.validationErrors).forEach(([field, message]) => {
            form.setError(field as any, { message });
          });
        }
        toast.error(result.error || TOAST_ERROR.INTERACTION_CREATE_FAILED);
        setIsSubmitting(false);
        return;
      }
      
      form.reset();
      setOpen(false);
      toast.success(TOAST_SUCCESS.INTERACTION_LOGGED);
      router.refresh();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(TOAST_ERROR.INTERACTION_CREATE_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Interaction</DialogTitle>
          <DialogDescription>
            Record a new interaction with this client.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="interactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interaction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={InteractionType.CALL}>Phone Call</SelectItem>
                      <SelectItem value={InteractionType.EMAIL}>Email</SelectItem>
                      <SelectItem value={InteractionType.MEETING}>Meeting</SelectItem>
                      <SelectItem value={InteractionType.VIEWING}>Property Viewing</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {properties.length > 0 && (
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Property (Optional)</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.propertyType.toLowerCase()} in{" "}
                            {property.address?.city || "Unknown"} - €
                            {property.price.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="timestamp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what was discussed..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Logging..." : "Log Interaction"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
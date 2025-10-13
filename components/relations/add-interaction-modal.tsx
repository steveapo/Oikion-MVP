"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createInteraction, getOrganizationProperties } from "@/actions/interactions";
import { interactionFormSchema, type InteractionFormData } from "@/lib/validations/interaction";
import { InteractionType } from "@prisma/client";
import { toast } from "sonner";
import { useEffect } from "react";

interface AddInteractionModalProps {
  clientId: string;
  children: React.ReactNode;
}

interface Property {
  id: string;
  propertyType: string;
  price: any; // Decimal type from Prisma
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
          setProperties(props as any);
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
      await createInteraction(data);
      form.reset();
      setOpen(false);
      toast.success("Interaction logged successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to log interaction");
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
                <FormItem className="flex flex-col">
                  <FormLabel>Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP 'at' p")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            // Preserve the time from the current value or use current time
                            const newDate = new Date(date);
                            if (field.value) {
                              newDate.setHours(field.value.getHours());
                              newDate.setMinutes(field.value.getMinutes());
                            } else {
                              const now = new Date();
                              newDate.setHours(now.getHours());
                              newDate.setMinutes(now.getMinutes());
                            }
                            field.onChange(newDate);
                          }
                        }}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <FormLabel className="text-xs">Time</FormLabel>
                        <Input
                          type="time"
                          value={field.value ? format(field.value, "HH:mm") : ""}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const newDate = field.value ? new Date(field.value) : new Date();
                            newDate.setHours(parseInt(hours));
                            newDate.setMinutes(parseInt(minutes));
                            field.onChange(newDate);
                          }}
                          className="mt-2"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select the date and time of the interaction
                  </FormDescription>
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
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
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
import { createNote } from "@/actions/interactions";
import { noteFormSchema, type NoteFormData } from "@/lib/validations/note";
import { toast } from "sonner";
import { TOAST_SUCCESS, TOAST_ERROR } from "@/lib/toast-messages";

interface AddNoteModalProps {
  clientId?: string;
  propertyId?: string;
  children: React.ReactNode;
}

export function AddNoteModal({ clientId, propertyId, children }: AddNoteModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      clientId,
      propertyId,
      content: "",
    },
  });

  const onSubmit = async (data: NoteFormData) => {
    setIsSubmitting(true);
    
    try {
      const result = await createNote(data);
      
      if (!result.success) {
        // Handle validation errors
        if (result.validationErrors) {
          Object.entries(result.validationErrors).forEach(([field, message]) => {
            form.setError(field as any, { message });
          });
        }
        toast.error(result.error || TOAST_ERROR.NOTE_CREATE_FAILED);
        setIsSubmitting(false);
        return;
      }
      
      form.reset();
      setOpen(false);
      toast.success(TOAST_SUCCESS.NOTE_CREATED);
      router.refresh();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(TOAST_ERROR.NOTE_CREATE_FAILED);
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
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            Add a note to track important information or observations.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your note here..."
                      className="min-h-[120px]"
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
                {isSubmitting ? "Adding..." : "Add Note"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
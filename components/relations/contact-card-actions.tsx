"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteClient } from "@/actions/clients";

interface ContactCardActionsProps {
  clientId: string;
  clientName: string;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Client-side interactive dropdown for contact card actions
 * This is a minimal client island that handles user interactions
 */
export function ContactCardActions({ 
  clientId,
  clientName,
  canEdit, 
  canDelete 
}: ContactCardActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    if (!confirm(tMessages("deleteConfirm", { name: clientName }))) {
      return;
    }

    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteClient(clientId);
      toast.success(tMessages("deleteSuccess"));
      router.refresh();
    } catch (error) {
      toast.error(tMessages("deleteError"));
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link href={`/dashboard/relations/${clientId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
        <Eye className="mr-2 h-4 w-4" />
        {""}
      </Link>
      
      {(canEdit || canDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isDeleting}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canEdit && (
              <>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/relations/${clientId}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    {""}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {canDelete && (
              <DropdownMenuItem 
                onClick={handleDelete} 
                className="text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "" : ""}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

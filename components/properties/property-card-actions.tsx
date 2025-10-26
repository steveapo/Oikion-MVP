"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, Edit, Archive, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { archiveProperty } from "@/actions/properties";

interface PropertyCardActionsProps {
  propertyId: string;
  canEdit: boolean;
  canArchive: boolean;
  isArchived: boolean;
}

/**
 * Client-side interactive dropdown for property card actions
 * This is a minimal client island that handles user interactions
 */
export function PropertyCardActions({ 
  propertyId, 
  canEdit, 
  canArchive,
  isArchived 
}: PropertyCardActionsProps) {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);
  const handleArchive = async () => {
    if (isArchiving) return;
    
    setIsArchiving(true);
    try {
      await archiveProperty(propertyId);
      toast.success("");
      router.refresh();
    } catch (error) {
      toast.error("");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link href={`/dashboard/properties/${propertyId}`}>
        <Button variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          {""}
        </Button>
      </Link>
      
      {(canEdit || canArchive) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isArchiving}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canEdit && (
              <>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/properties/${propertyId}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    {""}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {canArchive && !isArchived && (
              <DropdownMenuItem 
                onClick={handleArchive} 
                className="text-destructive"
                disabled={isArchiving}
              >
                <Archive className="mr-2 h-4 w-4" />
                {isArchiving ? "" : ""}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

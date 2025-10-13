"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Filter, X, Calendar } from "lucide-react";

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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ActionType, EntityType } from "@prisma/client";
import { getOrganizationActors } from "@/actions/activities";

interface Actor {
  id: string;
  name: string | null;
  email: string | null;
}

export function ActivityFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [actors, setActors] = useState<Actor[]>([]);

  useEffect(() => {
    const loadActors = async () => {
      try {
        const orgActors = await getOrganizationActors();
        setActors(orgActors);
      } catch (error) {
        console.error("Failed to load actors:", error);
      }
    };
    loadActors();
  }, []);

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when filters change
    params.delete("page");
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters = searchParams.toString() !== "";

  return (
    <div className="space-y-4">
      {/* Filter Toggle and Clear */}
      <div className="flex items-center justify-between">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  !
                </span>
              )}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-4">
            
            {/* Actor Filter */}
            {actors.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="actorId">Team Member</Label>
                <Select
                  defaultValue={searchParams.get("actorId") ?? "all"}
                  onValueChange={(value) => updateFilters("actorId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {actors.map((actor) => (
                      <SelectItem key={actor.id} value={actor.id}>
                        {actor.name || actor.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Entity Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type</Label>
              <Select
                defaultValue={searchParams.get("entityType") ?? "all"}
                onValueChange={(value) => updateFilters("entityType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={EntityType.PROPERTY}>Property</SelectItem>
                  <SelectItem value={EntityType.CLIENT}>Client</SelectItem>
                  <SelectItem value={EntityType.TASK}>Task</SelectItem>
                  <SelectItem value={EntityType.USER}>User</SelectItem>
                  <SelectItem value={EntityType.SUBSCRIPTION}>Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="actionType">Action Type</Label>
              <Select
                defaultValue={searchParams.get("actionType") ?? "all"}
                onValueChange={(value) => updateFilters("actionType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  
                  {/* Property Actions */}
                  <SelectItem value={ActionType.PROPERTY_CREATED}>Property Created</SelectItem>
                  <SelectItem value={ActionType.PROPERTY_UPDATED}>Property Updated</SelectItem>
                  <SelectItem value={ActionType.PROPERTY_ARCHIVED}>Property Archived</SelectItem>
                  <SelectItem value={ActionType.MEDIA_ADDED}>Media Added</SelectItem>
                  
                  {/* Client Actions */}
                  <SelectItem value={ActionType.CLIENT_CREATED}>Client Created</SelectItem>
                  <SelectItem value={ActionType.CLIENT_UPDATED}>Client Updated</SelectItem>
                  <SelectItem value={ActionType.CLIENT_RELATIONSHIP_CREATED}>Relationship Added</SelectItem>
                  <SelectItem value={ActionType.CLIENT_RELATIONSHIP_DELETED}>Relationship Broke</SelectItem>
                  
                  {/* Interaction Actions */}
                  <SelectItem value={ActionType.INTERACTION_LOGGED}>Interaction Logged</SelectItem>
                  <SelectItem value={ActionType.NOTE_ADDED}>Note Added</SelectItem>
                  
                  {/* Task Actions */}
                  <SelectItem value={ActionType.TASK_CREATED}>Task Created</SelectItem>
                  <SelectItem value={ActionType.TASK_COMPLETED}>Task Completed</SelectItem>
                  
                  {/* Organization Actions */}
                  <SelectItem value={ActionType.MEMBER_INVITED}>Member Invited</SelectItem>
                  <SelectItem value={ActionType.MEMBER_ROLE_CHANGED}>Role Changed</SelectItem>
                  
                  {/* Subscription Actions */}
                  <SelectItem value={ActionType.SUBSCRIPTION_STARTED}>Subscription Started</SelectItem>
                  <SelectItem value={ActionType.SUBSCRIPTION_UPDATED}>Subscription Updated</SelectItem>
                  <SelectItem value={ActionType.SUBSCRIPTION_CANCELLED}>Subscription Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  placeholder="From"
                  defaultValue={searchParams.get("dateFrom") ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateFilters("dateFrom", value || null);
                  }}
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  placeholder="To"
                  defaultValue={searchParams.get("dateTo") ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateFilters("dateTo", value || null);
                  }}
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
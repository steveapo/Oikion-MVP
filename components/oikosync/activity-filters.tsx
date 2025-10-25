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
              {""}
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
            {""}
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
                <Label htmlFor="actorId">{""}</Label>
                <Select
                  defaultValue={searchParams.get("actorId") ?? "all"}
                  onValueChange={(value) => updateFilters("actorId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={""} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{""}</SelectItem>
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
              <Label htmlFor="entityType">{""}</Label>
              <Select
                defaultValue={searchParams.get("entityType") ?? "all"}
                onValueChange={(value) => updateFilters("entityType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={""} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{""}</SelectItem>
                  <SelectItem value={EntityType.PROPERTY}>{""}</SelectItem>
                  <SelectItem value={EntityType.CLIENT}>{""}</SelectItem>
                  <SelectItem value={EntityType.TASK}>{""}</SelectItem>
                  <SelectItem value={EntityType.USER}>{""}</SelectItem>
                  <SelectItem value={EntityType.SUBSCRIPTION}>Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="actionType">{""}</Label>
              <Select
                defaultValue={searchParams.get("actionType") ?? "all"}
                onValueChange={(value) => updateFilters("actionType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={""} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{""}</SelectItem>
                  
                  {/* Property Actions */}
                  <SelectItem value={ActionType.PROPERTY_CREATED}>{t("../actionTypes.propertyCreated")}</SelectItem>
                  <SelectItem value={ActionType.PROPERTY_UPDATED}>{t("../actionTypes.propertyUpdated")}</SelectItem>
                  <SelectItem value={ActionType.PROPERTY_ARCHIVED}>{t("../actionTypes.propertyArchived")}</SelectItem>
                  <SelectItem value={ActionType.MEDIA_ADDED}>{t("../actionTypes.mediaAdded")}</SelectItem>
                  
                  {/* Client Actions */}
                  <SelectItem value={ActionType.CLIENT_CREATED}>{t("../actionTypes.clientCreated")}</SelectItem>
                  <SelectItem value={ActionType.CLIENT_UPDATED}>{t("../actionTypes.clientUpdated")}</SelectItem>
                  <SelectItem value={ActionType.CLIENT_RELATIONSHIP_CREATED}>{t("../actionTypes.clientRelationshipCreated")}</SelectItem>
                  <SelectItem value={ActionType.CLIENT_RELATIONSHIP_DELETED}>{t("../actionTypes.clientRelationshipDeleted")}</SelectItem>
                  
                  {/* Interaction Actions */}
                  <SelectItem value={ActionType.INTERACTION_LOGGED}>{t("../actionTypes.interactionLogged")}</SelectItem>
                  <SelectItem value={ActionType.NOTE_ADDED}>{t("../actionTypes.noteAdded")}</SelectItem>
                  
                  {/* Task Actions */}
                  <SelectItem value={ActionType.TASK_CREATED}>{t("../actionTypes.taskCreated")}</SelectItem>
                  <SelectItem value={ActionType.TASK_COMPLETED}>{t("../actionTypes.taskCompleted")}</SelectItem>
                  
                  {/* Organization Actions */}
                  <SelectItem value={ActionType.MEMBER_INVITED}>{t("../actionTypes.memberInvited")}</SelectItem>
                  <SelectItem value={ActionType.MEMBER_ROLE_CHANGED}>{t("../actionTypes.memberRoleChanged")}</SelectItem>
                  
                  {/* Subscription Actions */}
                  <SelectItem value={ActionType.SUBSCRIPTION_STARTED}>{t("../actionTypes.subscriptionStarted")}</SelectItem>
                  <SelectItem value={ActionType.SUBSCRIPTION_UPDATED}>{t("../actionTypes.subscriptionUpdated")}</SelectItem>
                  <SelectItem value={ActionType.SUBSCRIPTION_CANCELLED}>{t("../actionTypes.subscriptionCancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>{""}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  placeholder={""}
                  defaultValue={searchParams.get("dateFrom") ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateFilters("dateFrom", value || null);
                  }}
                />
                <span className="text-muted-foreground">{""}</span>
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
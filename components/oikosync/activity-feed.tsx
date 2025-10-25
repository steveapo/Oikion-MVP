"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";
import { 
  Activity, 
  Home, 
  Users, 
  CheckCircle, 
  FileText, 
  Phone, 
  Mail, 
  Calendar, 
  Eye,
  UserPlus,
  Settings,
  CreditCard,
  Archive,
  Link2,
  Unlink
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ActivityItem {
  id: string;
  actionType: string;
  entityType: string;
  entityId: string;
  payload: any;
  createdAt: Date;
  actor: {
    id: string;
    name: string | null;
    email: string | null;
  };
  entityDetails: any;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  totalPages: number;
  currentPage: number;
}

export function ActivityFeed({ activities, totalPages, currentPage }: ActivityFeedProps) {
  return (
    <div className="space-y-6">
      {/* Activity Feed */}
      <div className="space-y-4">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={`?page=${currentPage - 1}`} />
                </PaginationItem>
              )}
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                const isCurrentPage = pageNum === currentPage;
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      href={`?page=${pageNum}`}
                      isActive={isCurrentPage}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext href={`?page=${currentPage + 1}`} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

function ActivityCard({ activity }: { activity: ActivityItem }) {
  const actorName = activity.actor.name || activity.actor.email || "Unknown User";
  const t = useTranslations("oikosync.activity");
  const tEntityTypes = useTranslations("oikosync.entityTypes");
  const { icon, color, message, linkHref } = getActivityDisplay(activity, t);
  const Icon = icon;

  // Map entity type to translation key
  const getEntityTypeKey = (entityType: string): string => {
    const typeMap: Record<string, string> = {
      "PROPERTY": "property",
      "CLIENT": "client",
      "TASK": "task",
      "USER": "user",
      "SUBSCRIPTION": "subscription"
    };
    return typeMap[entityType] || entityType.toLowerCase();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Activity Icon */}
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color}`}>
            <Icon className="h-5 w-5" />
          </div>

          {/* Activity Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {linkHref ? (
                    <Link href={linkHref} className="hover:underline">
                      {message}
                    </Link>
                  ) : (
                    message
                  )}
                </p>
                <div className="mt-1 flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{t("by")} {actorName}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
              
              {/* Entity Badge */}
              <Badge variant="outline" className="ml-2">
                {tEntityTypes(getEntityTypeKey(activity.entityType))}
              </Badge>
            </div>

            {/* Additional payload info */}
            {activity.payload && Object.keys(activity.payload).length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                {renderPayloadInfo(activity, t)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getActivityDisplay(activity: ActivityItem, t: any) {
  const { actionType, entityType, entityDetails, payload } = activity;

  switch (actionType) {
    case "PROPERTY_CREATED":
      return {
        icon: Home,
        color: "bg-blue-100 text-blue-600",
        message: `${t("created")} ${t("property")} ${entityDetails?.propertyType?.toLowerCase() || t("property")} ${getEntityLocation(entityDetails, t)}`,
        linkHref: `/dashboard/properties/${activity.entityId}`,
      };

    case "PROPERTY_UPDATED":
      return {
        icon: Home,
        color: "bg-blue-100 text-blue-600",
        message: `${t("updated")} ${t("property")} ${entityDetails?.propertyType?.toLowerCase() || t("property")} ${getEntityLocation(entityDetails, t)}`,
        linkHref: `/dashboard/properties/${activity.entityId}`,
      };

    case "PROPERTY_ARCHIVED":
      return {
        icon: Archive,
        color: "bg-gray-100 text-gray-600",
        message: `${t("archived")} ${t("property")} ${entityDetails?.propertyType?.toLowerCase() || t("property")} ${getEntityLocation(entityDetails, t)}`,
        linkHref: `/dashboard/properties/${activity.entityId}`,
      };

    case "MEDIA_ADDED":
      return {
        icon: Eye,
        color: "bg-purple-100 text-purple-600",
        message: `${t("added")} ${payload?.count || t("images")} ${t("to")} ${t("property")} ${getEntityLocation(entityDetails, t)}`,
        linkHref: `/dashboard/properties/${activity.entityId}`,
      };

    case "CLIENT_CREATED":
      return {
        icon: Users,
        color: "bg-green-100 text-green-600",
        message: `${t("created")} ${entityDetails?.clientType?.toLowerCase() || "client"} "${entityDetails?.name || t("unknown")}"`,
        linkHref: `/dashboard/relations/${activity.entityId}`,
      };

    case "CLIENT_UPDATED":
      return {
        icon: Users,
        color: "bg-green-100 text-green-600",
        message: `${t("updated")} ${entityDetails?.clientType?.toLowerCase() || "client"} "${entityDetails?.name || t("unknown")}"`,
        linkHref: `/dashboard/relations/${activity.entityId}`,
      };

    case "CLIENT_RELATIONSHIP_CREATED":
      return {
        icon: Link2,
        color: "bg-teal-100 text-teal-600",
        message: `${t("linked")} "${payload?.fromClientName || t("unknown")}" ${t("with")} "${payload?.toClientName || t("unknown")}" ${t("as")} ${payload?.relationshipType?.toLowerCase()?.replace("_", " ") || "related"}${payload?.position ? ` (${payload.position})` : ""}`,
        linkHref: `/dashboard/relations/${payload?.fromClientId}`,
      };

    case "CLIENT_RELATIONSHIP_DELETED":
      return {
        icon: Unlink,
        color: "bg-red-100 text-red-600",
        message: `${t("broke")} ${t("linkBetween")} "${payload?.fromClientName || t("unknown")}" ${t("and")} "${payload?.toClientName || t("unknown")}" (${payload?.relationshipType?.toLowerCase()?.replace("_", " ") || t("relationship")})`,
        linkHref: `/dashboard/relations/${payload?.fromClientId}`,
      };

    case "NOTE_ADDED":
      return {
        icon: FileText,
        color: "bg-yellow-100 text-yellow-600",
        message: `${t("added")} ${t("note")}${entityType === "CLIENT" && entityDetails ? ` ${t("to")} ${entityDetails.name}` : ""}`,
        linkHref: entityType === "CLIENT" ? `/dashboard/relations/${activity.entityId}` : `/dashboard/properties/${activity.entityId}`,
      };

    case "INTERACTION_LOGGED":
      const interactionIcon = getInteractionIcon(payload?.interactionType);
      return {
        icon: interactionIcon,
        color: "bg-indigo-100 text-indigo-600",
        message: `${t("logged")} ${payload?.interactionType?.toLowerCase()?.replace("_", " ") || "interaction"}${payload?.clientName ? ` ${t("with")} ${payload.clientName}` : ""}`,
        linkHref: `/dashboard/relations/${activity.entityId}`,
      };

    case "TASK_CREATED":
      return {
        icon: Calendar,
        color: "bg-orange-100 text-orange-600",
        message: `${t("created")} ${t("task")} "${entityDetails?.title || payload?.taskTitle || t("unknown")}"`,
        linkHref: null,
      };

    case "TASK_COMPLETED":
      return {
        icon: CheckCircle,
        color: "bg-green-100 text-green-600",
        message: `${t("completed")} ${t("task")} "${entityDetails?.title || payload?.taskTitle || t("unknown")}"`,
        linkHref: null,
      };

    case "MEMBER_INVITED":
      return {
        icon: UserPlus,
        color: "bg-blue-100 text-blue-600",
        message: `${t("invited")} ${payload?.email || t("someone")} ${t("to")} organization`,
        linkHref: null,
      };

    case "MEMBER_ROLE_CHANGED":
      return {
        icon: Settings,
        color: "bg-purple-100 text-purple-600",
        message: `${t("changed")} ${entityDetails?.name || t("user")}'s ${t("role")} ${t("to")} ${payload?.role || t("unknown")}`,
        linkHref: null,
      };

    case "SUBSCRIPTION_STARTED":
      return {
        icon: CreditCard,
        color: "bg-green-100 text-green-600",
        message: `${t("started")} ${t("subscription")} (${payload?.plan || "Plan"})`,
        linkHref: "/dashboard/billing",
      };

    case "SUBSCRIPTION_UPDATED":
      return {
        icon: CreditCard,
        color: "bg-blue-100 text-blue-600",
        message: `${t("updated")} ${t("subscription")} ${t("to")} ${payload?.plan || "new plan"}`,
        linkHref: "/dashboard/billing",
      };

    case "SUBSCRIPTION_CANCELLED":
      return {
        icon: CreditCard,
        color: "bg-red-100 text-red-600",
        message: `${t("cancelled")} ${t("subscription")}`,
        linkHref: "/dashboard/billing",
      };

    default:
      return {
        icon: Activity,
        color: "bg-gray-100 text-gray-600",
        message: `${t("performed")} ${actionType.toLowerCase().replace("_", " ")}`,
        linkHref: null,
      };
  }
}

function getInteractionIcon(type?: string) {
  switch (type) {
    case "CALL":
      return Phone;
    case "EMAIL":
      return Mail;
    case "MEETING":
      return Calendar;
    case "VIEWING":
      return Eye;
    default:
      return Activity;
  }
}

function getEntityLocation(entityDetails: any, t: any) {
  if (!entityDetails) return "";
  
  if (entityDetails.address) {
    const parts = [entityDetails.address.city, entityDetails.address.region].filter(Boolean);
    return parts.length > 0 ? `${t("in")} ${parts.join(", ")}` : "";
  }
  
  return "";
}

function renderPayloadInfo(activity: ActivityItem, t: any) {
  const { actionType, payload } = activity;
  
  if (!payload || Object.keys(payload).length === 0) return null;

  switch (actionType) {
    case "PROPERTY_CREATED":
    case "PROPERTY_UPDATED":
      if (payload.price) {
        const formattedPrice = new Intl.NumberFormat("el-GR", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(payload.price);
        return `${t("price")} ${formattedPrice}`;
      }
      break;
      
    case "TASK_CREATED":
      if (payload.assignedTo) {
        return `${t("assignedTo")} ${payload.assignedTo}`;
      }
      break;
      
    case "PROPERTY_UPDATED":
      if (payload.updatedFields && Array.isArray(payload.updatedFields)) {
        return `${t("updatedFields")} ${payload.updatedFields.join(", ")}`;
      }
      break;
  }
  
  return null;
}
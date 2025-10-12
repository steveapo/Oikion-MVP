"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
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
  Archive
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
  const { icon, color, message, linkHref } = getActivityDisplay(activity);
  const Icon = icon;

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
                  <span>by {actorName}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
              
              {/* Entity Badge */}
              <Badge variant="outline" className="ml-2">
                {activity.entityType.toLowerCase()}
              </Badge>
            </div>

            {/* Additional payload info */}
            {activity.payload && Object.keys(activity.payload).length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                {renderPayloadInfo(activity)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getActivityDisplay(activity: ActivityItem) {
  const { actionType, entityType, entityDetails, payload } = activity;

  switch (actionType) {
    case "PROPERTY_CREATED":
      return {
        icon: Home,
        color: "bg-blue-100 text-blue-600",
        message: `created property ${entityDetails?.propertyType?.toLowerCase() || "property"} ${getEntityLocation(entityDetails)}`,
        linkHref: `/dashboard/properties/${activity.entityId}`,
      };

    case "PROPERTY_UPDATED":
      return {
        icon: Home,
        color: "bg-blue-100 text-blue-600",
        message: `updated property ${entityDetails?.propertyType?.toLowerCase() || "property"} ${getEntityLocation(entityDetails)}`,
        linkHref: `/dashboard/properties/${activity.entityId}`,
      };

    case "PROPERTY_ARCHIVED":
      return {
        icon: Archive,
        color: "bg-gray-100 text-gray-600",
        message: `archived property ${entityDetails?.propertyType?.toLowerCase() || "property"} ${getEntityLocation(entityDetails)}`,
        linkHref: `/dashboard/properties/${activity.entityId}`,
      };

    case "MEDIA_ADDED":
      return {
        icon: Eye,
        color: "bg-purple-100 text-purple-600",
        message: `added ${payload?.count || "images"} to property ${getEntityLocation(entityDetails)}`,
        linkHref: `/dashboard/properties/${activity.entityId}`,
      };

    case "CLIENT_CREATED":
      return {
        icon: Users,
        color: "bg-green-100 text-green-600",
        message: `created ${entityDetails?.clientType?.toLowerCase() || "client"} "${entityDetails?.name || "Unknown"}"`,
        linkHref: `/dashboard/contacts/${activity.entityId}`,
      };

    case "CLIENT_UPDATED":
      return {
        icon: Users,
        color: "bg-green-100 text-green-600",
        message: `updated ${entityDetails?.clientType?.toLowerCase() || "client"} "${entityDetails?.name || "Unknown"}"`,
        linkHref: `/dashboard/contacts/${activity.entityId}`,
      };

    case "NOTE_ADDED":
      return {
        icon: FileText,
        color: "bg-yellow-100 text-yellow-600",
        message: `added a note${entityType === "CLIENT" && entityDetails ? ` to ${entityDetails.name}` : ""}`,
        linkHref: entityType === "CLIENT" ? `/dashboard/contacts/${activity.entityId}` : `/dashboard/properties/${activity.entityId}`,
      };

    case "INTERACTION_LOGGED":
      const interactionIcon = getInteractionIcon(payload?.interactionType);
      return {
        icon: interactionIcon,
        color: "bg-indigo-100 text-indigo-600",
        message: `logged a ${payload?.interactionType?.toLowerCase()?.replace("_", " ") || "interaction"}${payload?.clientName ? ` with ${payload.clientName}` : ""}`,
        linkHref: `/dashboard/contacts/${activity.entityId}`,
      };

    case "TASK_CREATED":
      return {
        icon: Calendar,
        color: "bg-orange-100 text-orange-600",
        message: `created task "${entityDetails?.title || payload?.taskTitle || "Unknown task"}"`,
        linkHref: null,
      };

    case "TASK_COMPLETED":
      return {
        icon: CheckCircle,
        color: "bg-green-100 text-green-600",
        message: `completed task "${entityDetails?.title || payload?.taskTitle || "Unknown task"}"`,
        linkHref: null,
      };

    case "MEMBER_INVITED":
      return {
        icon: UserPlus,
        color: "bg-blue-100 text-blue-600",
        message: `invited ${payload?.email || "someone"} to the organization`,
        linkHref: null,
      };

    case "MEMBER_ROLE_CHANGED":
      return {
        icon: Settings,
        color: "bg-purple-100 text-purple-600",
        message: `changed ${entityDetails?.name || "user"}'s role to ${payload?.role || "unknown"}`,
        linkHref: null,
      };

    case "SUBSCRIPTION_STARTED":
      return {
        icon: CreditCard,
        color: "bg-green-100 text-green-600",
        message: `started subscription (${payload?.plan || "Plan"})`,
        linkHref: "/dashboard/billing",
      };

    case "SUBSCRIPTION_UPDATED":
      return {
        icon: CreditCard,
        color: "bg-blue-100 text-blue-600",
        message: `updated subscription to ${payload?.plan || "new plan"}`,
        linkHref: "/dashboard/billing",
      };

    case "SUBSCRIPTION_CANCELLED":
      return {
        icon: CreditCard,
        color: "bg-red-100 text-red-600",
        message: "cancelled subscription",
        linkHref: "/dashboard/billing",
      };

    default:
      return {
        icon: Activity,
        color: "bg-gray-100 text-gray-600",
        message: `performed ${actionType.toLowerCase().replace("_", " ")}`,
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

function getEntityLocation(entityDetails: any) {
  if (!entityDetails) return "";
  
  if (entityDetails.address) {
    const parts = [entityDetails.address.city, entityDetails.address.region].filter(Boolean);
    return parts.length > 0 ? `in ${parts.join(", ")}` : "";
  }
  
  return "";
}

function renderPayloadInfo(activity: ActivityItem) {
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
        return `Price: ${formattedPrice}`;
      }
      break;
      
    case "TASK_CREATED":
      if (payload.assignedTo) {
        return `Assigned to: ${payload.assignedTo}`;
      }
      break;
      
    case "PROPERTY_UPDATED":
      if (payload.updatedFields && Array.isArray(payload.updatedFields)) {
        return `Updated: ${payload.updatedFields.join(", ")}`;
      }
      break;
  }
  
  return null;
}
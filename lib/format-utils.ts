import { PropertyStatus, PropertyType, TransactionType } from "@prisma/client";

/**
 * Server-side formatting utilities for properties and clients
 * These run on the server to reduce client-side JavaScript bundle
 */

/**
 * Format currency in Euros (Greek locale)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format property type for display
 */
export function formatPropertyType(type: PropertyType): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

/**
 * Get badge variant for property status
 */
export function getStatusBadgeVariant(status: PropertyStatus): "default" | "secondary" | "outline" {
  const statusConfig = {
    [PropertyStatus.AVAILABLE]: "default" as const,
    [PropertyStatus.UNDER_OFFER]: "secondary" as const,
    [PropertyStatus.SOLD]: "outline" as const,
    [PropertyStatus.RENTED]: "outline" as const,
  };
  
  return statusConfig[status];
}

/**
 * Get status label for property status
 */
export function getStatusLabel(status: PropertyStatus): string {
  const statusLabels = {
    [PropertyStatus.AVAILABLE]: "Available",
    [PropertyStatus.UNDER_OFFER]: "Under Offer",
    [PropertyStatus.SOLD]: "Sold",
    [PropertyStatus.RENTED]: "Rented",
  };
  
  return statusLabels[status];
}

/**
 * Get transaction type badge configuration
 */
export function getTransactionTypeBadge(type: TransactionType): { label: string; className: string } {
  const typeConfig = {
    [TransactionType.SALE]: { label: "Sale", className: "bg-blue-100 text-blue-800" },
    [TransactionType.RENT]: { label: "Rent", className: "bg-green-100 text-green-800" },
    [TransactionType.LEASE]: { label: "Lease", className: "bg-purple-100 text-purple-800" },
  };
  
  return typeConfig[type];
}

/**
 * Format location from address parts
 */
export function formatLocation(city?: string | null, region?: string | null): string {
  const parts = [city, region].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Location not specified";
}

/**
 * Format bedroom count for display
 */
export function formatBedrooms(count: number): string {
  return `${count} bed${count !== 1 ? "s" : ""}`;
}

/**
 * Format bathroom count for display
 */
export function formatBathrooms(count: number): string {
  return `${count} bath${count !== 1 ? "s" : ""}`;
}

/**
 * Format size in square meters
 */
export function formatSize(size: number): string {
  return `${size}m²`;
}

/**
 * Format date relative to now (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      if (diffInMinutes < 1) return "just now";
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    }
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }
  
  if (diffInDays === 1) return "yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  }
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  }
  
  const years = Math.floor(diffInDays / 365);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

"use server";

import { prismaForOrg } from "@/lib/org-prisma";
import { requireAuth } from "@/lib/auth-utils";
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCode,
  zodErrorsToValidationErrors,
  type ActionResponse,
} from "@/lib/action-response";
import { searchParamsSchema, type SearchParams } from "@/lib/validations/search";
import type { SearchResults, PropertySearchResult, ClientSearchResult } from "@/types";
import { MarketingStatus } from "@prisma/client";

/**
 * Search entities (properties and clients) with organization scoping
 * 
 * Provides unified search across Properties and Clients for the CMD+K search command.
 * All results are automatically scoped to the user's organization via RLS.
 * 
 * @param params - Search parameters including query, limit, and entity types to include
 * @returns Search results grouped by entity type
 * 
 * @example
 * ```ts
 * const result = await searchEntities({ q: "athens", limit: 10 });
 * if (result.success) {
 *   console.log(result.data.properties); // Property results
 *   console.log(result.data.clients);    // Client results
 * }
 * ```
 */
export async function searchEntities(
  params: SearchParams
): Promise<ActionResponse<SearchResults>> {
  // 1. Validate input
  const validationResult = searchParamsSchema.safeParse(params);
  if (!validationResult.success) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      "Invalid search parameters",
      { validationErrors: zodErrorsToValidationErrors(validationResult.error) }
    );
  }
  const validatedParams = validationResult.data;

  // 2. Authenticate and get organization
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // 3. Prepare search query pattern (case-insensitive)
  const searchPattern = `%${validatedParams.q}%`;
  
  try {
    const db = prismaForOrg(user.organizationId);
    
    // 4. Execute parallel queries for properties and clients
    const [properties, clients] = await Promise.all([
      // Search properties if included
      validatedParams.include.properties
        ? db.property.findMany({
            where: {
              organizationId: user.organizationId,
              // Search by description (acts as property name/title)
              description: { contains: validatedParams.q, mode: "insensitive" },
            },
            include: {
              address: true,
              listing: true,
            },
            orderBy: { createdAt: "desc" },
            take: validatedParams.limit,
          })
        : Promise.resolve([]),
      
      // Search clients if included
      validatedParams.include.clients
        ? db.client.findMany({
            where: {
              organizationId: user.organizationId,
              // Search by name only as requested
              name: { contains: validatedParams.q, mode: "insensitive" },
            },
            orderBy: { createdAt: "desc" },
            take: validatedParams.limit,
          })
        : Promise.resolve([]),
    ]);

    // 5. Transform properties to SearchResult format
    const propertyResults: PropertySearchResult[] = properties.map((property) => {
      const address = property.address;
      const listing = property.listing;
      
      // Format label: "{PropertyType} in {City}"
      const label = `${formatPropertyType(property.propertyType)} in ${address?.city || "Unknown"}`;
      
      // Format subtitle: "€{Price} • {Bedrooms} bed • {City}, {Region}"
      const priceFormatted = `€${Number(property.price).toLocaleString()}`;
      const bedroomText = property.bedrooms ? `${property.bedrooms} bed` : "";
      const location = [address?.city, address?.region].filter(Boolean).join(", ");
      const subtitle = [priceFormatted, bedroomText, location].filter(Boolean).join(" • ");
      
      return {
        type: "property" as const,
        id: property.id,
        label,
        subtitle,
        href: `/dashboard/properties/${property.id}`,
        icon: "home" as const,
      };
    });

    // 6. Transform clients to SearchResult format
    const clientResults: ClientSearchResult[] = clients.map((client) => {
      // Format label: "{Name}"
      const label = client.name;
      
      // Format subtitle: "{ClientType} • {Email} • {Phone}"
      const clientTypeFormatted = formatClientType(client.clientType);
      const subtitle = [clientTypeFormatted, client.email, client.phone]
        .filter(Boolean)
        .join(" • ");
      
      return {
        type: "client" as const,
        id: client.id,
        label,
        subtitle,
        href: `/dashboard/relations/${client.id}`,
        icon: "user" as const,
      };
    });

    // 7. Return normalized results
    return createSuccessResponse<SearchResults>({
      properties: propertyResults,
      clients: clientResults,
    });
  } catch (error) {
    console.error("Search entities failed:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Search failed. Please try again."
    );
  }
}

/**
 * Helper function to format property type for display
 */
function formatPropertyType(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Helper function to format client type for display
 */
function formatClientType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

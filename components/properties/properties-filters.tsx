"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
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
import { PropertyStatus, TransactionType, PropertyType } from "@prisma/client";

export function PropertiesFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams((searchParams?.toString()) || "");
    
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
    router.push(pathname || "/");
  };

  const hasActiveFilters = (searchParams?.toString() || "") !== "";

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={"Search location..."}
            className="pl-10"
            defaultValue={searchParams?.get("location") ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              const timeoutId = setTimeout(() => {
                updateFilters("location", value || null);
              }, 500);
              return () => clearTimeout(timeoutId);
            }}
          />
        </div>
        
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
            Clear
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-4">
            
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                defaultValue={searchParams?.get("status") ?? "all"}
                onValueChange={(value) => updateFilters("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value={PropertyStatus.AVAILABLE}>Available</SelectItem>
                  <SelectItem value={PropertyStatus.UNDER_OFFER}>Under offer</SelectItem>
                  <SelectItem value={PropertyStatus.SOLD}>Sold</SelectItem>
                  <SelectItem value={PropertyStatus.RENTED}>Rented</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="transactionType">Type</Label>
              <Select
                defaultValue={searchParams?.get("transactionType") ?? "all"}
                onValueChange={(value) => updateFilters("transactionType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value={TransactionType.SALE}>Sale</SelectItem>
                  <SelectItem value={TransactionType.RENT}>Rent</SelectItem>
                  <SelectItem value={TransactionType.LEASE}>Lease</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                defaultValue={searchParams?.get("propertyType") ?? "all"}
                onValueChange={(value) => updateFilters("propertyType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All properties</SelectItem>
                  <SelectItem value={PropertyType.APARTMENT}>Apartment</SelectItem>
                  <SelectItem value={PropertyType.HOUSE}>House</SelectItem>
                  <SelectItem value={PropertyType.LAND}>Land</SelectItem>
                  <SelectItem value={PropertyType.COMMERCIAL}>Commercial</SelectItem>
                  <SelectItem value={PropertyType.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bedrooms Filter */}
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select
                defaultValue={searchParams?.get("bedrooms") ?? "all"}
                onValueChange={(value) => updateFilters("bedrooms", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2 md:col-span-2">
              <Label>Price range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={"Min price"}
                  defaultValue={searchParams?.get("minPrice") ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const timeoutId = setTimeout(() => {
                      updateFilters("minPrice", value || null);
                    }, 1000);
                    return () => clearTimeout(timeoutId);
                  }}
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  placeholder={"Max price"}
                  defaultValue={searchParams?.get("maxPrice") ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const timeoutId = setTimeout(() => {
                      updateFilters("maxPrice", value || null);
                    }, 1000);
                    return () => clearTimeout(timeoutId);
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
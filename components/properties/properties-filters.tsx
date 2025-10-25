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
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tFilters('searchPlaceholder')}
            className="pl-10"
            defaultValue={searchParams.get("location") ?? ""}
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
              {tFilters('filtersButton')}
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
            {tFilters('clearAll')}
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-4">
            
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">{tFilters('status')}</Label>
              <Select
                defaultValue={searchParams.get("status") ?? "all"}
                onValueChange={(value) => updateFilters("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tFilters('allStatuses')}</SelectItem>
                  <SelectItem value={PropertyStatus.AVAILABLE}>{tStatus('AVAILABLE')}</SelectItem>
                  <SelectItem value={PropertyStatus.UNDER_OFFER}>{tStatus('UNDER_OFFER')}</SelectItem>
                  <SelectItem value={PropertyStatus.SOLD}>{tStatus('SOLD')}</SelectItem>
                  <SelectItem value={PropertyStatus.RENTED}>{tStatus('RENTED')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="transactionType">{tFilters('type')}</Label>
              <Select
                defaultValue={searchParams.get("transactionType") ?? "all"}
                onValueChange={(value) => updateFilters("transactionType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tFilters('allTypes')}</SelectItem>
                  <SelectItem value={TransactionType.SALE}>{tTransaction('SALE')}</SelectItem>
                  <SelectItem value={TransactionType.RENT}>{tTransaction('RENT')}</SelectItem>
                  <SelectItem value={TransactionType.LEASE}>{tTransaction('LEASE')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                defaultValue={searchParams.get("propertyType") ?? "all"}
                onValueChange={(value) => updateFilters("propertyType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tFilters('allProperties')}</SelectItem>
                  <SelectItem value={PropertyType.APARTMENT}>{tPropertyType('APARTMENT')}</SelectItem>
                  <SelectItem value={PropertyType.HOUSE}>{tPropertyType('HOUSE')}</SelectItem>
                  <SelectItem value={PropertyType.LAND}>{tPropertyType('LAND')}</SelectItem>
                  <SelectItem value={PropertyType.COMMERCIAL}>{tPropertyType('COMMERCIAL')}</SelectItem>
                  <SelectItem value={PropertyType.OTHER}>{tPropertyType('OTHER')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bedrooms Filter */}
            <div className="space-y-2">
              <Label htmlFor="bedrooms">{tFilters('bedrooms')}</Label>
              <Select
                defaultValue={searchParams.get("bedrooms") ?? "all"}
                onValueChange={(value) => updateFilters("bedrooms", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tFilters('any')}</SelectItem>
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
              <Label>{tFilters('priceRange')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={tFilters('minPrice')}
                  defaultValue={searchParams.get("minPrice") ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const timeoutId = setTimeout(() => {
                      updateFilters("minPrice", value || null);
                    }, 1000);
                    return () => clearTimeout(timeoutId);
                  }}
                />
                <span className="text-muted-foreground">{tFilters('to')}</span>
                <Input
                  type="number"
                  placeholder={tFilters('maxPrice')}
                  defaultValue={searchParams.get("maxPrice") ?? ""}
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
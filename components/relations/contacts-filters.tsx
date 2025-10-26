"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ClientType } from "@prisma/client";
import { getClientTags } from "@/actions/clients";

export function ContactsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    (searchParams?.get("tags") ?? "").split(",").filter(Boolean)
  );

  useEffect(() => {
    const loadTags = async () => {
      const tags = await getClientTags();
      setAvailableTags(tags);
    };
    loadTags();
  }, []);

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

  const updateTagsFilter = (tags: string[]) => {
    const params = new URLSearchParams((searchParams?.toString()) || "");
    
    if (tags.length > 0) {
      params.set("tags", tags.join(","));
    } else {
      params.delete("tags");
    }
    
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    setSelectedTags(tags);
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    updateTagsFilter(newTags);
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
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
            placeholder={""}
            className="pl-10"
            defaultValue={searchParams?.get("search") ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              const timeoutId = setTimeout(() => {
                updateFilters("search", value || null);
              }, 500);
              return () => clearTimeout(timeoutId);
            }}
          />
        </div>
        
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
          <div className="rounded-lg border p-4 space-y-4">
            
            {/* Client Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="clientType">{""}</Label>
              <Select
                defaultValue={searchParams?.get("clientType") ?? "all"}
                onValueChange={(value) => updateFilters("clientType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={""} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{""}</SelectItem>
                  <SelectItem value={ClientType.PERSON}>Person</SelectItem>
                  <SelectItem value={ClientType.COMPANY}>Company</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <Label>{""}</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
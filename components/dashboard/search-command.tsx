"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SidebarNavItem } from "@/types";
import type { SearchResults } from "@/types";
import { searchEntities } from "@/actions/search";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Icons } from "@/components/shared/icons";

export function SearchCommand({ links }: { links: SidebarNavItem[] }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<SearchResults | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounced search effect
  React.useEffect(() => {
    // Reset results if query is too short
    if (query.length < 2) {
      setResults(null);
      setError(null);
      return;
    }

    // Debounce search by 300ms
    const timer = setTimeout(() => {
      fetchResults(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchResults = React.useCallback(async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await searchEntities({ 
        q: searchQuery, 
        limit: 10,
      });

      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError("Search unavailable. Please try again.");
        setResults(null);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed. Check your connection.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-72",
        )}
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex">
          Search
          <span className="hidden sm:inline-flex">&nbsp;properties, clients & pages</span>...
        </span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.45rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog 
        open={open} 
        onOpenChange={setOpen}
        aria-label="Search properties, clients, and pages"
      >
        <CommandInput 
          placeholder="Type to search properties, clients, and pages..." 
          value={query}
          onValueChange={setQuery}
          aria-label="Search input"
          aria-describedby="search-instructions"
        />
        <div id="search-instructions" className="sr-only">
          Type at least 2 characters to search. Use arrow keys to navigate results and Enter to select.
        </div>
        <CommandList aria-live="polite" aria-label="Search results">
          <CommandEmpty>
            {error ? error : "No results found. Try different keywords."}
          </CommandEmpty>

          {/* Properties Section */}
          {results?.properties && results.properties.length > 0 && (
            <CommandGroup heading="Properties">
              {results.properties.map((property) => (
                <CommandItem
                  key={property.id}
                  onSelect={() => {
                    runCommand(() => router.push(property.href));
                  }}
                >
                  <Icons.home className="mr-2 size-5" />
                  <div className="flex flex-col">
                    <div>{property.label}</div>
                    <div className="text-sm text-muted-foreground">{property.subtitle}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Clients Section */}
          {results?.clients && results.clients.length > 0 && (
            <CommandGroup heading="Clients">
              {results.clients.map((client) => (
                <CommandItem
                  key={client.id}
                  onSelect={() => {
                    runCommand(() => router.push(client.href));
                  }}
                >
                  <Icons.user className="mr-2 size-5" />
                  <div className="flex flex-col">
                    <div>{client.label}</div>
                    <div className="text-sm text-muted-foreground">{client.subtitle}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Navigation Links */}
          {links.map((section) => (
            <CommandGroup key={section.title} heading={section.title}>
              {section.items.map((item) => {
                const Icon = Icons[item.icon || "arrowRight"];
                return (
                  <CommandItem
                    key={item.title}
                    onSelect={() => {
                      runCommand(() => router.push(item.href as string));
                    }}
                  >
                    <Icon className="mr-2 size-5" />
                    {item.title}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

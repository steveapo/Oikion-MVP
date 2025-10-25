"use client";

/**
 * Language Switcher Component
 * 
 * Allows users to switch between available locales.
 * Saves preference to user profile and updates the URL.
 */

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Check, Globe, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { updateUserLocale } from "@/actions/locale";
import { locales, getLocaleDisplayName, getLocaleFlag } from "@/lib/i18n-utils";
import { toast } from "sonner";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      // Show loading toast immediately
      const loadingToastId = toast.loading("Translating Language...", {
        id: "locale-switch",
      });

      try {
        // Update user preference in database
        const result = await updateUserLocale(newLocale, pathname);

        if (!result.success) {
          toast.error("Failed to change language", { id: "locale-switch" });
          return;
        }

        setIsOpen(false);
        
        // Show success toast after a brief delay for smooth transition
        setTimeout(() => {
          toast.success("Language updated!", { id: "locale-switch" });
        }, 2000);

        // Refresh in place; URL stays unprefixed. Locale comes from cookie.
        router.refresh();
      } catch (error) {
        console.error("Failed to change language:", error);
        toast.error("Failed to change language", { id: "locale-switch" });
      }
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 px-0"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>{getLocaleFlag(locale)}</span>
              <span>{getLocaleDisplayName(locale)}</span>
            </span>
            {currentLocale === locale && (
              <Check className="ml-2 h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

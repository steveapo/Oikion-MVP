"use client";

import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UpgradeCard() {
  const t = useTranslations("navigation");

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm dark:border-amber-800/50 dark:from-amber-950/20 dark:to-orange-950/20 md:max-xl:rounded-none md:max-xl:border-none md:max-xl:shadow-none">
      <CardHeader className="space-y-3 md:max-xl:px-4">
        <div className="flex items-start gap-2.5">
          <div className="rounded-full bg-amber-100 p-1.5 dark:bg-amber-900/40">
            <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 space-y-1">
            <CardTitle className="text-sm font-semibold leading-tight text-amber-900 dark:text-amber-50">
              {t("testingVersion.title")}
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed text-amber-700/90 dark:text-amber-300/80">
              {t("testingVersion.description")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

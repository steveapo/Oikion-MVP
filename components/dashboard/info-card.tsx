import { Users } from "lucide-react"
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function InfoCard() {
  const t = useTranslations("admin.widgets.subscriptions");
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('title')}</CardTitle>
        <Users className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{t('value')}</div>
        <p className="text-xs text-muted-foreground">{t('change')}</p>
      </CardContent>
    </Card>
  )
}

"use server";

import { unstable_cache, revalidateTag } from "next/cache";
import { getProperties } from "@/actions/properties";
import { getClients } from "@/actions/clients";
import { getActivities } from "@/actions/activities";

export async function getDashboardData() {
  const cached = unstable_cache(
    async () => {
      const [properties, clients, activities] = await Promise.all([
        getProperties({ limit: 5, page: 1 }).catch(() => ({ properties: [], totalCount: 0, page: 1, totalPages: 0 })),
        getClients({ limit: 5, page: 1 }).catch(() => ({ clients: [], totalCount: 0, page: 1, totalPages: 0 })),
        getActivities({ limit: 10, page: 1 }).catch(() => ({ activities: [], totalCount: 0, page: 1, totalPages: 0 })),
      ]);
      return { properties, clients, activities };
    },
    ["dashboard:data"],
    { tags: ["dashboard:overview"], revalidate: 120 }
  );

  return cached();
}

export function revalidateDashboard() {
  revalidateTag("dashboard:overview");
}



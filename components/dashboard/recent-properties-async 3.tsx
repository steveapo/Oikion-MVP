import { getProperties } from "@/actions/properties";
import { RecentProperties } from "@/components/dashboard/recent-properties";

export async function RecentPropertiesAsync() {
  const { properties } = await getProperties({ limit: 5, page: 1 });
  return <RecentProperties properties={properties} />;
}



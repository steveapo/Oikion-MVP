import { getClients } from "@/actions/clients";
import { RecentClients } from "@/components/dashboard/recent-clients";

export async function RecentClientsAsync() {
  const { clients } = await getClients({ limit: 5, page: 1 });
  return <RecentClients clients={clients} />;
}



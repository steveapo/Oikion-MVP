import Link from "next/link";
import { Users, Mail, Phone, Building2, User } from "lucide-react";
import type { ClientType } from "@prisma/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  clientType: ClientType;
  tags?: any;
  _count?: {
    interactions: number;
    notes: number;
    tasks: number;
  };
  createdAt: Date;
}

interface RecentClientsProps {
  clients: Client[];
}

export function RecentClients({ clients }: RecentClientsProps) {
  if (clients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {""}
          </CardTitle>
          <CardDescription>{""}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">{""}</p>
            <Link href="/dashboard/relations/new">
              <Button className="mt-4" size="sm">
                {""}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {""}
            </CardTitle>
            <CardDescription>{""}</CardDescription>
          </div>
          <Link href="/dashboard/relations">
            <Button variant="ghost" size="sm">
              {""}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clients.map((client) => {
            const ClientIcon = client.clientType === "COMPANY" ? Building2 : User;
            
            return (
              <Link
                key={client.id}
                href={`/dashboard/relations/${client.id}`}
                className="block"
              >
                <div className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <ClientIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm truncate">
                        {client.name}
                      </p>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-xs"
                      >
                        {client.clientType}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                    {client._count && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{client._count.interactions} {""}</span>
                        <span>•</span>
                        <span>{client._count.notes} {""}</span>
                        {client._count.tasks > 0 && (
                          <>
                            <span>•</span>
                            <span>{client._count.tasks} {""}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

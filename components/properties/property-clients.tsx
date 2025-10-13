"use client";

import Link from "next/link";
import { User as UserIcon, Building2, Phone, Mail, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Client {
  id: string;
  name: string;
  clientType: "PERSON" | "COMPANY";
  email?: string | null;
  phone?: string | null;
  interactionCount: number;
}

interface PropertyClientsProps {
  clients: Client[];
}

export function PropertyClients({ clients }: PropertyClientsProps) {
  if (clients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Associated Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground">
            No clients have interacted with this property yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Associated Clients ({clients.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-start justify-between rounded-lg border p-3 hover:bg-muted/50"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted flex-shrink-0">
                  {client.clientType === "PERSON" ? (
                    <UserIcon className="h-5 w-5" />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/relations/${client.id}`}
                      className="font-medium hover:underline truncate"
                    >
                      {client.name}
                    </Link>
                    <Badge variant="secondary" className="text-xs">
                      {client.clientType === "PERSON" ? "Person" : "Company"}
                    </Badge>
                  </div>
                  <div className="mt-1 space-y-1">
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
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>{client.interactionCount} interaction{client.interactionCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Link
                href={`/dashboard/relations/${client.id}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

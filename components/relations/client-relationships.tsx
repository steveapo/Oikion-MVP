"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, X, Building2, User as UserIcon, Briefcase, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/shared/icons";
import { createClientRelationship, deleteClientRelationship } from "@/actions/client-relationships";

interface Client {
  id: string;
  name: string;
  clientType: "PERSON" | "COMPANY";
  email?: string | null;
  phone?: string | null;
}

interface Relationship {
  id: string;
  relationshipType?: string;
  position?: string | null;
  toClient?: Client;
  fromClient?: Client;
  createdAt: Date;
}

interface ClientRelationshipsProps {
  clientId: string;
  clientType: "PERSON" | "COMPANY";
  relationshipsFrom: Relationship[];
  relationshipsTo: Relationship[];
  availableClients: Client[];
  canManage: boolean;
}

export function ClientRelationships({
  clientId,
  clientType,
  relationshipsFrom,
  relationshipsTo,
  availableClients,
  canManage,
}: ClientRelationshipsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [relationshipType, setRelationshipType] = useState<string>("OTHER");
  const [position, setPosition] = useState("");
  const [isPending, startTransition] = useTransition();

  const t = useTranslations("relations.relationships");
  const tClientType = useTranslations("relations.clientType");
  const tActions = useTranslations("relations.actions");

  const RELATIONSHIP_TYPES = [
    { value: "EMPLOYEE", label: t("types.EMPLOYEE"), description: t("typeDescriptions.EMPLOYEE") },
    { value: "PARTNER", label: t("types.PARTNER"), description: t("typeDescriptions.PARTNER") },
    { value: "VENDOR", label: t("types.VENDOR"), description: t("typeDescriptions.VENDOR") },
    { value: "CLIENT", label: t("types.CLIENT"), description: t("typeDescriptions.CLIENT") },
    { value: "REFERRAL", label: t("types.REFERRAL"), description: t("typeDescriptions.REFERRAL") },
    { value: "FAMILY", label: t("types.FAMILY"), description: t("typeDescriptions.FAMILY") },
    { value: "COLLEAGUE", label: t("types.COLLEAGUE"), description: t("typeDescriptions.COLLEAGUE") },
    { value: "OTHER", label: t("types.OTHER"), description: t("typeDescriptions.OTHER") },
  ];

  // Separate clients by type
  const persons = availableClients.filter(c => c.clientType === "PERSON");
  const companies = availableClients.filter(c => c.clientType === "COMPANY");

  const handleAddRelationship = () => {
    if (!selectedClientId) {
      toast.error(t("selectError"));
      return;
    }

    startTransition(async () => {
      try {
        const result = await createClientRelationship({
          fromClientId: clientId,
          toClientId: selectedClientId,
          relationshipType: relationshipType as any,
          position: position || undefined,
        });

        if (result.success) {
          toast.success(t("createSuccess"));
          setIsDialogOpen(false);
          setSelectedClientId("");
          setRelationshipType("OTHER");
          setPosition("");
          window.location.reload(); // Refresh to show new relationship
        } else {
          toast.error(result.error || t("createError"));
        }
      } catch (error) {
        toast.error(t("createError"));
      }
    });
  };

  const handleDeleteRelationship = (relationshipId: string) => {
    if (!confirm(t("deleteConfirm"))) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await deleteClientRelationship(relationshipId);
        if (result.success) {
          toast.success(t("deleteSuccess"));
          window.location.reload();
        } else {
          toast.error(result.error || t("deleteError"));
        }
      } catch (error) {
        toast.error(t("deleteError"));
      }
    });
  };

  const selectedClient = availableClients.find(c => c.id === selectedClientId);
  const showPositionField = selectedClient && 
    ((clientType === "PERSON" && selectedClient.clientType === "COMPANY") ||
     (clientType === "COMPANY" && selectedClient.clientType === "PERSON"));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>
              {clientType === "PERSON" ? t("descriptionPerson") : t("descriptionCompany")}
            </CardDescription>
          </div>
          {canManage && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="whitespace-nowrap shrink-0">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("addLink")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("createTitle")}</DialogTitle>
                  <DialogDescription>
                    {clientType === "PERSON" ? t("createDescription") : t("createDescriptionCompany")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t("selectLabel")}</Label>
                    <Select
                      value={selectedClientId}
                      onValueChange={setSelectedClientId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {persons.length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              {t("people")}
                            </div>
                            {persons.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4" />
                                  <span>{client.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                        {companies.length > 0 && (
                          <>
                            {persons.length > 0 && (
                              <div className="my-1 border-t" />
                            )}
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              {t("companies")}
                            </div>
                            {companies.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  <span>{client.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                        {persons.length === 0 && companies.length === 0 && (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                            {t("noAvailable")}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("typeLabel")}</Label>
                    <Select
                      value={relationshipType}
                      onValueChange={setRelationshipType}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{type.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {type.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {showPositionField && (
                    <div className="space-y-2">
                      <Label>{t("positionLabel")}</Label>
                      <Input
                        placeholder={t("positionPlaceholder")}
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        maxLength={200}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("positionDescription")}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isPending}
                    >
                      {tActions("cancel")}
                    </Button>
                    <Button
                      onClick={handleAddRelationship}
                      disabled={isPending || !selectedClientId}
                    >
                      {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                      {tActions("create")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {relationshipsFrom.length === 0 && relationshipsTo.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {t("noRelationships")}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Outgoing relationships (from this client) */}
            {relationshipsFrom.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t("linkedTo")}
                </h4>
                <div className="space-y-2">
                  {relationshipsFrom.map((rel) => (
                    <div
                      key={rel.id}
                      className="flex items-start justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {rel.toClient?.clientType === "PERSON" ? (
                            <UserIcon className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/relations/${rel.toClient?.id}`}
                              className="font-medium hover:underline"
                            >
                              {rel.toClient?.name}
                            </Link>
                            <Badge variant="secondary" className="text-xs">
                              {tClientType(rel.toClient?.clientType || "PERSON")}
                            </Badge>
                          </div>
                          {rel.relationshipType && (
                            <div className="text-xs text-muted-foreground">
                              {RELATIONSHIP_TYPES.find(t => t.value === rel.relationshipType)?.label || rel.relationshipType}
                            </div>
                          )}
                          {rel.position && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Briefcase className="h-3 w-3" />
                              <span>{rel.position}</span>
                            </div>
                          )}
                          {(rel.toClient?.email || rel.toClient?.phone) && (
                            <p className="text-xs text-muted-foreground">
                              {rel.toClient?.email || rel.toClient?.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteRelationship(rel.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Incoming relationships (to this client) */}
            {relationshipsTo.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t("linkedFrom")}
                </h4>
                <div className="space-y-2">
                  {relationshipsTo.map((rel) => (
                    <div
                      key={rel.id}
                      className="flex items-start justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {rel.fromClient?.clientType === "PERSON" ? (
                            <UserIcon className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/relations/${rel.fromClient?.id}`}
                              className="font-medium hover:underline"
                            >
                              {rel.fromClient?.name}
                            </Link>
                            <Badge variant="secondary" className="text-xs">
                              {tClientType(rel.fromClient?.clientType || "PERSON")}
                            </Badge>
                          </div>
                          {rel.relationshipType && (
                            <div className="text-xs text-muted-foreground">
                              {RELATIONSHIP_TYPES.find(t => t.value === rel.relationshipType)?.label || rel.relationshipType}
                            </div>
                          )}
                          {rel.position && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Briefcase className="h-3 w-3" />
                              <span>{rel.position}</span>
                            </div>
                          )}
                          {(rel.fromClient?.email || rel.fromClient?.phone) && (
                            <p className="text-xs text-muted-foreground">
                              {rel.fromClient?.email || rel.fromClient?.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteRelationship(rel.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

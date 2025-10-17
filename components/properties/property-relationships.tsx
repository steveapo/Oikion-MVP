"use client";

import { useState } from "react";
import { Plus, X, User, Building2, Trash2, Users } from "lucide-react";

// Define PropertyRelationType since Prisma client may not be regenerated yet
type PropertyRelationType = 
  | "OWNER"
  | "CO_OWNER"
  | "INVESTOR"
  | "HEIR"
  | "TENANT"
  | "BUYER"
  | "SELLER"
  | "INTERESTED"
  | "OTHER";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createPropertyRelationship, deletePropertyRelationship } from "@/actions/property-relationships";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Client {
  id: string;
  name: string;
  clientType: string;
  email?: string | null;
  phone?: string | null;
}

interface PropertyRelationship {
  id: string;
  relationshipType: PropertyRelationType;
  notes?: string | null;
  client: Client;
  createdAt: Date;
}

interface PropertyRelationshipsProps {
  propertyId: string;
  relationships: PropertyRelationship[];
  availableClients: Client[];
  canEdit: boolean;
}

const relationshipTypeLabels: Record<PropertyRelationType, string> = {
  OWNER: "Owner",
  CO_OWNER: "Co-Owner",
  INVESTOR: "Investor",
  HEIR: "Heir",
  TENANT: "Tenant",
  BUYER: "Buyer",
  SELLER: "Seller",
  INTERESTED: "Interested",
  OTHER: "Other",
};

const relationshipTypeColors: Record<PropertyRelationType, string> = {
  OWNER: "bg-purple-100 text-purple-800 border-purple-200",
  CO_OWNER: "bg-blue-100 text-blue-800 border-blue-200",
  INVESTOR: "bg-green-100 text-green-800 border-green-200",
  HEIR: "bg-orange-100 text-orange-800 border-orange-200",
  TENANT: "bg-cyan-100 text-cyan-800 border-cyan-200",
  BUYER: "bg-emerald-100 text-emerald-800 border-emerald-200",
  SELLER: "bg-amber-100 text-amber-800 border-amber-200",
  INTERESTED: "bg-gray-100 text-gray-800 border-gray-200",
  OTHER: "bg-slate-100 text-slate-800 border-slate-200",
};

export function PropertyRelationships({
  propertyId,
  relationships,
  availableClients,
  canEdit,
}: PropertyRelationshipsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [relationshipType, setRelationshipType] = useState<PropertyRelationType>("INTERESTED");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient) {
      toast.error("Please select a relation");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPropertyRelationship({
        propertyId,
        clientId: selectedClient,
        relationshipType,
        notes,
      });

      if (result.success) {
        toast.success("Relationship created successfully");
        setIsOpen(false);
        setSelectedClient("");
        setRelationshipType("INTERESTED");
        setNotes("");
      } else {
        toast.error(result.error || "Failed to create relationship");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (relationshipId: string) => {
    try {
      const result = await deletePropertyRelationship(relationshipId);

      if (result.success) {
        toast.success("Relationship deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete relationship");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Linked Relations
            </CardTitle>
            <CardDescription>
              Relations associated with this property
            </CardDescription>
          </div>
          {canEdit && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Link Relation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Link Relation to Property</DialogTitle>
                  <DialogDescription>
                    Associate a relation with this property and specify their role.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Select Relation</Label>
                    {availableClients.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
                        <Users className="mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="mb-3 text-sm text-muted-foreground">
                          No relations available.
                        </p>
                        <Link href="/dashboard/relations/new">
                          <Button size="sm" variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Relation
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Select value={selectedClient} onValueChange={setSelectedClient}>
                        <SelectTrigger id="client">
                          <SelectValue placeholder="Choose a relation..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableClients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              <div className="flex items-center gap-2">
                                {client.clientType === "PERSON" ? (
                                  <User className="h-4 w-4" />
                                ) : (
                                  <Building2 className="h-4 w-4" />
                                )}
                                <span>{client.name}</span>
                                {client.email && (
                                  <span className="text-xs text-muted-foreground">
                                    ({client.email})
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relationshipType">Relationship Type</Label>
                    <Select
                      value={relationshipType}
                      onValueChange={(value) => setRelationshipType(value as PropertyRelationType)}
                    >
                      <SelectTrigger id="relationshipType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(relationshipTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional details..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      {notes.length}/500 characters
                    </p>
                  </div>

                  {availableClients.length > 0 && (
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Relationship"}
                      </Button>
                    </div>
                  )}
                  {availableClients.length === 0 && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                      >
                        Close
                      </Button>
                    </div>
                  )}
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {relationships.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Users className="mb-4 h-10 w-10 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">No linked relations</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Link relations to this property to track ownership, interest, and involvement.
            </p>
            {canEdit && (
              <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Link First Relation
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {relationships.map((relationship) => (
              <div
                key={relationship.id}
                className="flex items-start justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {relationship.client.clientType === "PERSON" ? (
                      <User className="h-5 w-5 text-primary" />
                    ) : (
                      <Building2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/relations/${relationship.client.id}`}
                        className="font-semibold hover:underline"
                      >
                        {relationship.client.name}
                      </Link>
                      <Badge
                        variant="outline"
                        className={relationshipTypeColors[relationship.relationshipType]}
                      >
                        {relationshipTypeLabels[relationship.relationshipType]}
                      </Badge>
                    </div>
                    <div className="mt-1 flex gap-3 text-sm text-muted-foreground">
                      {relationship.client.email && <span>{relationship.client.email}</span>}
                      {relationship.client.phone && <span>{relationship.client.phone}</span>}
                    </div>
                    {relationship.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">{relationship.notes}</p>
                    )}
                  </div>
                </div>
                {canEdit && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Relationship?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will unlink {relationship.client.name} from this property. This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(relationship.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

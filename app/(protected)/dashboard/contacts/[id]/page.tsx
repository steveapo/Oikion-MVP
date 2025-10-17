import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Plus, Phone, Mail, Building, User, Calendar, MessageSquare, CheckSquare } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { getClient } from "@/actions/clients";
import { canCreateContent, canDeleteContent } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactTimeline } from "@/components/contacts/contact-timeline";
import { AddInteractionModal } from "@/components/contacts/add-interaction-modal";
import { AddNoteModal } from "@/components/contacts/add-note-modal";
import { AddTaskModal } from "@/components/contacts/add-task-modal";
import { constructMetadata } from "@/lib/utils";
import { ClientType } from "@prisma/client";

interface ContactDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ContactDetailPageProps) {
  try {
    const client = await getClient(params.id);
    
    return constructMetadata({
      title: `${client.name} - Oikion`,
      description: `Contact details for ${client.name}`,
    });
  } catch {
    return constructMetadata({
      title: "Contact Not Found - Oikion",
      description: "The requested contact could not be found.",
    });
  }
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    notFound();
  }

  let client;
  try {
    client = await getClient(params.id);
  } catch {
    notFound();
  }

  const canEdit = canCreateContent(user.role);
  const canDelete = canDeleteContent(user.role, client.createdBy === user.id);

  const getClientTypeIcon = (type: ClientType) => {
    return type === ClientType.PERSON ? User : Building;
  };

  const ClientTypeIcon = getClientTypeIcon(client.clientType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/contacts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contacts
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          {canEdit && (
            <>
              <AddInteractionModal clientId={client.id}>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Interaction
                </Button>
              </AddInteractionModal>
              
              <AddNoteModal clientId={client.id}>
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </AddNoteModal>
              
              <AddTaskModal clientId={client.id}>
                <Button variant="outline" size="sm">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </AddTaskModal>
              
              <Link href={`/dashboard/contacts/${client.id}/edit`}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Contact
                </Button>
              </Link>
            </>
          )}
          {canDelete && (
            <Button variant="outline" className="text-destructive hover:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <ClientTypeIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{client.name}</CardTitle>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge variant="outline" className="capitalize">
                        {client.clientType.toLowerCase()}
                      </Badge>
                      {client.tags && Array.isArray(client.tags) && client.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {client.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Methods */}
              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {client.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Primary Email</div>
                        <a href={`mailto:${client.email}`} className="text-sm text-blue-600 hover:underline">
                          {client.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {client.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Primary Phone</div>
                        <a href={`tel:${client.phone}`} className="text-sm text-blue-600 hover:underline">
                          {client.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {client.secondaryEmail && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Secondary Email</div>
                        <a href={`mailto:${client.secondaryEmail}`} className="text-sm text-blue-600 hover:underline">
                          {client.secondaryEmail}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {client.secondaryPhone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Secondary Phone</div>
                        <a href={`tel:${client.secondaryPhone}`} className="text-sm text-blue-600 hover:underline">
                          {client.secondaryPhone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="interactions">Interactions</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  <ContactTimeline 
                    interactions={client.interactions}
                    notes={client.notes}
                    tasks={client.tasks}
                  />
                </TabsContent>
                
                <TabsContent value="interactions" className="mt-4">
                  <ContactTimeline 
                    interactions={client.interactions}
                    notes={[]}
                    tasks={[]}
                  />
                </TabsContent>
                
                <TabsContent value="notes" className="mt-4">
                  <ContactTimeline 
                    interactions={[]}
                    notes={client.notes}
                    tasks={[]}
                  />
                </TabsContent>
                
                <TabsContent value="tasks" className="mt-4">
                  <ContactTimeline 
                    interactions={[]}
                    notes={[]}
                    tasks={client.tasks}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{client.interactions.length}</div>
                  <div className="text-sm text-muted-foreground">Interactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{client.notes.length}</div>
                  <div className="text-sm text-muted-foreground">Notes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{client.tasks.length}</div>
                  <div className="text-sm text-muted-foreground">Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {client.tasks.filter(task => task.status === "COMPLETED").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Owner */}
          <Card>
            <CardHeader>
              <CardTitle>Created By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{client.creator.name || "Unknown"}</div>
                  <div className="text-sm text-muted-foreground">{client.creator.email}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Created {new Date(client.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          {/* Recent Interactions */}
          {client.interactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Interactions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.interactions.slice(0, 3).map((interaction) => (
                  <div key={interaction.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {interaction.interactionType.replace("_", " ").toLowerCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(interaction.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm line-clamp-2">{interaction.summary}</p>
                    {interaction.property && (
                      <Link 
                        href={`/dashboard/properties/${interaction.property.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Related to {interaction.property.propertyType.toLowerCase()} in{" "}
                        {interaction.property.address?.city}
                      </Link>
                    )}
                  </div>
                ))}
                
                {client.interactions.length > 3 && (
                  <div className="text-center">
                    <Button variant="ghost" size="sm">
                      View all {client.interactions.length} interactions
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
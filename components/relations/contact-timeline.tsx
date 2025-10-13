"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Phone, Calendar, Eye, CheckCircle, FileText, User, Plus } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AddInteractionModal } from "@/components/relations/add-interaction-modal";
import { AddNoteModal } from "@/components/relations/add-note-modal";
import { AddTaskModal } from "@/components/relations/add-task-modal";

interface Interaction {
  id: string;
  interactionType: string;
  summary: string;
  timestamp: Date;
  property?: {
    id: string;
    propertyType: string;
    address?: {
      city: string;
      region?: string;
    };
  } | null;
  creator: {
    name: string;
  };
}

interface Note {
  id: string;
  content: string;
  createdAt: Date;
  creator: {
    name: string;
  };
}

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
  creator: {
    name: string;
  };
  assignee?: {
    name: string;
  } | null;
}

interface ContactTimelineProps {
  interactions: Interaction[];
  notes: Note[];
  tasks: Task[];
  clientId: string;
  canManage: boolean;
}

export function ContactTimeline({ interactions, notes, tasks, clientId, canManage }: ContactTimelineProps) {
  const [activeTab, setActiveTab] = useState("all");
  // Combine all timeline items
  const timelineItems = [
    ...interactions.map(item => ({
      id: `interaction-${item.id}`,
      type: 'interaction' as const,
      title: `${item.interactionType.toLowerCase().replace('_', ' ')} interaction`,
      description: item.summary,
      date: item.timestamp,
      user: item.creator.name,
      icon: getInteractionIcon(item.interactionType),
      metadata: item.property ? {
        type: 'property',
        id: item.property.id,
        label: `${item.property.propertyType.toLowerCase()} in ${item.property.address?.city || 'Unknown'}`,
      } : null,
    })),
    ...notes.map(item => ({
      id: `note-${item.id}`,
      type: 'note' as const,
      title: 'Note added',
      description: item.content,
      date: item.createdAt,
      user: item.creator.name,
      icon: FileText,
      metadata: null,
    })),
    ...tasks.map(item => ({
      id: `task-${item.id}`,
      type: 'task' as const,
      title: item.title,
      description: `Status: ${item.status.toLowerCase()}${item.assignee ? ` • Assigned to ${item.assignee.name}` : ''}${item.dueDate ? ` • Due ${new Date(item.dueDate).toLocaleDateString()}` : ''}`,
      date: item.dueDate || new Date(),
      user: item.creator.name,
      icon: item.status === 'COMPLETED' ? CheckCircle : Calendar,
      metadata: null,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (timelineItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Interactions, notes, and tasks</CardDescription>
            </div>
            {canManage && (
              <div className="flex items-center gap-2">
                <AddInteractionModal clientId={clientId}>
                  <Button size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Interaction
                  </Button>
                </AddInteractionModal>
                <AddNoteModal clientId={clientId}>
                  <Button size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Note
                  </Button>
                </AddNoteModal>
                <AddTaskModal clientId={clientId}>
                  <Button size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </AddTaskModal>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground py-8">
            No activity yet. Start by adding an interaction, note, or task.
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
            <CardTitle>Activity</CardTitle>
            <CardDescription>
              {timelineItems.length} item{timelineItems.length !== 1 ? 's' : ''} ({interactions.length} interactions, {notes.length} notes, {tasks.length} tasks)
            </CardDescription>
          </div>
          {canManage && (
            <div className="flex items-center gap-2">
              <AddInteractionModal clientId={clientId}>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Interaction
                </Button>
              </AddInteractionModal>
              <AddNoteModal clientId={clientId}>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </AddNoteModal>
              <AddTaskModal clientId={clientId}>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </AddTaskModal>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({timelineItems.length})</TabsTrigger>
            <TabsTrigger value="interactions">Interactions ({interactions.length})</TabsTrigger>
            <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6 space-y-6">
            {timelineItems.map((item, index) => (
              <TimelineItem key={item.id} item={item} isLast={index === timelineItems.length - 1} />
            ))}
          </TabsContent>
          
          <TabsContent value="interactions" className="mt-6 space-y-6">
            {timelineItems.filter(item => item.type === 'interaction').length > 0 ? (
              timelineItems
                .filter(item => item.type === 'interaction')
                .map((item, index, arr) => (
                  <TimelineItem key={item.id} item={item} isLast={index === arr.length - 1} />
                ))
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                No interactions yet
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="notes" className="mt-6 space-y-6">
            {timelineItems.filter(item => item.type === 'note').length > 0 ? (
              timelineItems
                .filter(item => item.type === 'note')
                .map((item, index, arr) => (
                  <TimelineItem key={item.id} item={item} isLast={index === arr.length - 1} />
                ))
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                No notes yet
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-6 space-y-6">
            {timelineItems.filter(item => item.type === 'task').length > 0 ? (
              timelineItems
                .filter(item => item.type === 'task')
                .map((item, index, arr) => (
                  <TimelineItem key={item.id} item={item} isLast={index === arr.length - 1} />
                ))
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                No tasks yet
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TimelineItem({ item, isLast }: { item: any; isLast: boolean }) {
  const Icon = item.icon;
  
  return (
    <div className="relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-8 h-6 w-0.5 bg-border" />
      )}
      
      <div className="flex space-x-4">
        {/* Icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          <Icon className="h-4 w-4" />
        </div>
        
        {/* Content */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {item.description}
              </p>
              
              {/* Metadata */}
              {item.metadata && item.metadata.type === 'property' && (
                <Link 
                  href={`/dashboard/properties/${item.metadata.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Related to {item.metadata.label}
                </Link>
              )}
            </div>
            
            {/* Type badge */}
            <Badge variant="outline" className="ml-2 text-xs capitalize">
              {item.type}
            </Badge>
          </div>
          
          {/* Footer */}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{item.user}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(item.date), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getInteractionIcon(type: string) {
  switch (type) {
    case 'CALL':
      return Phone;
    case 'EMAIL':
      return MessageSquare;
    case 'MEETING':
      return Calendar;
    case 'VIEWING':
      return Eye;
    default:
      return MessageSquare;
  }
}
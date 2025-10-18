"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Phone, Calendar, Eye, CheckCircle, FileText, User } from "lucide-react";
import { Link } from "@/i18n/navigation";

import { Badge } from "@/components/ui/badge";

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
}

export function ContactTimeline({ interactions, notes, tasks }: ContactTimelineProps) {
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
      <div className="text-center text-sm text-muted-foreground py-8">
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timelineItems.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === timelineItems.length - 1;
        
        return (
          <div key={item.id} className="relative">
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
      })}
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
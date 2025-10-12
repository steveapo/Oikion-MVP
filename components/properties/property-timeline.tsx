"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Phone, Calendar, Eye, CheckCircle } from "lucide-react";

interface Interaction {
  id: string;
  interactionType: string;
  summary: string;
  timestamp: Date;
  client: {
    name: string;
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
  assignee: {
    name: string;
  } | null;
}

interface PropertyTimelineProps {
  interactions: Interaction[];
  notes: Note[];
  tasks: Task[];
}

export function PropertyTimeline({ interactions, notes, tasks }: PropertyTimelineProps) {
  // Combine all timeline items
  const timelineItems = [
    ...interactions.map(item => ({
      id: `interaction-${item.id}`,
      type: 'interaction' as const,
      title: `${item.interactionType.toLowerCase().replace('_', ' ')} ${item.client ? `with ${item.client.name}` : ''}`,
      description: item.summary,
      date: item.timestamp,
      user: item.creator.name,
      icon: getInteractionIcon(item.interactionType),
    })),
    ...notes.map(item => ({
      id: `note-${item.id}`,
      type: 'note' as const,
      title: 'Note added',
      description: item.content,
      date: item.createdAt,
      user: item.creator.name,
      icon: MessageSquare,
    })),
    ...tasks.map(item => ({
      id: `task-${item.id}`,
      type: 'task' as const,
      title: item.title,
      description: `Status: ${item.status.toLowerCase()}${item.assignee ? ` • Assigned to ${item.assignee.name}` : ''}`,
      date: item.dueDate || new Date(),
      user: item.creator.name,
      icon: item.status === 'COMPLETED' ? CheckCircle : Calendar,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (timelineItems.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {timelineItems.slice(0, 5).map((item) => {
        const Icon = item.icon;
        
        return (
          <div key={item.id} className="flex space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{item.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {item.description}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.date), { addSuffix: true })} by {item.user}
              </div>
            </div>
          </div>
        );
      })}
      
      {timelineItems.length > 5 && (
        <div className="text-center">
          <button className="text-xs text-muted-foreground hover:text-foreground">
            View all activity
          </button>
        </div>
      )}
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
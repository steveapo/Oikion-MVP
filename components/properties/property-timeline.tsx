"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { MessageSquare, Phone, Calendar as CalendarIcon, Eye, CheckCircle, Clock, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { updateTaskStatus } from "@/actions/interactions";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const handleTaskStatusUpdate = async (taskId: string, status: "PENDING" | "COMPLETED" | "CANCELLED") => {
    setUpdatingTaskId(taskId);
    try {
      await updateTaskStatus(taskId, status);
      toast.success(`Task ${status.toLowerCase()}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update task");
    } finally {
      setUpdatingTaskId(null);
    }
  };
  
  // Define timeline item type
  type TimelineItem = {
    id: string;
    type: 'interaction' | 'note' | 'task';
    title: string;
    description: string;
    date: Date;
    user: string;
    icon: any;
    taskId?: string;
    status?: string;
    dueDate?: Date | null;
  };

  // Combine all timeline items
  const timelineItems: TimelineItem[] = [
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
      taskId: item.id,
      type: 'task' as const,
      title: item.title,
      description: `Status: ${item.status.toLowerCase()}${item.assignee ? ` • Assigned to ${item.assignee.name}` : ''}`,
      date: item.dueDate || new Date(),
      user: item.creator.name,
      icon: item.status === 'COMPLETED' ? CheckCircle : CalendarIcon,
      status: item.status,
      dueDate: item.dueDate,
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
        const isTask = item.type === 'task';
        const isPendingTask = isTask && item.status === 'PENDING';
        const isUpdating = updatingTaskId === item.taskId;
        
        return (
          <div key={item.id} className="flex space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted flex-shrink-0">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.date), { addSuffix: true })} by {item.user}
                  </div>
                </div>
                
                {/* Quick Actions for Pending Tasks */}
                {isPendingTask && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleTaskStatusUpdate(item.taskId!, 'COMPLETED')}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={() => handleTaskStatusUpdate(item.taskId!, 'CANCELLED')}
                      disabled={isUpdating}
                    >
                      <XIcon className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
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
      return CalendarIcon;
    case 'VIEWING':
      return Eye;
    default:
      return MessageSquare;
  }
}
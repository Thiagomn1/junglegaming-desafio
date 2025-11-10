export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  DONE = "DONE",
}

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: Date | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignees: number[];
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  dueDate?: Date;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignees?: number[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: Date;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignees?: number[];
}

export enum TaskHistoryAction {
  CREATED = "created",
  UPDATED = "updated",
  COMMENTED = "commented",
  DELETED = "deleted",
}

export interface Comment {
  id: number;
  text: string;
  authorId: number;
  taskId: number;
  createdAt: Date;
}

export interface CreateCommentDto {
  text: string;
}

export interface TaskHistoryEntry {
  id: number;
  taskId: number;
  action: TaskHistoryAction;
  userId: number | null;
  metadata: Record<string, unknown> | null;
  timestamp: Date;
}

export interface TaskCreatedEvent {
  taskId: number;
  title: string;
  createdBy: number;
  assignees: number[];
  priority: TaskPriority;
  dueDate: Date | null;
  timestamp: string;
}

export interface TaskUpdatedEvent {
  taskId: number;
  updatedBy: number;
  changes: Record<string, unknown>;
  timestamp: string;
}

export interface TaskDeletedEvent {
  taskId: number;
  deletedBy: number;
  timestamp: string;
}

export interface TaskCommentCreatedEvent {
  commentId: number;
  taskId: number;
  authorId: number;
  text: string;
  createdAt: Date;
  taskAuthorId: number;
  taskTitle: string;
}

export interface TaskWithMetadata extends Task {
  isOverdue: boolean;
  isDueSoon: boolean;
  daysUntilDue: number | null;
}

// Task Priority Enum
export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

// Task Status Enum
export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  DONE = "DONE",
}

// Task Entity Type
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

// DTOs
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

// RabbitMQ Event Payloads
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
  changes: Record<string, any>;
  timestamp: string;
}

export interface TaskDeletedEvent {
  taskId: number;
  deletedBy: number;
  timestamp: string;
}

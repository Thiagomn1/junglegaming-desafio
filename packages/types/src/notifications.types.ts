export enum NotificationType {
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_DELETED = 'task.deleted',
  TASK_ASSIGNED = 'task.assigned',
  TASK_STATUS_CHANGED = 'task.status_changed',
  COMMENT_CREATED = 'task.comment.created',
}

export interface NotificationPayload {
  type: NotificationType;
  userId: number;
  taskId: number;
  message: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  userId: number;
  taskId: number;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface WebSocketNotification {
  id: number;
  type: NotificationType;
  message: string;
  taskId: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

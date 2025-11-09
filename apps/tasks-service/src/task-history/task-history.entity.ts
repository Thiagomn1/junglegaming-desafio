import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from '../tasks/task.entity';

export enum TaskHistoryAction {
  CREATED = 'created',
  UPDATED = 'updated',
  COMMENTED = 'commented',
  DELETED = 'deleted',
}

@Entity('task_history')
export class TaskHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  taskId: number;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column({
    type: 'enum',
    enum: TaskHistoryAction,
  })
  action: TaskHistoryAction;

  @Column({ nullable: true })
  userId: number;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  timestamp: Date;
}

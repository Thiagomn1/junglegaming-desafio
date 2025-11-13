import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '@jungle/types';

export class AssigneeDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john_doe' })
  username: string;
}

export class TaskResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Implementar nova feature' })
  title: string;

  @ApiProperty({ example: 'Descrição detalhada da tarefa' })
  description: string;

  @ApiProperty({ example: '2025-11-15T23:59:59.000Z', nullable: true })
  dueDate: Date | null;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.HIGH })
  priority: TaskPriority;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.TODO })
  status: TaskStatus;

  @ApiProperty({ example: [1, 2], type: [Number] })
  assignees: number[];

  @ApiProperty({
    example: [{ id: 1, username: 'john_doe' }, { id: 2, username: 'jane_doe' }],
    type: [AssigneeDto],
    description: 'Lista de usuários atribuídos com seus usernames'
  })
  assigneesDetails?: AssigneeDto[];

  @ApiProperty({ example: 5 })
  createdBy: number;

  @ApiProperty({ example: 'john_doe', description: 'Username do criador da tarefa' })
  createdByUsername?: string;

  @ApiProperty({ example: '2025-11-08T01:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-11-08T01:00:00.000Z' })
  updatedAt: Date;
}

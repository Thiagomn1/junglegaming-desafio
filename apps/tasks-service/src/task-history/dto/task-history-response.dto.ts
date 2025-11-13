import { ApiProperty } from '@nestjs/swagger';
import { TaskHistoryAction } from '@jungle/types';

export class TaskHistoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 5 })
  taskId: number;

  @ApiProperty({ enum: TaskHistoryAction, example: TaskHistoryAction.UPDATED })
  action: TaskHistoryAction;

  @ApiProperty({ example: 3, nullable: true })
  userId: number | null;

  @ApiProperty({ example: 'john_doe', nullable: true })
  username?: string | null;

  @ApiProperty({
    example: { changes: { status: 'DONE' } },
    nullable: true
  })
  metadata: Record<string, unknown> | null;

  @ApiProperty({ example: '2025-11-13T10:30:00.000Z' })
  timestamp: Date;
}

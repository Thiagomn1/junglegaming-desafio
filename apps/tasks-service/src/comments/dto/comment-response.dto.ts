import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Este é um comentário sobre a tarefa' })
  text: string;

  @ApiProperty({ example: 1 })
  authorId: number;

  @ApiProperty({
    example: 'john_doe',
    description: 'Username do autor do comentário',
  })
  authorName?: string;

  @ApiProperty({ example: 1 })
  taskId: number;

  @ApiProperty({ example: '2025-11-08T10:00:00.000Z' })
  createdAt: Date;
}

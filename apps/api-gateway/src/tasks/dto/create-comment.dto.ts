import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Texto do comentário',
    example: 'Este é um comentário sobre a tarefa',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  text: string;
}

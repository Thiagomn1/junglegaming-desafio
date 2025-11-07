import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de atualização',
  })
  @IsString({ message: 'Token de atualização deve ser uma string' })
  @IsNotEmpty({ message: 'Token de atualização é obrigatório' })
  refreshToken: string;
}

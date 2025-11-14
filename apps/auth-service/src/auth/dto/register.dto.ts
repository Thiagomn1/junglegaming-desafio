import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@exemplo.com',
    description: 'Endereço de email do usuário',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    example: 'joaosilva',
    description: 'Nome de usuário para a conta',
  })
  @IsString({ message: 'Nome de usuário deve ser uma string' })
  @IsNotEmpty({ message: 'Nome de usuário é obrigatório' })
  @Matches(/^[a-zA-Z0-9_-]{3,20}$/, {
    message: 'Username deve ter 3-20 caracteres (letras, números, _ ou -)',
  })
  username: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Senha (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;
}

import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  IsNumber,
  MinLength,
} from "class-validator";
import { TaskPriority, TaskStatus } from "@jungle/types";

export class CreateTaskDto {
  @ApiProperty({
    description: "Título da tarefa",
    example: "Implementar autenticação JWT",
  })
  @IsString({ message: "Título deve ser uma string" })
  @IsNotEmpty({ message: "Título é obrigatório" })
  @MinLength(3, { message: "Título deve ter no mínimo 3 caracteres" })
  title: string;

  @ApiProperty({
    description: "Descrição detalhada da tarefa",
    example:
      "Implementar sistema de autenticação usando JWT com refresh tokens",
  })
  @IsString({ message: "Descrição deve ser uma string" })
  @IsNotEmpty({ message: "Descrição é obrigatória" })
  description: string;

  @ApiProperty({
    description: "Data de vencimento da tarefa",
    example: "2025-12-31T23:59:59.000Z",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "Data de vencimento deve ser uma data válida" })
  dueDate?: string;

  @ApiProperty({
    description: "Prioridade da tarefa",
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    default: TaskPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TaskPriority, { message: "Prioridade inválida" })
  priority?: TaskPriority;

  @ApiProperty({
    description: "Status da tarefa",
    enum: TaskStatus,
    example: TaskStatus.TODO,
    default: TaskStatus.TODO,
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: "Status inválido" })
  status?: TaskStatus;

  @ApiProperty({
    description: "IDs dos usuários atribuídos à tarefa",
    example: [1, 2, 3],
    required: false,
    type: [Number],
  })
  @IsOptional()
  @IsArray({ message: "Assignees deve ser um array" })
  @IsNumber({}, { each: true, message: "Cada assignee deve ser um número" })
  assignees?: number[];
}

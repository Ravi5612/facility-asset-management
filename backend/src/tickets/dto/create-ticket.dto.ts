import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { TicketPriority } from '@prisma/client';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  assignedToDeptId: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

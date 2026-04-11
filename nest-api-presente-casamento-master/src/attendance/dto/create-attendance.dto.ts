import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({ example: 'Maria Silva', description: 'Nome completo do convidado' })
  @IsString()
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ example: 'maria@email.com', description: 'E-mail para contato' })
  @IsEmail()
  @MaxLength(160)
  email: string;

  @ApiPropertyOptional({
    example: '+55 11 98888-7777',
    description: 'Telefone para contato (opcional)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiProperty({
    example: true,
    description: 'Se a pessoa confirmou presença no casamento',
  })
  @IsBoolean()
  isAttending: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Quantidade de acompanhantes',
    minimum: 0,
    maximum: 5,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  companions?: number;

  @ApiPropertyOptional({
    example: 'Sou vegetariana, se possível.',
    description: 'Mensagem opcional para os noivos',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

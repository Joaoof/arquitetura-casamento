import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttendanceResponseDto {
  @ApiProperty({ example: 'f8a4f4f7-0e87-4944-a391-8d52f7f0f131' })
  id: string;

  @ApiProperty({ example: 'Maria Silva' })
  fullName: string;

  @ApiProperty({ example: 'maria@email.com' })
  email: string;

  @ApiPropertyOptional({ example: '+55 11 98888-7777' })
  phone?: string | null;

  @ApiProperty({ example: true })
  isAttending: boolean;

  @ApiProperty({ example: 1 })
  companions: number;

  @ApiPropertyOptional({ example: 'Sou vegetariana, se possível.' })
  message?: string | null;

  @ApiProperty({ example: '2026-04-11T10:30:00.000Z' })
  createdAt: Date;
}

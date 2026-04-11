import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { AttendanceResponseDto } from './dto/attendance-response.dto';

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Formulário público de confirmação de presença' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Confirmação salva com sucesso',
    type: AttendanceResponseDto,
  })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listagem de confirmações para o painel administrativo',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Busca por nome e e-mail',
  })
  @ApiQuery({
    name: 'isAttending',
    required: false,
    enum: ['true', 'false'],
    description: 'Filtra presença confirmada/recusada',
  })
  findAllForAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isAttending') isAttending?: string,
  ) {
    return this.attendanceService.findAllForAdmin({
      page,
      limit,
      search,
      isAttending,
    });
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Indicadores para cards do painel admin (total/confirmados/recusados)',
  })
  stats() {
    return this.attendanceService.stats();
  }
}

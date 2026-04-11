import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    try {
      return await this.prisma.attendance.create({
        data: {
          fullName: createAttendanceDto.fullName.trim(),
          email: createAttendanceDto.email.trim().toLowerCase(),
          phone: createAttendanceDto.phone?.trim(),
          isAttending: createAttendanceDto.isAttending,
          companions: createAttendanceDto.companions ?? 0,
          message: createAttendanceDto.message?.trim(),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Este e-mail já confirmou presença.');
      }

      throw error;
    }
  }

  async findAllForAdmin(params: {
    page?: number;
    limit?: number;
    search?: string;
    isAttending?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Number(params.limit) || 20);
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceWhereInput = {};

    if (params.search?.trim()) {
      const term = params.search.trim();
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (params.isAttending === 'true') where.isAttending = true;
    if (params.isAttending === 'false') where.isAttending = false;

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async stats() {
    const [total, confirmed, declined, companions] = await Promise.all([
      this.prisma.attendance.count(),
      this.prisma.attendance.count({ where: { isAttending: true } }),
      this.prisma.attendance.count({ where: { isAttending: false } }),
      this.prisma.attendance.aggregate({
        _sum: {
          companions: true,
        },
        where: {
          isAttending: true,
        },
      }),
    ]);

    return {
      total,
      confirmed,
      declined,
      totalExpectedGuests: confirmed + (companions._sum.companions ?? 0),
    };
  }
}

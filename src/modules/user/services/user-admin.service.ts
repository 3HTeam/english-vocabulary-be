import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User, Prisma } from '@prisma/client';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UserAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(
    pagination: PaginationDto,
  ): Promise<{ users: UserWithoutPassword[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(pagination.search && {
        OR: [
          { email: { contains: pagination.search, mode: 'insensitive' } },
          { fullName: { contains: pagination.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        include: {
          level: true,
        },
      }),
      this.prisma.user.count({
        where,
      }),
    ]);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      users: usersWithoutPassword,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        level: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      if (dto.levelId) {
        const level = await this.prisma.level.findUnique({
          where: { id: dto.levelId },
        });
        if (!level) {
          throw new BadRequestException('Cấp độ không tồn tại');
        }
      }

      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.fullName !== undefined) {
        updateData.fullName = dto.fullName.trim();
      }
      if (dto.avatar !== undefined) {
        updateData.avatar = dto.avatar;
      }
      if (dto.phone !== undefined) {
        updateData.phone = dto.phone.trim();
      }
      if (dto.levelId !== undefined) {
        updateData.levelId = dto.levelId;
      }
      if (dto.targetLevel !== undefined) {
        updateData.targetLevel = dto.targetLevel;
      }
      if (dto.dailyGoal !== undefined) {
        updateData.dailyGoal = dto.dailyGoal;
      }
      if (dto.emailVerified !== undefined) {
        updateData.emailVerified = dto.emailVerified;
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          level: true,
        },
      });

      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
}

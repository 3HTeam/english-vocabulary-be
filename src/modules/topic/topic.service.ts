import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';
import { Topic } from '@prisma/client';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTopicDto, userId?: string): Promise<Topic> {
    try {
      if (!dto.name || !dto.name.trim()) {
        throw new BadRequestException('Tên chủ đề là bắt buộc');
      }

      if (!dto.imageUrl || !dto.imageUrl.trim()) {
        throw new BadRequestException('Ảnh chủ đề là bắt buộc');
      }

      const normalizedName = dto.name.trim();
      const duplicatedTopic = await this.prisma.topic.findFirst({
        where: {
          name: { equals: normalizedName, mode: 'insensitive' },
        },
      });

      if (duplicatedTopic) {
        throw new BadRequestException('Tên chủ đề đã tồn tại');
      }

      const topic = await this.prisma.topic.create({
        data: {
          name: normalizedName,
          imageUrl: dto.imageUrl.trim(),
          slug: this.buildSlug(dto.slug, dto.name),
          description: dto.description?.trim(),
          isActive: dto.isActive ?? true,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      return topic;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(
    pagination: PaginationDto,
    search?: string,
  ): Promise<{ topics: Topic[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const [topics, total] = await this.prisma.$transaction([
      this.prisma.topic.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where: { name: { contains: search, mode: 'insensitive' } },
      }),
      this.prisma.topic.count({
        where: { name: { contains: search, mode: 'insensitive' } },
      }),
    ]);

    return {
      topics,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<Topic> {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
    });

    if (!topic) {
      throw new NotFoundException('Không tìm thấy chủ đề');
    }

    return topic;
  }

  private buildSlug(slug: string | undefined, fallback?: string): string {
    const base = slug ?? fallback;

    if (!base) {
      throw new BadRequestException('Slug không hợp lệ');
    }

    const normalized = base
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!normalized) {
      throw new BadRequestException('Slug không hợp lệ');
    }

    return normalized;
  }

  async update(
    id: string,
    dto: UpdateTopicDto,
    userId?: string,
  ): Promise<Topic> {
    try {
      const existingTopic = await this.prisma.topic.findUnique({
        where: { id },
      });
      if (!existingTopic) {
        throw new NotFoundException('Không tìm thấy chủ đề');
      }

      if (
        !dto.name &&
        !dto.imageUrl &&
        !dto.slug &&
        !dto.description &&
        dto.isActive === undefined
      ) {
        throw new BadRequestException('Không có dữ liệu cập nhật');
      }

      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.name !== undefined) {
        updateData.name = dto.name.trim();
        if (dto.slug === undefined) {
          updateData.slug = this.buildSlug(undefined, dto.name);
        }
      }

      if (dto.imageUrl !== undefined) {
        updateData.imageUrl = dto.imageUrl.trim();
      }

      if (dto.slug !== undefined) {
        updateData.slug = this.buildSlug(dto.slug, dto.name);
      }

      if (dto.description !== undefined) {
        updateData.description = dto.description.trim();
      }

      if (dto.isActive !== undefined) {
        updateData.isActive = dto.isActive;
      }

      const topic = await this.prisma.topic.update({
        where: { id },
        data: updateData,
      });

      return topic;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existingTopic = await this.prisma.topic.findUnique({
        where: { id },
      });
      if (!existingTopic) {
        throw new NotFoundException('Không tìm thấy chủ đề');
      }

      await this.prisma.topic.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}

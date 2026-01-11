import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { Prisma, Vocabulary } from '@prisma/client';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';

@Injectable()
export class VocabularyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVocabularyDto, userId?: string): Promise<Vocabulary> {
    try {
      if (!dto.word || !dto.word.trim()) {
        throw new BadRequestException('Từ là bắt buộc');
      }

      if (!dto.meanings || dto.meanings.length === 0) {
        throw new BadRequestException('Phải có ít nhất một nghĩa');
      }

      const normalizedWord = dto.word.trim();
      const duplicatedVocabulary = await this.prisma.vocabulary.findFirst({
        where: {
          word: { equals: normalizedWord, mode: 'insensitive' },
          deletedAt: null,
        },
      });

      if (duplicatedVocabulary) {
        throw new BadRequestException('Từ vựng đã tồn tại');
      }

      const vocabulary = await this.prisma.vocabulary.create({
        data: {
          word: normalizedWord,
          translation: dto.translation?.trim(),
          phonetic: dto.phonetic?.trim(),
          imageUrl: dto.imageUrl?.trim(),
          audioUrlUs: dto.audioUrlUs?.trim(),
          audioUrlUk: dto.audioUrlUk?.trim(),
          audioUrlAu: dto.audioUrlAu?.trim(),
          topic: {
            connect: {
              id: dto.topicId,
            },
          },
          createdBy: userId,
          meanings: {
            create: dto.meanings.map((meaning) => ({
              partOfSpeech: meaning.partOfSpeech,
              synonyms: meaning.synonyms ?? [],
              antonyms: meaning.antonyms ?? [],
              definitions: {
                create: meaning.definitions.map((def) => ({
                  definition: def.definition.trim(),
                  translation: def.translation?.trim(),
                  example: def.example?.trim(),
                  exampleTranslation: def.exampleTranslation?.trim(),
                })),
              },
            })),
          },
        },
        include: {
          meanings: {
            include: {
              definitions: true,
            },
          },
        },
      });

      return vocabulary;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<{ vocabularies: Vocabulary[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.VocabularyWhereInput = {
      ...(pagination.search && {
        word: { contains: pagination.search, mode: 'insensitive' },
      }),
      ...(pagination.isDeleted != undefined && {
        isDeleted: pagination.isDeleted,
      }),
    };

    const [vocabularies, total] = await this.prisma.$transaction([
      this.prisma.vocabulary.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        include: {
          meanings: {
            include: {
              definitions: true,
            },
          },
        },
      }),
      this.prisma.vocabulary.count({
        where,
      }),
    ]);

    return {
      vocabularies,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<Vocabulary> {
    const vocabulary = await this.prisma.vocabulary.findFirst({
      where: { id, deletedAt: null },
      include: {
        meanings: {
          include: {
            definitions: true,
          },
        },
      },
    });

    if (!vocabulary) {
      throw new NotFoundException('Không tìm thấy từ vựng');
    }

    return vocabulary;
  }

  async update(
    id: string,
    dto: UpdateVocabularyDto,
    userId?: string,
  ): Promise<Vocabulary> {
    try {
      const existingVocabulary = await this.prisma.vocabulary.findUnique({
        where: { id },
      });

      if (!existingVocabulary) {
        throw new NotFoundException('Không tìm thấy từ vựng');
      }

      if (
        !dto.word &&
        !dto.translation &&
        !dto.meanings &&
        !dto.phonetic &&
        !dto.imageUrl &&
        !dto.audioUrlUs &&
        !dto.audioUrlUk &&
        !dto.audioUrlAu &&
        !dto.topicId
      ) {
        throw new BadRequestException('Không có dữ liệu cập nhật');
      }

      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.word !== undefined) {
        updateData.word = dto.word.trim();
      }
      if (dto.translation !== undefined) {
        updateData.translation = dto.translation.trim();
      }
      if (dto.phonetic !== undefined) {
        updateData.phonetic = dto.phonetic.trim();
      }
      if (dto.imageUrl !== undefined) {
        updateData.imageUrl = dto.imageUrl.trim();
      }
      if (dto.audioUrlUs !== undefined) {
        updateData.audioUrlUs = dto.audioUrlUs.trim();
      }
      if (dto.audioUrlUk !== undefined) {
        updateData.audioUrlUk = dto.audioUrlUk.trim();
      }
      if (dto.audioUrlAu !== undefined) {
        updateData.audioUrlAu = dto.audioUrlAu.trim();
      }
      if (dto.topicId !== undefined) {
        updateData.topic = {
          connect: {
            id: dto.topicId,
          },
        };
      }

      const updatedVocabulary = await this.prisma.vocabulary.update({
        where: { id },
        data: updateData,
        include: {
          meanings: {
            include: {
              definitions: true,
            },
          },
        },
      });
      return updatedVocabulary;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const vocabulary = await this.prisma.vocabulary.findFirst({
        where: { id },
      });

      if (!vocabulary) {
        throw new NotFoundException(`Không tìm thấy từ vựng với id ${id}`);
      }

      await this.prisma.vocabulary.update({
        where: { id },
        data: {
          deletedAt: new Date().toISOString(),
          isDeleted: true,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async forceDelete(id: string): Promise<void> {
    try {
      const vocabulary = await this.prisma.vocabulary.findFirst({
        where: { id, deletedAt: { not: null }, isDeleted: true },
      });

      if (!vocabulary) {
        throw new NotFoundException(`Không tìm thấy từ vựng với id ${id}`);
      }

      if (vocabulary.deletedAt === null) {
        throw new BadRequestException(
          `Từ vựng này cần được xoá mềm trước khi xoá vĩnh viễn`,
        );
      }

      await this.prisma.vocabulary.delete({
        where: { id },
      });
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

  async restoreDelete(id: string): Promise<void> {
    try {
      const vocabulary = await this.prisma.vocabulary.findUnique({
        where: { id },
      });

      if (!vocabulary) {
        throw new NotFoundException(`Không tìm thấy từ vựng với id ${id}`);
      }

      if (!vocabulary.deletedAt) {
        throw new BadRequestException(`Từ vựng với id ${id} chưa bị xóa`);
      }

      await this.prisma.vocabulary.update({
        where: { id },
        data: {
          deletedAt: null,
          isDeleted: false,
          updatedAt: new Date().toISOString(),
        },
      });
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

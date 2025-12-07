import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { Vocabulary } from '@prisma/client';
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

      if (!dto.meaning || !dto.meaning.trim()) {
        throw new BadRequestException('Nghĩa là bắt buộc');
      }

      const normalizedWord = dto.word.trim();
      const duplicatedVocabulary = await this.prisma.vocabulary.findFirst({
        where: {
          word: { equals: normalizedWord, mode: 'insensitive' },
        },
      });

      if (duplicatedVocabulary) {
        throw new BadRequestException('Từ vựng đã tồn tại');
      }

      const vocabulary = await this.prisma.vocabulary.create({
        data: {
          word: normalizedWord,
          meaning: dto.meaning.trim(),
          phonetic: dto.phonetic.trim(),
          type: dto.type.trim(),
          exampleSentence: dto.exampleSentence.trim(),
          exampleTranslation: dto.exampleTranslation.trim(),
          imageUrl: dto.imageUrl.trim(),
          audioUrl: dto.audioUrl.trim(),
          synonyms: dto.synonyms,
          antonyms: dto.antonyms,
          topic: {
            connect: {
              id: dto.topicId,
            },
          },
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      return vocabulary;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(
    pagination: PaginationDto,
    search?: string,
  ): Promise<{ vocabularies: Vocabulary[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const [vocabularies, total] = await this.prisma.$transaction([
      this.prisma.vocabulary.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where: {
          word: { contains: search, mode: 'insensitive' },
        },
      }),
      this.prisma.vocabulary.count({
        where: {
          word: { contains: search, mode: 'insensitive' },
        },
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
    const vocabulary = await this.prisma.vocabulary.findUnique({
      where: { id },
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
        !dto.meaning &&
        !dto.phonetic &&
        !dto.type &&
        !dto.exampleSentence &&
        !dto.exampleTranslation &&
        !dto.imageUrl &&
        !dto.audioUrl &&
        !dto.synonyms &&
        !dto.antonyms &&
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
      if (dto.meaning !== undefined) {
        updateData.meaning = dto.meaning.trim();
      }
      if (dto.phonetic !== undefined) {
        updateData.phonetic = dto.phonetic.trim();
      }
      if (dto.type !== undefined) {
        updateData.type = dto.type.trim();
      }
      if (dto.exampleSentence !== undefined) {
        updateData.exampleSentence = dto.exampleSentence.trim();
      }
      if (dto.exampleTranslation !== undefined) {
        updateData.exampleTranslation = dto.exampleTranslation.trim();
      }
      if (dto.imageUrl !== undefined) {
        updateData.imageUrl = dto.imageUrl.trim();
      }
      if (dto.audioUrl !== undefined) {
        updateData.audioUrl = dto.audioUrl.trim();
      }
      if (dto.synonyms !== undefined) {
        updateData.synonyms = dto.synonyms;
      }
      if (dto.antonyms !== undefined) {
        updateData.antonyms = dto.antonyms;
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
      });
      return updatedVocabulary;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existingVocabulary = await this.prisma.vocabulary.findUnique({
        where: { id },
      });

      if (!existingVocabulary) {
        throw new NotFoundException('Không tìm thấy từ vựng');
      }

      await this.prisma.vocabulary.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { PartOfSpeech, Prisma, Vocabulary } from '@prisma/client';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { TranslationService } from './translation.service';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';

interface DictionaryPhonetic {
  text?: string;
  audio?: string;
}

interface DictionaryDefinition {
  definition: string;
  example?: string;
}

interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: DictionaryPhonetic[];
  meanings?: DictionaryMeaning[];
}

export interface BulkImportResult {
  word: string;
  status: 'success' | 'failed';
  vocabularyId?: string;
  error?: string;
}

@Injectable()
export class VocabularyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly translationService: TranslationService,
  ) {}

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
          status: dto.status ?? true,
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
                  translation: def.translation?.trim() || '',
                  example: def.example?.trim() || '',
                  exampleTranslation: def.exampleTranslation?.trim() || '',
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

      await this.translationService.translateDefinitions(vocabulary);

      // Refetch with updated translations
      const updatedVocabulary = await this.prisma.vocabulary.findUnique({
        where: { id: vocabulary.id },
        include: {
          meanings: {
            include: {
              definitions: true,
            },
          },
        },
      });

      return updatedVocabulary!;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAll(
    pagination: PaginationDto,
    topicId?: string,
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
      ...(pagination.status != undefined && {
        status: pagination.status,
      }),
      ...(topicId && {
        topicId,
      }),
    };

    const [vocabularies, total] = await this.prisma.$transaction([
      this.prisma.vocabulary.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        include: {
          topic: {
            select: {
              name: true,
            },
          },
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

  async getById(id: string): Promise<Vocabulary> {
    const vocabulary = await this.prisma.vocabulary.findFirst({
      where: { id },
      include: {
        topic: {
          select: {
            name: true,
          },
        },
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
        !dto.topicId &&
        dto.status === undefined
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
      if (dto.status !== undefined) {
        updateData.status = dto.status;
      }
      if (dto.topicId !== undefined) {
        updateData.topic = {
          connect: {
            id: dto.topicId,
          },
        };
      }

      // Handle meanings update: delete old meanings and create new ones
      if (dto.meanings && dto.meanings.length > 0) {
        // Get all existing meaning IDs for this vocabulary
        const existingMeanings = await this.prisma.meaning.findMany({
          where: { vocabularyId: id },
          select: { id: true },
        });

        // Delete all definitions for existing meanings
        await this.prisma.definition.deleteMany({
          where: {
            meaningId: {
              in: existingMeanings.map((m) => m.id),
            },
          },
        });

        // Delete all existing meanings
        await this.prisma.meaning.deleteMany({
          where: { vocabularyId: id },
        });

        // Create new meanings with definitions
        updateData.meanings = {
          create: dto.meanings.map((meaning) => ({
            partOfSpeech: meaning.partOfSpeech,
            synonyms: meaning.synonyms ?? [],
            antonyms: meaning.antonyms ?? [],
            definitions: {
              create: meaning.definitions.map((def) => ({
                definition: def.definition.trim(),
                translation: def.translation?.trim() || '',
                example: def.example?.trim() || '',
                exampleTranslation: def.exampleTranslation?.trim() || '',
              })),
            },
          })),
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

  async importFromExcel(
    file: Express.Multer.File,
    userId?: string,
  ): Promise<{ success: number; failed: number; details: BulkImportResult[] }> {
    try {
      // Parse Excel file
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON - expecting columns: word, translation, topicId (all required)
      const data = XLSX.utils.sheet_to_json<{
        word?: string;
        translation?: string;
        topicId?: string;
      }>(worksheet);

      if (!data || data.length === 0) {
        throw new BadRequestException('File Excel không có dữ liệu');
      }

      const results: BulkImportResult[] = [];
      let successCount = 0;
      let failedCount = 0;

      for (const row of data) {
        const word = row.word?.trim();
        const translation = row.translation?.trim();
        const topicId = row.topicId?.trim();

        // Validate required fields
        if (!word) {
          continue; // Skip empty rows
        }

        if (!topicId) {
          results.push({
            word,
            status: 'failed',
            error: 'Thiếu topicId',
          });
          failedCount++;
          continue;
        }

        try {
          // Validate topic exists
          const topicExists = await this.prisma.topic.findFirst({
            where: { id: topicId, deletedAt: null },
          });

          if (!topicExists) {
            results.push({
              word,
              status: 'failed',
              error: `Topic không tồn tại: ${topicId}`,
            });
            failedCount++;
            continue;
          }

          // Check for duplicate
          const existingVocabulary = await this.prisma.vocabulary.findFirst({
            where: {
              word: { equals: word, mode: 'insensitive' },
              deletedAt: null,
            },
          });

          if (existingVocabulary) {
            results.push({
              word,
              status: 'failed',
              error: 'Từ vựng đã tồn tại',
            });
            failedCount++;
            continue;
          }

          // Fetch dictionary data
          const dictionaryData = await this.fetchDictionaryData(word);

          // Fetch image from Unsplash
          const imageUrl = await this.fetchUnsplashImage(word);

          // Create vocabulary with API data
          const vocabulary = await this.createVocabularyFromApiData(
            word,
            translation,
            topicId,
            dictionaryData,
            imageUrl,
            userId,
          );

          results.push({
            word,
            status: 'success',
            vocabularyId: vocabulary.id,
          });
          successCount++;
        } catch (error) {
          results.push({
            word,
            status: 'failed',
            error: error.message || 'Lỗi không xác định',
          });
          failedCount++;
        }
      }

      // Batch translate ALL vocabularies in 1 API call
      const successVocabularyIds = results
        .filter((r) => r.status === 'success' && r.vocabularyId)
        .map((r) => r.vocabularyId!);

      if (successVocabularyIds.length > 0) {
        await this.translationService.batchTranslateVocabularies(
          successVocabularyIds,
        );
      }

      return {
        success: successCount,
        failed: failedCount,
        details: results,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi đọc file Excel: ${error.message}`);
    }
  }

  private async fetchDictionaryData(
    word: string,
  ): Promise<DictionaryEntry | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<DictionaryEntry[]>(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
        ),
      );
      return response.data?.[0] || null;
    } catch {
      return null;
    }
  }

  private async fetchUnsplashImage(word: string): Promise<string> {
    try {
      const accessKey = this.configService.get<string>('UNSPLASH_ACCESS_KEY');
      if (!accessKey) {
        return '';
      }

      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(word)}&per_page=1&client_id=${accessKey}`;

      const response = await firstValueFrom(
        this.httpService.get<{
          results: Array<{
            urls: {
              regular: string;
              small: string;
            };
          }>;
        }>(url),
      );

      const imageUrl = response.data?.results?.[0]?.urls?.regular || '';

      return imageUrl;
    } catch (error) {
      console.error(
        `[Unsplash] Error fetching image for "${word}":`,
        error.message,
      );
      return '';
    }
  }

  private mapPartOfSpeech(pos: string): PartOfSpeech {
    const mapping: Record<string, PartOfSpeech> = {
      noun: 'noun',
      verb: 'verb',
      adjective: 'adjective',
      adverb: 'adverb',
      pronoun: 'pronoun',
      preposition: 'preposition',
      conjunction: 'conjunction',
      interjection: 'interjection',
      determiner: 'determiner',
      article: 'article',
      numeral: 'numeral',
    };
    return mapping[pos.toLowerCase()] || 'noun';
  }

  private async createVocabularyFromApiData(
    word: string,
    translation: string | undefined,
    topicId: string,
    dictionaryData: DictionaryEntry | null,
    imageUrl: string,
    userId?: string,
  ): Promise<Vocabulary> {
    const phonetic =
      dictionaryData?.phonetic ||
      dictionaryData?.phonetics?.find((p) => p.text)?.text ||
      '';

    // Extract audio URLs
    const audioUrlUs =
      dictionaryData?.phonetics?.find((p) => p.audio?.endsWith('-us.mp3'))
        ?.audio || '';
    const audioUrlUk =
      dictionaryData?.phonetics?.find((p) => p.audio?.endsWith('-uk.mp3'))
        ?.audio || '';
    const audioUrlAu =
      dictionaryData?.phonetics?.find((p) => p.audio?.endsWith('-au.mp3'))
        ?.audio || '';

    // Map meanings and definitions
    const meanings =
      dictionaryData?.meanings?.map((m) => ({
        partOfSpeech: this.mapPartOfSpeech(m.partOfSpeech),
        synonyms: m.synonyms || [],
        antonyms: m.antonyms || [],
        definitions: {
          create:
            m.definitions?.slice(0, 3).map((d) => ({
              definition: d.definition,
              translation: '',
              example: d.example || '',
              exampleTranslation: '',
            })) || [],
        },
      })) || [];

    // If no meanings from API, create a default one
    if (meanings.length === 0) {
      meanings.push({
        partOfSpeech: 'noun' as PartOfSpeech,
        synonyms: [],
        antonyms: [],
        definitions: {
          create: [
            {
              definition: word,
              translation: translation || '',
              example: '',
              exampleTranslation: '',
            },
          ],
        },
      });
    }

    const vocabulary = await this.prisma.vocabulary.create({
      data: {
        word: word.trim(),
        translation: translation?.trim() || '',
        phonetic,
        imageUrl,
        audioUrlUs,
        audioUrlUk,
        audioUrlAu,
        status: true,
        topic: {
          connect: { id: topicId },
        },
        createdBy: userId,
        meanings: {
          create: meanings,
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
  }
}

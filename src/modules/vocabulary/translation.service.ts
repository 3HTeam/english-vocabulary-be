import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TranslationService {
  private geminiModel: any;
  private readonly TRANSLATION_DELIMITER = '|||SPLIT|||';

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (geminiApiKey) {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      this.geminiModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });
    }
  }

  async translateDefinitions(vocabulary: any): Promise<void> {
    if (!this.geminiModel) {
      return;
    }

    const textsToTranslate: {
      definitionId: string;
      field: 'translation' | 'exampleTranslation';
      text: string;
    }[] = [];

    for (const meaning of vocabulary.meanings || []) {
      for (const definition of meaning.definitions || []) {
        if (!definition.translation && definition.definition) {
          textsToTranslate.push({
            definitionId: definition.id,
            field: 'translation',
            text: definition.definition,
          });
        }

        if (!definition.exampleTranslation && definition.example) {
          textsToTranslate.push({
            definitionId: definition.id,
            field: 'exampleTranslation',
            text: definition.example,
          });
        }
      }
    }

    if (textsToTranslate.length === 0) {
      return;
    }

    const translations = await this.batchTranslate(
      textsToTranslate.map((t) => t.text),
    );

    await this.updateDefinitions(textsToTranslate, translations);
  }

  async batchTranslateVocabularies(vocabularyIds: string[]): Promise<void> {
    if (!this.geminiModel || vocabularyIds.length === 0) {
      return;
    }

    const definitions = await this.prisma.definition.findMany({
      where: {
        meaning: {
          vocabularyId: { in: vocabularyIds },
        },
      },
    });

    const textsToTranslate: {
      definitionId: string;
      field: 'translation' | 'exampleTranslation';
      text: string;
    }[] = [];

    for (const definition of definitions) {
      if (!definition.translation && definition.definition) {
        textsToTranslate.push({
          definitionId: definition.id,
          field: 'translation',
          text: definition.definition,
        });
      }

      if (!definition.exampleTranslation && definition.example) {
        textsToTranslate.push({
          definitionId: definition.id,
          field: 'exampleTranslation',
          text: definition.example,
        });
      }
    }

    if (textsToTranslate.length === 0) {
      return;
    }

    const translations = await this.batchTranslate(
      textsToTranslate.map((t) => t.text),
    );

    await this.updateDefinitions(textsToTranslate, translations);
  }

  private async batchTranslate(texts: string[]): Promise<string[]> {
    if (!this.geminiModel || texts.length === 0) {
      return texts.map(() => '');
    }

    const validTexts: { index: number; text: string }[] = [];
    texts.forEach((text, index) => {
      if (text && text.trim()) {
        validTexts.push({ index, text: text.trim() });
      }
    });

    if (validTexts.length === 0) {
      return texts.map(() => '');
    }

    try {
      const combinedText = validTexts
        .map((t) => t.text)
        .join(`\n${this.TRANSLATION_DELIMITER}\n`);

      const prompt = `Hãy đóng vai một biên dịch viên chuyên nghiệp.
Nhiệm vụ: Dịch các đoạn văn bản sau sang tiếng Việt một cách tự nhiên, đúng ngữ cảnh.
Các đoạn văn bản được ngăn cách bởi ký tự "${this.TRANSLATION_DELIMITER}".
Yêu cầu quan trọng:
- Trả về các bản dịch tương ứng, ngăn cách bởi cùng ký tự "${this.TRANSLATION_DELIMITER}"
- Chỉ trả về văn bản đã dịch, không giải thích
- Giữ nguyên thứ tự các đoạn

Văn bản cần dịch:
${combinedText}`;

      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const translatedCombined = response.text()?.trim() || '';

      const translations = translatedCombined
        .split(this.TRANSLATION_DELIMITER)
        .map((t) => t.trim());

      const resultArray: string[] = texts.map(() => '');
      validTexts.forEach((vt, i) => {
        if (translations[i]) {
          resultArray[vt.index] = translations[i];
        }
      });

      return resultArray;
    } catch {
      return texts.map(() => '');
    }
  }

  private async updateDefinitions(
    textsToTranslate: {
      definitionId: string;
      field: 'translation' | 'exampleTranslation';
      text: string;
    }[],
    translations: string[],
  ): Promise<void> {
    const updatesByDefinition = new Map<
      string,
      { translation?: string; exampleTranslation?: string }
    >();

    textsToTranslate.forEach((item, index) => {
      if (translations[index]) {
        const existing = updatesByDefinition.get(item.definitionId) || {};
        existing[item.field] = translations[index];
        updatesByDefinition.set(item.definitionId, existing);
      }
    });

    for (const [definitionId, updates] of updatesByDefinition) {
      if (Object.keys(updates).length > 0) {
        await this.prisma.definition.update({
          where: { id: definitionId },
          data: updates,
        });
      }
    }
  }
}

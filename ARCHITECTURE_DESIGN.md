# 🏗️ Modular Monolith Architecture Design

## English Learning Platform - NestJS Backend

---

## 📋 Table of Contents

1. [Folder Structure](#part-1-folder-structure)
2. [Dual-Controller Implementation](#part-2-dual-controller-implementation)
3. [Data Transfer Objects (DTOs)](#part-3-data-transfer-objects-dtos)
4. [Main Setup](#part-4-main-setup)

---

## Part 1: Folder Structure

### 📁 Complete Directory Tree

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
│
├── common/                          # Shared utilities across modules
│   ├── decorators/
│   │   ├── public.decorator.ts      # @Public() - bypass auth
│   │   ├── roles.decorator.ts       # @Roles('admin', 'student') - NEW
│   │   └── current-user.decorator.ts
│   ├── dto/
│   │   └── pagination.dto.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   ├── auth.guard.ts            # JWT authentication
│   │   └── roles.guard.ts           # Role-based authorization - NEW
│   └── interceptors/
│       └── transform.interceptor.ts
│
├── config/                          # Configuration files
│   ├── app.config.ts
│   └── database.config.ts
│
├── prisma/                          # Prisma service
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
└── modules/                         # Feature modules
    ├── auth/                        # Authentication module
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── decorators/
    │   │   └── current-user.decorator.ts
    │   ├── dto/
    │   │   ├── login.dto.ts
    │   │   ├── register.dto.ts
    │   │   └── ...
    │   └── guards/
    │       └── auth.guard.ts
    │
    └── lessons/                     # Example: Lessons Module
        ├── lessons.module.ts
        ├── lessons.service.ts       # Shared business logic
        │
        ├── controllers/             # ⭐ Separation: Controllers by context
        │   ├── lessons-admin.controller.ts    # Admin Panel APIs
        │   └── lessons-app.controller.ts      # Mobile App APIs
        │
        ├── dto/                     # ⭐ Separation: DTOs by context
        │   ├── admin/               # Admin-specific DTOs
        │   │   ├── create-lesson.dto.ts
        │   │   ├── update-lesson.dto.ts
        │   │   └── lesson-admin-response.dto.ts
        │   └── app/                 # App-specific DTOs
        │       ├── lesson-list-query.dto.ts
        │       └── lesson-app-response.dto.ts
        │
        └── entities/                # (Optional) Type definitions
            └── lesson.types.ts
```

### 🎯 Key Design Decisions

**Why this structure?**

1. **`controllers/` folder**: Separates Admin and App controllers physically, making it clear which API serves which client.

2. **`dto/admin/` and `dto/app/`**:
   - Admin DTOs have strict validation (required fields, complex rules)
   - App DTOs are optimized for mobile (lightweight, minimal fields)

3. **Single Service (`lessons.service.ts`)**:
   - One source of truth for business logic
   - Both controllers call the same service methods
   - Prevents code duplication

4. **Common Guards**:
   - `AuthGuard`: Verifies JWT token (used by both Admin & App)
   - `RolesGuard`: Checks user role (Admin only)

---

## Part 2: Dual-Controller Implementation

### 🔐 Step 1: Create Roles Guard & Decorator

First, we need to create role-based authorization:

**`src/common/decorators/roles.decorator.ts`**

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

**`src/common/guards/roles.guard.ts`**

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRole = user.role || '';

    // Check if user has required role
    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        `Access denied. Required role: ${requiredRoles.join(' or ')}`,
      );
    }

    return true;
  }
}
```

### 📚 Step 2: Lessons Module Implementation

**`src/modules/lessons/lessons.service.ts`**

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonDto } from './dto/admin/create-lesson.dto';
import { UpdateLessonDto } from './dto/admin/update-lesson.dto';
import { LessonListQueryDto } from './dto/app/lesson-list-query.dto';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new lesson (Admin only)
   */
  async create(dto: CreateLessonDto, userId: string) {
    // Business logic validation
    if (!dto.title || !dto.title.trim()) {
      throw new BadRequestException('Title is required');
    }

    // Check for duplicates
    const existing = await this.prisma.lesson.findFirst({
      where: {
        title: { equals: dto.title.trim(), mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new BadRequestException('Lesson with this title already exists');
    }

    // Create lesson
    const lesson = await this.prisma.lesson.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim(),
        content: dto.content,
        difficulty: dto.difficulty,
        duration: dto.duration,
        isActive: dto.isActive ?? true,
        adminNotes: dto.adminNotes, // Internal field, not exposed to app
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    return lesson;
  }

  /**
   * Update lesson (Admin only)
   */
  async update(id: string, dto: UpdateLessonDto, userId: string) {
    const existing = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Lesson not found');
    }

    const lesson = await this.prisma.lesson.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title.trim() }),
        ...(dto.description !== undefined && {
          description: dto.description?.trim(),
        }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.difficulty !== undefined && { difficulty: dto.difficulty }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.adminNotes !== undefined && { adminNotes: dto.adminNotes }),
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
      },
    });

    return lesson;
  }

  /**
   * Delete lesson (Admin only)
   */
  async delete(id: string) {
    const existing = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Lesson not found');
    }

    await this.prisma.lesson.delete({
      where: { id },
    });
  }

  /**
   * Get lesson list for Mobile App (optimized query)
   */
  async findAllForApp(query: LessonListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    // Only fetch active lessons for app
    const where = {
      isActive: true,
      ...(query.difficulty && { difficulty: query.difficulty }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [lessons, total] = await this.prisma.$transaction([
      this.prisma.lesson.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          // Only select fields needed for mobile app
          id: true,
          title: true,
          description: true,
          difficulty: true,
          duration: true,
          // Explicitly exclude admin-only fields
          // adminNotes: false,
          // createdBy: false,
        },
      }),
      this.prisma.lesson.count({ where }),
    ]);

    return {
      lessons,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      } as PaginationMeta,
    };
  }

  /**
   * Get lesson detail for Mobile App
   */
  async findOneForApp(id: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        id,
        isActive: true, // Only active lessons for app
      },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        difficulty: true,
        duration: true,
        // Exclude admin fields
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found or not available');
    }

    return lesson;
  }

  /**
   * Get lesson list for Admin Panel (full data)
   */
  async findAllForAdmin(pagination: PaginationDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(pagination.search && {
        OR: [
          { title: { contains: pagination.search, mode: 'insensitive' } },
          { description: { contains: pagination.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [lessons, total] = await this.prisma.$transaction([
      this.prisma.lesson.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        // Admin gets all fields including internal ones
      }),
      this.prisma.lesson.count({ where }),
    ]);

    return {
      lessons,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      } as PaginationMeta,
    };
  }

  /**
   * Get lesson detail for Admin Panel (full data)
   */
  async findOneForAdmin(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      // Admin gets all fields
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }
}
```

**`src/modules/lessons/controllers/lessons-admin.controller.ts`**

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from '../lessons.service';
import { CreateLessonDto } from '../dto/admin/create-lesson.dto';
import { UpdateLessonDto } from '../dto/admin/update-lesson.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

/**
 * Admin Controller for Lessons
 *
 * This controller handles all CRUD operations for lessons.
 * Only accessible by users with 'admin' role.
 *
 * Routes: /api/admin/lessons
 */
@ApiTags('Admin - Lessons')
@ApiBearerAuth()
@Controller('admin/lessons')
@UseGuards(AuthGuard, RolesGuard) // Both guards required
@Roles('admin') // Applied to all routes in this controller
export class LessonsAdminController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lesson' })
  async create(
    @Body() createLessonDto: CreateLessonDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const lesson = await this.lessonsService.create(createLessonDto, user.id);
    return {
      message: 'Lesson created successfully',
      data: lesson,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all lessons (with admin fields)' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.lessonsService.findAllForAdmin(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by ID (with admin fields)' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const lesson = await this.lessonsService.findOneForAdmin(id);
    return {
      data: lesson,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lesson' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const lesson = await this.lessonsService.update(
      id,
      updateLessonDto,
      user.id,
    );
    return {
      message: 'Lesson updated successfully',
      data: lesson,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lesson' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.lessonsService.delete(id);
    return {
      message: 'Lesson deleted successfully',
    };
  }
}
```

**`src/modules/lessons/controllers/lessons-app.controller.ts`**

```typescript
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from '../lessons.service';
import { LessonListQueryDto } from '../dto/app/lesson-list-query.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

/**
 * App Controller for Lessons
 *
 * This controller handles read-only operations for mobile app.
 * Accessible by authenticated users (students).
 *
 * Routes: /api/app/lessons
 */
@ApiTags('App - Lessons')
@ApiBearerAuth()
@Controller('app/lessons')
@UseGuards(AuthGuard) // Only authentication required (no role check)
export class LessonsAppController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get active lessons list (optimized for mobile)',
  })
  async findAll(@Query() query: LessonListQueryDto) {
    return await this.lessonsService.findAllForApp(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get lesson detail (optimized for mobile)',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const lesson = await this.lessonsService.findOneForApp(id);
    return {
      data: lesson,
    };
  }
}
```

**`src/modules/lessons/lessons.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsAdminController } from './controllers/lessons-admin.controller';
import { LessonsAppController } from './controllers/lessons-app.controller';

@Module({
  controllers: [
    LessonsAdminController, // Admin routes: /api/admin/lessons
    LessonsAppController, // App routes: /api/app/lessons
  ],
  providers: [LessonsService],
  exports: [LessonsService], // Export if other modules need it
})
export class LessonsModule {}
```

---

## Part 3: Data Transfer Objects (DTOs)

### 📝 Admin DTOs (Strict Validation)

**`src/modules/lessons/dto/admin/create-lesson.dto.ts`**

```typescript
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LessonDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export class CreateLessonDto {
  @ApiProperty({
    description: 'Lesson title',
    example: 'Introduction to English Grammar',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Short description of the lesson',
    example: 'Learn the basics of English grammar',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Full lesson content (HTML or Markdown)',
    example: '<h1>Lesson Content</h1><p>...</p>',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Difficulty level',
    enum: LessonDifficulty,
    example: LessonDifficulty.BEGINNER,
  })
  @IsEnum(LessonDifficulty)
  difficulty: LessonDifficulty;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 30,
    minimum: 1,
    maximum: 300,
  })
  @IsInt()
  @Min(1)
  @Max(300)
  duration: number;

  @ApiPropertyOptional({
    description: 'Whether the lesson is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Internal admin notes (not visible to students)',
    example: 'Review this lesson next week',
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
```

**`src/modules/lessons/dto/admin/update-lesson.dto.ts`**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonDto } from './create-lesson.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * UpdateLessonDto extends CreateLessonDto but makes all fields optional
 * This allows partial updates
 */
export class UpdateLessonDto extends PartialType(CreateLessonDto) {}
```

**`src/modules/lessons/dto/admin/lesson-admin-response.dto.ts`**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { LessonDifficulty } from './create-lesson.dto';

/**
 * Response DTO for Admin Panel
 * Includes all fields including internal ones
 */
export class LessonAdminResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: LessonDifficulty })
  difficulty: LessonDifficulty;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  adminNotes?: string; // Internal field, only for admin

  @ApiProperty({ required: false })
  createdBy?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

### 📱 App DTOs (Optimized for Mobile)

**`src/modules/lessons/dto/app/lesson-list-query.dto.ts`**

```typescript
import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LessonDifficulty } from '../admin/create-lesson.dto';

/**
 * Query DTO for listing lessons in mobile app
 * Optimized for mobile: lightweight, only essential filters
 */
export class LessonListQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search by title or description',
    example: 'grammar',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by difficulty level',
    enum: LessonDifficulty,
    example: LessonDifficulty.BEGINNER,
  })
  @IsOptional()
  @IsEnum(LessonDifficulty)
  difficulty?: LessonDifficulty;
}
```

**`src/modules/lessons/dto/app/lesson-app-response.dto.ts`**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { LessonDifficulty } from '../admin/create-lesson.dto';

/**
 * Response DTO for Mobile App
 * Excludes internal/admin-only fields for security and performance
 */
export class LessonAppResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: LessonDifficulty })
  difficulty: LessonDifficulty;

  @ApiProperty()
  duration: number;

  // Explicitly excluded:
  // - adminNotes (internal)
  // - createdBy (internal)
  // - createdAt (not needed for mobile)
  // - updatedAt (not needed for mobile)
  // - isActive (filtered at query level)
}
```

---

## Part 4: Main Setup

### 🚀 Updated `main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix for all routes
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global exception filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('English Learning Platform API')
    .setDescription(
      'API documentation for English Learning Platform\n\n' +
        '- **Admin APIs**: `/api/admin/*` - Full CRUD operations (Admin role required)\n' +
        '- **App APIs**: `/api/app/*` - Read operations optimized for mobile (Authenticated users)',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('Admin - Lessons', 'Admin operations for lessons management')
    .addTag('App - Lessons', 'Mobile app operations for lessons')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'English Learning Platform API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);

  console.log(
    `🚀 Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  console.log(
    `📚 Swagger docs available at: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
```

### 📦 Updated `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TopicModule } from './modules/topic/topic.module';
import { UploadModule } from './modules/upload/upload.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { LessonsModule } from './modules/lessons/lessons.module'; // NEW
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Core modules
    PrismaModule,

    // Feature modules
    AuthModule,
    TopicModule,
    UploadModule,
    VocabularyModule,
    LessonsModule, // NEW: Register the lessons module
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

---

## 🎯 Summary: Why This Architecture?

### ✅ Benefits

1. **Clear Separation of Concerns**
   - Admin and App logic are physically separated in different controllers
   - Easy to identify which API serves which client

2. **Single Source of Truth**
   - One service handles all business logic
   - No code duplication between Admin and App

3. **Security by Design**
   - Admin routes protected by `RolesGuard`
   - App routes only require authentication
   - Internal fields (like `adminNotes`) never exposed to mobile app

4. **Scalability**
   - Easy to add new modules following the same pattern
   - Can later split into microservices if needed (each module is self-contained)

5. **Maintainability**
   - DTOs clearly show what data each API accepts/returns
   - Swagger documentation automatically generated
   - Type-safe with TypeScript

### 🔄 API Routes Summary

```
Admin Panel (Web):
  POST   /api/admin/lessons          - Create lesson
  GET    /api/admin/lessons          - List all lessons (with admin fields)
  GET    /api/admin/lessons/:id      - Get lesson detail (with admin fields)
  PATCH  /api/admin/lessons/:id      - Update lesson
  DELETE /api/admin/lessons/:id      - Delete lesson

Mobile App:
  GET    /api/app/lessons            - List active lessons (optimized)
  GET    /api/app/lessons/:id        - Get lesson detail (optimized)
```

---

## 📚 Next Steps

1. **Install Swagger** (if not already installed):

   ```bash
   npm install @nestjs/swagger swagger-ui-express
   ```

2. **Update Prisma Schema** to add `Lesson` model (if needed)

3. **Create the Lessons Module** following the structure above

4. **Test the APIs** using Swagger UI at `/api/docs`

---

**Happy Coding! 🚀**

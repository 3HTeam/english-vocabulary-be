# 📁 Cấu trúc dự án chi tiết

## Tổng quan

Dự án được tổ chức theo mô hình **Modular Architecture** của NestJS, giúp code dễ bảo trì và mở rộng.

## Cấu trúc thư mục

```
english-vocabulary/
├── src/
│   ├── config/                    # ⚙️ Cấu hình ứng dụng
│   │   ├── app.config.ts          # Cấu hình app (port, env, prefix)
│   │   └── database.config.ts     # Cấu hình database
│   │
│   ├── common/                     # 🔧 Shared utilities
│   │   ├── decorators/            # Custom decorators
│   │   │   └── public.decorator.ts
│   │   ├── dto/                   # Common DTOs
│   │   │   └── pagination.dto.ts
│   │   ├── filters/               # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   └── interceptors/          # Response interceptors
│   │       └── transform.interceptor.ts
│   │
│   ├── modules/                    # 📦 Feature modules
│   │   └── vocabulary/            # Example: Vocabulary module
│   │       ├── dto/               # Data Transfer Objects
│   │       │   ├── create-vocabulary.dto.ts
│   │       │   └── update-vocabulary.dto.ts
│   │       ├── vocabulary.controller.ts    # HTTP endpoints
│   │       ├── vocabulary.service.ts       # Business logic
│   │       ├── vocabulary.module.ts        # Module definition
│   │       ├── vocabulary.controller.spec.ts
│   │       └── vocabulary.service.spec.ts
│   │
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts         # Root controller
│   ├── app.service.ts            # Root service
│   └── main.ts                   # Application entry point
│
├── database/
│   └── migrations/               # SQL migration files
│       └── 001_create_vocabularies_table.sql
│
├── test/                         # E2E tests
├── .env.example                  # Template cho environment variables
├── .env                          # Environment variables (git ignored)
├── package.json
├── tsconfig.json
└── README.md
```

## Giải thích từng phần

### 1. `/src/config/` - Cấu hình

Chứa các file cấu hình cho ứng dụng:

- **app.config.ts**: Cấu hình chung (port, environment, API prefix)
- **database.config.ts**: Cấu hình kết nối database

**Cách sử dụng:**

```typescript
// Trong service hoặc controller
constructor(private configService: ConfigService) {
  const port = this.configService.get<number>('app.port');
}
```

### 2. `/src/database/` - Database / ORM

Hiện tại dự án đang sử dụng Prisma (xem thư mục `src/prisma/`) để làm việc với database.

### 3. `/src/common/` - Shared Utilities

Các utility dùng chung:

- **decorators/**: Custom decorators (ví dụ: @Public())
- **dto/**: Common DTOs (ví dụ: PaginationDto)
- **filters/**: Exception filters để xử lý lỗi
- **interceptors/**: Response interceptors để format response

### 4. `/src/modules/` - Feature Modules

Mỗi feature có module riêng:

- **dto/**: Data Transfer Objects cho validation
- **controller.ts**: Xử lý HTTP requests
- **service.ts**: Business logic và database operations
- **module.ts**: Định nghĩa module, import/export

**Quy tắc:**

- Mỗi module độc lập
- Service chứa business logic
- Controller chỉ xử lý HTTP
- DTO để validate input

## Quy trình tạo module mới

### Bước 1: Tạo thư mục và files cơ bản

```bash
mkdir -p src/modules/your-module/dto
```

### Bước 2: Tạo DTOs

```typescript
// create-your-module.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateYourModuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

### Bước 3: Tạo Service

```typescript
// your-module.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../database/database.constants';

@Injectable()
export class YourModuleService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async findAll() {
    const { data, error } = await this.supabase.from('your_table').select('*');

    if (error) throw new Error(error.message);
    return data;
  }
}
```

### Bước 4: Tạo Controller

```typescript
// your-module.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { YourModuleService } from './your-module.service';
import { CreateYourModuleDto } from './dto/create-your-module.dto';

@Controller('your-module')
export class YourModuleController {
  constructor(private readonly service: YourModuleService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateYourModuleDto) {
    return this.service.create(dto);
  }
}
```

### Bước 5: Tạo Module

```typescript
// your-module.module.ts
import { Module } from '@nestjs/common';
import { YourModuleController } from './your-module.controller';
import { YourModuleService } from './your-module.service';

@Module({
  controllers: [YourModuleController],
  providers: [YourModuleService],
  exports: [YourModuleService], // Export nếu module khác cần dùng
})
export class YourModuleModule {}
```

### Bước 6: Import vào AppModule

```typescript
// app.module.ts
import { YourModuleModule } from './modules/your-module/your-module.module';

@Module({
  imports: [
    // ... other modules
    YourModuleModule,
  ],
})
export class AppModule {}
```

## Best Practices

1. **Luôn validate input** bằng DTOs với class-validator
2. **Service chứa business logic**, Controller chỉ routing
3. **Sử dụng async/await** cho database operations
4. **Xử lý errors** đúng cách với try-catch
5. **Export service** nếu module khác cần dùng
6. **Tách biệt concerns**: Controller → Service → Database

## Environment Variables

Tất cả biến môi trường được load trong `ConfigModule`:

- `.env` - Local development
- `.env.local` - Local overrides (git ignored)
- Có thể thêm `.env.production`, `.env.staging` cho các môi trường khác

## Testing

- Unit tests: `*.spec.ts` trong cùng thư mục với file được test
- E2E tests: Trong thư mục `/test`

Chạy tests:

```bash
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:watch    # Watch mode
```

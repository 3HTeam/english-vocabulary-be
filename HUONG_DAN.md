# 🚀 Hướng dẫn bắt đầu nhanh

## Bước 1: Cài đặt Supabase

1. Truy cập [supabase.com](https://supabase.com) và tạo tài khoản
2. Tạo project mới
3. Vào **Settings** → **API** để lấy:
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (anon/public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role key)

## Bước 2: Cấu hình Environment Variables

1. Copy file `.env.example` thành `.env`:

   ```bash
   cp .env.example .env
   ```

2. Mở file `.env` và điền thông tin Supabase:
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

## Bước 3: Tạo bảng trong Supabase

1. Vào Supabase Dashboard → **SQL Editor**
2. Mở file `database/migrations/001_create_vocabularies_table.sql`
3. Copy và paste vào SQL Editor
4. Click **Run** để tạo bảng

## Bước 4: Chạy ứng dụng

```bash
# Cài đặt dependencies (nếu chưa cài)
npm install

# Chạy development mode
npm run start:dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3000/api`

## Bước 5: Test API

### Tạo từ vựng mới

```bash
curl -X POST http://localhost:3000/api/vocabularies \
  -H "Content-Type: application/json" \
  -d '{
    "word": "hello",
    "meaning": "Xin chào",
    "pronunciation": "/həˈloʊ/",
    "example": "Hello, how are you?"
  }'
```

### Lấy danh sách từ vựng

```bash
curl http://localhost:3000/api/vocabularies
```

### Lấy chi tiết từ vựng

```bash
curl http://localhost:3000/api/vocabularies/{id}
```

## 📝 Các lệnh hữu ích

```bash
# Development
npm run start:dev          # Chạy với watch mode
npm run start:debug        # Chạy với debug mode

# Build
npm run build              # Build production
npm run start:prod         # Chạy production build

# Testing
npm run test               # Chạy unit tests
npm run test:watch         # Chạy tests với watch mode
npm run test:e2e           # Chạy E2E tests

# Code quality
npm run lint               # Kiểm tra code style
npm run format             # Format code
```

## 🎯 Các khái niệm cần biết

### Module

- Nhóm các chức năng liên quan lại với nhau
- Ví dụ: `VocabularyModule` chứa tất cả logic về từ vựng

### Controller

- Xử lý HTTP requests (GET, POST, PUT, DELETE)
- Nhận request từ client và gọi service

### Service

- Chứa business logic
- Tương tác với database (Supabase)
- Xử lý dữ liệu

### DTO (Data Transfer Object)

- Định nghĩa cấu trúc dữ liệu
- Validate input từ client
- Sử dụng decorators từ `class-validator`

### Dependency Injection

- NestJS tự động inject dependencies
- Ví dụ: Service được inject vào Controller

## 🔍 Ví dụ: Tạo module mới

Xem file `STRUCTURE.md` để biết chi tiết cách tạo module mới.

Tóm tắt:

1. Tạo thư mục `src/modules/your-module/`
2. Tạo DTOs trong `dto/`
3. Tạo Service với business logic
4. Tạo Controller với HTTP endpoints
5. Tạo Module và import vào `AppModule`

## ❓ Troubleshooting

### Lỗi: "Supabase URL and Key must be provided"

- Kiểm tra file `.env` đã có đầy đủ thông tin chưa
- Đảm bảo tên biến đúng: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Lỗi: "relation does not exist"

- Chưa tạo bảng trong Supabase
- Chạy SQL migration trong Supabase SQL Editor

### Lỗi: "Connection refused"

- Kiểm tra `DATABASE_URL` trong `.env`
- Đảm bảo Supabase project đang active

### Port đã được sử dụng

- Đổi `PORT` trong `.env`
- Hoặc kill process đang dùng port 3000:
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```

## 📚 Tài liệu tham khảo

- [NestJS Docs](https://docs.nestjs.com/)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 💡 Tips cho người mới

1. **Luôn validate input**: Sử dụng DTOs với decorators
2. **Xử lý errors**: Luôn check `error` từ Supabase
3. **Tách biệt concerns**: Controller → Service → Database
4. **Sử dụng TypeScript**: Tận dụng type safety
5. **Đọc logs**: Console.log để debug
6. **Test từng bước**: Test API sau mỗi thay đổi

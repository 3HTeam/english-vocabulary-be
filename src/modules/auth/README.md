# 🔐 Auth Module - Hướng dẫn sử dụng

Module authentication đã được tạo hoàn chỉnh với Supabase Auth. Module này cung cấp đầy đủ các chức năng: đăng ký, đăng nhập, đăng xuất, refresh token, đổi mật khẩu, và lấy thông tin user.

## 📁 Cấu trúc Module

```
auth/
├── dto/                          # Data Transfer Objects
│   ├── register.dto.ts          # DTO cho đăng ký
│   ├── login.dto.ts             # DTO cho đăng nhập
│   ├── change-password.dto.ts   # DTO cho đổi mật khẩu
│   └── refresh-token.dto.ts     # DTO cho refresh token
├── guards/
│   └── auth.guard.ts            # Guard để bảo vệ routes
├── decorators/
│   └── current-user.decorator.ts # Decorator @CurrentUser()
├── auth.service.ts              # Business logic
├── auth.controller.ts          # HTTP endpoints
└── auth.module.ts              # Module definition
```

## 🚀 Các Endpoints

### 1. Đăng ký (Public)

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "session": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": 1234567890
  },
  "message": "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
}
```

### 2. Đăng nhập (Public)

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "session": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": 1234567890
  },
  "message": "Đăng nhập thành công"
}
```

### 3. Đăng xuất (Protected)

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "message": "Đăng xuất thành công"
}
```

### 4. Refresh Token (Public)

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "session": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": 1234567890
  },
  "message": "Refresh token thành công"
}
```

### 5. Lấy thông tin user (Protected)

```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "emailVerified": true
  }
}
```

### 6. Lấy thông tin user với @CurrentUser (Protected)

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Lấy thông tin user thành công"
}
```

### 7. Đổi mật khẩu (Protected)

```http
POST /api/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Response:**

```json
{
  "message": "Đổi mật khẩu thành công"
}
```

## 🛡️ Bảo vệ Routes

### AuthGuard (Global)

AuthGuard đã được set làm **global guard** trong `auth.module.ts`. Điều này có nghĩa là:

- **Tất cả routes** sẽ được bảo vệ bởi AuthGuard
- Chỉ các routes có `@Public()` decorator mới không cần authentication

### Sử dụng @Public() decorator

```typescript
import { Public } from '../../common/decorators/public.decorator';

@Controller('example')
export class ExampleController {
  // Route này không cần authentication
  @Public()
  @Get('public')
  getPublic() {
    return { message: 'This is public' };
  }

  // Route này cần authentication
  @Get('protected')
  getProtected() {
    return { message: 'This is protected' };
  }
}
```

### Sử dụng @CurrentUser() decorator

```typescript
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('example')
export class ExampleController {
  @UseGuards(AuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return {
      message: `Hello ${user.fullName}!`,
      userId: user.id,
    };
  }
}
```

## 🔧 Cấu hình Environment Variables

Đảm bảo bạn đã set các biến môi trường sau trong file `.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📝 Lưu ý quan trọng

1. **Email Verification**: Supabase có thể yêu cầu xác thực email trước khi đăng nhập. Bạn có thể tắt tính năng này trong Supabase Dashboard nếu muốn.

2. **Token Storage**:
   - Client nên lưu `accessToken` và `refreshToken` vào secure storage (ví dụ: AsyncStorage trong React Native, SecureStore trong Expo)
   - Gửi `accessToken` trong header `Authorization: Bearer <token>` cho các protected routes

3. **Token Expiry**:
   - Access token thường có thời hạn ngắn (1 giờ)
   - Khi access token hết hạn, dùng refresh token để lấy token mới
   - Refresh token có thời hạn dài hơn (30 ngày)

4. **Error Handling**:
   - Tất cả errors đã được xử lý và trả về message tiếng Việt
   - HTTP status codes: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 409 (conflict)

## 🧪 Test với cURL

### Đăng ký

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### Đăng nhập

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Lấy profile (thay YOUR_TOKEN bằng token từ login)

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎯 Next Steps

1. Test tất cả các endpoints với Postman hoặc cURL
2. Tích hợp vào mobile app (React Native/Expo)
3. Implement token refresh logic ở client side
4. Thêm các tính năng bổ sung nếu cần (reset password, verify email, etc.)

## ❓ Troubleshooting

### Lỗi "Token không hợp lệ"

- Kiểm tra xem token có được gửi đúng format: `Bearer <token>`
- Kiểm tra xem token có hết hạn chưa
- Thử refresh token

### Lỗi "Email này đã được sử dụng"

- Email đã tồn tại trong Supabase
- Thử đăng nhập thay vì đăng ký

### Lỗi "Email hoặc mật khẩu không đúng"

- Kiểm tra lại email và password
- Đảm bảo email đã được verify (nếu Supabase yêu cầu)

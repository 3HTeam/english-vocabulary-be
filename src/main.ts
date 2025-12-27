import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

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
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global exception filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Documentation (optional - install @nestjs/swagger if needed)
  try {
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
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
        'JWT-auth', // This name matches @ApiBearerAuth('JWT-auth') in controllers
      )
      .addTag('Admin - Lessons', 'Admin operations for lessons management')
      .addTag('App - Lessons', 'Mobile app operations for lessons')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'English Learning Platform API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
    });
    console.log(
      `📚 Swagger docs available at: http://localhost:${configService.get<number>('app.port') || 3000}/api/docs`,
    );
  } catch (error) {
    console.log(
      'ℹ️  Swagger not installed. Install @nestjs/swagger to enable API documentation.',
    );
  }

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);

  console.log(
    `🚀 Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
}
bootstrap();

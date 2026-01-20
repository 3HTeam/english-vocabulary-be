import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export async function setupSwagger(app: INestApplication): Promise<void> {
  const configService = app.get(ConfigService);
  const logger = new Logger('Swagger');

  const isSwaggerEnabled =
    configService.get<string>('swagger.enabled') === 'true';

  if (!isSwaggerEnabled) {
    return;
  }

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
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'English Learning Platform API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
    });

    logger.log('📚 Swagger docs available at: /api/docs');
  } catch {
    logger.warn(
      'Swagger not installed. Install @nestjs/swagger to enable API documentation.',
    );
  }
}

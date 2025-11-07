import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('API de Autenticação')
    .setDescription('Serviço de autenticação e autorização')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(4000);
  console.log(`🚀 auth-service rodando na porta 4000`);
  console.log(`📚 Swagger docs: http://localhost:4000/api/docs`);
}
bootstrap().catch((err) => {
  console.error('❌ Erro ao inicializar a aplicação:', err);
  process.exit(1);
});

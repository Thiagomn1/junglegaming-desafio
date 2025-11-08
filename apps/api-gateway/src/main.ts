import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('Gateway principal da aplicação')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Endpoints de autenticação')
    .addTag('tasks', 'Endpoints de gerenciamento de tarefas')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3001);
  console.log('🚀 API Gateway rodando em http://localhost:3001');
  console.log('📚 Swagger docs: http://localhost:3001/api/docs');
}
bootstrap().catch((err) => {
  console.error('❌ Erro ao inicializar a aplicação:', err);
  process.exit(1);
});

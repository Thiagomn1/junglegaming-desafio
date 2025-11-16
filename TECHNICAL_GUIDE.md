# 📚 Guia Técnico Completo - Jungle Challenge

## Índice

1. [Arquitetura Geral](#1-arquitetura-geral)
2. [NestJS: Conceitos Fundamentais](#2-nestjs-conceitos-fundamentais)
3. [Estrutura dos Microserviços](#3-estrutura-dos-microserviços)
4. [Fluxo de Dados e Comunicação](#4-fluxo-de-dados-e-comunicação)
5. [Banco de Dados e TypeORM](#5-banco-de-dados-e-typeorm)
6. [Autenticação e Segurança](#6-autenticação-e-segurança)
7. [Frontend: React e Arquitetura](#7-frontend-react-e-arquitetura)
8. [WebSocket e Notificações em Tempo Real](#8-websocket-e-notificações-em-tempo-real)
9. [Melhorias Futuras Explicadas](#9-melhorias-futuras-explicadas)
10. [Perguntas Comuns em Entrevistas](#10-perguntas-comuns-em-entrevistas)

---

## 1. Arquitetura Geral

### 1.1 O que é Arquitetura de Microserviços?

**Definição**: Em vez de ter um único aplicativo monolítico que faz tudo, dividimos a aplicação em serviços menores e independentes, cada um responsável por uma funcionalidade específica.

**Exemplo da vida real**: Imagine uma pizzaria:

- **Monolito**: Uma pessoa que atende, faz pizza, entrega e cobra (tudo em um só)
- **Microserviços**: Atendente → Pizzaiolo → Entregador → Caixa (cada um com sua função)

### 1.2 Nossa Arquitetura

```
┌─────────────┐
│   Browser   │
│  (Cliente)  │
└──────┬──────┘
       │
       ↓ HTTP + WebSocket
┌─────────────────────────────────┐
│       API Gateway (3001)        │  ← Ponto de entrada único
│  Roteia requisições para os     │
│  serviços corretos              │
└────────┬────────────────────────┘
         │
    ┌────┴────┬──────────┬─────────────┐
    ↓         ↓          ↓             ↓
┌────────┐ ┌──────┐ ┌────────┐ ┌──────────────┐
│  Auth  │ │Tasks │ │ Notif  │ │  PostgreSQL  │
│ (4000) │ │(5000)│ │ (6001) │ │   Database   │
└────────┘ └──┬───┘ └───┬────┘ └──────────────┘
              │         │
              └────┬────┘
                   ↓
            ┌──────────┐
            │ RabbitMQ │  ← Fila de mensagens
            │  (5672)  │
            └──────────┘
```

### 1.3 Por que usamos API Gateway?

**Problema sem Gateway**:

```javascript
// Frontend precisaria conhecer TODOS os serviços
fetch("http://auth-service:4000/login");
fetch("http://tasks-service:5000/tasks");
fetch("http://notifications:6001/notifications");
// Muitos endpoints, configuração complexa, CORS em todo lugar
```

**Solução com Gateway**:

```javascript
// Frontend só conhece UM endpoint
fetch("http://api-gateway:3001/api/auth/login");
fetch("http://api-gateway:3001/api/tasks");
fetch("http://api-gateway:3001/api/notifications");
// Simples, centralizado, fácil de gerenciar
```

**Benefícios**:

- **Single Point of Entry**: Um único ponto de entrada
- **Rate Limiting**: Controle de requisições por IP/usuário
- **Load Balancing**: Distribuir carga entre múltiplas instâncias
- **Authentication**: Validar JWT antes de rotear
- **CORS**: Configurar uma vez só

---

## 2. NestJS: Conceitos Fundamentais

### 2.1 O que é NestJS?

NestJS é um framework Node.js que usa **TypeScript** e segue padrões de **Arquitetura Limpa** inspirados no Angular e Spring Boot (Java).

**Analogia**: Se Express.js é como ter peças de LEGO soltas, NestJS é como ter um manual de instruções detalhado de como montar um castelo.

### 2.2 Conceitos Principais

#### **Modules (Módulos)**

**O que é**: Um módulo é um container que agrupa código relacionado (controllers, services, etc).

```typescript
// auth.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Importa entidades do DB
    JwtModule.register({ secret: "jwt-secret" }), // Importa outros módulos
  ],
  controllers: [AuthController], // Registra controllers
  providers: [AuthService], // Registra services
  exports: [AuthService], // Exporta para outros módulos usarem
})
export class AuthModule {}
```

**Por que usar?**

- **Organização**: Cada feature tem seu próprio módulo
- **Reusabilidade**: Módulos podem ser importados por outros módulos
- **Lazy Loading**: Carregar módulos sob demanda

**Exemplo no projeto**:

```
apps/auth-service/src/
├── auth/
│   ├── auth.module.ts       ← Módulo de autenticação
│   ├── auth.controller.ts   ← Controller de auth
│   └── auth.service.ts      ← Service de auth
├── users/
│   ├── users.module.ts      ← Módulo de usuários
│   ├── users.controller.ts
│   └── users.service.ts
└── app.module.ts            ← Módulo raiz que importa todos
```

---

#### **Controllers (Controladores)**

**O que é**: Responsável por **receber requisições HTTP** e **retornar respostas**.

**Analogia**: É como um atendente de restaurante que:

1. Recebe o pedido do cliente (HTTP Request)
2. Passa para a cozinha (Service)
3. Retorna o prato pronto (HTTP Response)

```typescript
// tasks.controller.ts
@Controller("tasks") // Rota base: /tasks
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // GET /tasks
  @Get()
  @UseGuards(JwtAuthGuard) // Protege com autenticação
  async findAll(@Req() req) {
    return this.tasksService.findAll(req.user.id);
  }

  // POST /tasks
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  // GET /tasks/:id
  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async findOne(@Param("id") id: string) {
    return this.tasksService.findOne(+id);
  }

  // PATCH /tasks/:id
  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  async update(@Param("id") id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }
}
```

**Decorators importantes**:

- `@Controller('path')`: Define a rota base
- `@Get()`, `@Post()`, `@Patch()`, `@Delete()`: Métodos HTTP
- `@Param('id')`: Pega parâmetros da URL (`/tasks/:id`)
- `@Body()`: Pega o corpo da requisição (JSON)
- `@Query()`: Pega query params (`/tasks?status=DONE`)
- `@Req()`: Objeto completo da requisição
- `@UseGuards()`: Aplica autenticação/autorização

**Responsabilidades do Controller**:
✅ Receber requisições HTTP
✅ Validar dados de entrada (via DTOs)
✅ Chamar o Service apropriado
✅ Retornar resposta HTTP

❌ NÃO deve conter lógica de negócio
❌ NÃO deve acessar banco de dados diretamente
❌ NÃO deve manipular dados complexos

---

#### **Services (Serviços)**

**O que é**: Contém a **lógica de negócio** da aplicação.

**Analogia**: É a cozinha do restaurante - onde a comida é realmente preparada.

```typescript
// tasks.service.ts
@Injectable()  // Permite injeção de dependência
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(TaskHistory)
    private historyRepository: Repository<TaskHistory>,
    private rabbitMQService: RabbitMQService,
  ) {}

  async create(createTaskDto: CreateTaskDto, authorId: number): Promise<Task> {
    // 1. Criar a tarefa no banco
    const task = this..create({
      ...createTaskDto,tasksRepository
      authorId,
    });
    const savedTask = await this.tasksRepository.save(task);

    // 2. Salvar no histórico
    await this.historyRepository.save({
      taskId: savedTask.id,
      field: 'created',
      oldValue: null,
      newValue: JSON.stringify(savedTask),
      changedBy: authorId,
    });

    // 3. Publicar evento no RabbitMQ
    await this.rabbitMQService.publish('task.created', {
      taskId: savedTask.id,
      title: savedTask.title,
      assignees: createTaskDto.assignees,
      authorId,
    });

    return savedTask;
  }

  async findAll(userId: number): Promise<Task[]> {
    // Buscar tasks onde o usuário é autor OU está atribuído
    return this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .where('task.authorId = :userId', { userId })
      .orWhere('assignee.id = :userId', { userId })
      .orderBy('task.createdAt', 'DESC')
      .getMany();
  }
}
```

**Responsabilidades do Service**:
✅ Lógica de negócio complexa
✅ Validações de regras de negócio
✅ Interação com banco de dados
✅ Comunicação com outros serviços
✅ Publicar eventos (RabbitMQ)

**Por que separar Controller e Service?**

```typescript
// ❌ RUIM: Tudo no controller
@Controller("tasks")
export class TasksController {
  @Post()
  async create(@Body() dto: CreateTaskDto) {
    // Banco de dados no controller = RUIM
    const task = await db.tasks.insert(dto);
    await db.history.insert({ taskId: task.id });
    await rabbitmq.publish("task.created", task);
    return task;
  }
}

// ✅ BOM: Separado
@Controller("tasks")
export class TasksController {
  constructor(private service: TasksService) {}

  @Post()
  async create(@Body() dto: CreateTaskDto) {
    return this.service.create(dto); // Delega para o service
  }
}
```

**Vantagens da separação**:

- **Testabilidade**: Posso testar o service sem HTTP
- **Reusabilidade**: O mesmo service pode ser usado por múltiplos controllers
- **Manutenibilidade**: Lógica de negócio centralizada

---

#### **DTOs (Data Transfer Objects)**

**O que é**: Objetos que definem **como os dados devem ser** ao trafegar entre camadas.

**Analogia**: É como um formulário de pedido no restaurante - define exatamente quais informações você deve preencher.

```typescript
// create-task.dto.ts
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  MaxLength,
} from "class-validator";
import { TaskPriority, TaskStatus } from "@jungle/types";

export class CreateTaskDto {
  @IsString()
  @MaxLength(200)
  title: string; // Obrigatório, string, max 200 chars

  @IsString()
  @IsOptional()
  description?: string; // Opcional

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority; // Enum: LOW, MEDIUM, HIGH

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus; // Enum: TODO, IN_PROGRESS, DONE

  @IsArray()
  @IsOptional()
  assignees?: number[]; // Array de IDs de usuários
}

// update-task.dto.ts
export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  // PartialType torna todos os campos opcionais
  // Permite atualizar apenas os campos desejados
}
```

**Validação automática com class-validator**:

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Remove campos não definidos no DTO
    forbidNonWhitelisted: true, // Rejeita se enviar campos extras
    transform: true, // Transforma tipos automaticamente
  })
);
```

**Exemplo de validação em ação**:

```bash
# ❌ Requisição inválida
POST /api/tasks
{
  "title": "",  # Vazio - ERRO
  "priority": "URGENT",  # Não existe - ERRO
  "hackField": "malicious"  # Campo extra - ERRO
}

# Resposta:
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "priority must be one of: LOW, MEDIUM, HIGH",
    "property hackField should not exist"
  ],
  "error": "Bad Request"
}

# ✅ Requisição válida
POST /api/tasks
{
  "title": "Implementar feature X",
  "description": "Descrição detalhada",
  "priority": "HIGH",
  "status": "TODO",
  "assignees": [2, 3]
}
```

**Por que usar DTOs?**

- **Type Safety**: TypeScript garante tipos corretos
- **Validação**: Automaticamente valida dados de entrada
- **Documentação**: Swagger gera docs automaticamente
- **Segurança**: Previne mass assignment attacks

---

#### **Entities (Entidades)**

**O que é**: Representam **tabelas do banco de dados**.

```typescript
// task.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { User } from "../users/user.entity";

@Entity("tasks") // Nome da tabela
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "MEDIUM",
  })
  priority: string;

  @Column({
    type: "enum",
    enum: ["TODO", "IN_PROGRESS", "DONE"],
    default: "TODO",
  })
  status: string;

  @Column({ name: "author_id" })
  authorId: number;

  @ManyToOne(() => User)
  author: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: "task_assignees",
    joinColumn: { name: "task_id" },
    inverseJoinColumn: { name: "user_id" },
  })
  assignees: User[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @CreateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
```

**Decorators do TypeORM**:

- `@Entity()`: Marca como tabela
- `@PrimaryGeneratedColumn()`: ID auto-incremento
- `@Column()`: Coluna normal
- `@CreateDateColumn()`: Timestamp automático
- `@ManyToOne()`: Relação N:1 (muitas tasks → 1 autor)
- `@ManyToMany()`: Relação N:N (tasks ↔ assignees)
- `@JoinTable()`: Cria tabela intermediária

**Diferença entre Entity e DTO**:

```typescript
// Entity = Banco de dados
@Entity("tasks")
class Task {
  id: number;
  title: string;
  createdAt: Date;
  // Campos internos do banco
}

// DTO = API (entrada/saída)
class CreateTaskDto {
  title: string;
  // Apenas o que o cliente envia
}

class TaskResponseDto {
  id: number;
  title: string;
  authorName: string;
  // Dados formatados para o frontend
}
```

---

#### **Dependency Injection (Injeção de Dependência)**

**O que é**: NestJS **fornece automaticamente** as dependências que uma classe precisa.

**Sem injeção de dependência** (ruim):

```typescript
class TasksController {
  constructor() {
    // Preciso criar manualmente :(
    this.service = new TasksService(
      new TasksRepository(),
      new HistoryRepository(),
      new RabbitMQService()
    );
  }
}
```

**Com injeção de dependência** (bom):

```typescript
@Controller("tasks")
class TasksController {
  // NestJS injeta automaticamente!
  constructor(private readonly tasksService: TasksService) {}
}
```

**Como funciona?**

```typescript
// 1. Marque a classe como @Injectable()
@Injectable()
export class TasksService {
  // ...
}

// 2. Registre no módulo
@Module({
  providers: [TasksService], // ← Registra o service
  controllers: [TasksController],
})
export class TasksModule {}

// 3. NestJS cria UMA ÚNICA INSTÂNCIA (Singleton)
// e injeta onde necessário
```

**Benefícios**:

- **Singleton**: Uma única instância compartilhada
- **Testabilidade**: Fácil mockar dependências nos testes
- **Acoplamento baixo**: Classes não criam suas dependências

---

## 3. Estrutura dos Microserviços

### 3.1 Auth Service (Porta 4000)

**Responsabilidade**: Autenticação e gerenciamento de usuários.

```
apps/auth-service/src/
├── auth/
│   ├── auth.controller.ts    ← POST /register, /login, GET /profile
│   ├── auth.service.ts       ← Lógica: hash senha, gerar JWT
│   ├── auth.module.ts
│   ├── dto/
│   │   ├── register.dto.ts   ← { email, username, password }
│   │   └── login.dto.ts      ← { email, password }
│   └── strategies/
│       └── jwt.strategy.ts   ← Valida JWT e extrai usuário
├── users/
│   ├── users.service.ts      ← CRUD de usuários
│   ├── user.entity.ts        ← Tabela 'users'
│   └── users.module.ts
└── app.module.ts
```

**Fluxo de Registro**:

```
1. POST /api/auth/register
   Body: { email, username, password }

2. AuthController recebe e chama AuthService.register()

3. AuthService:
   - Verifica se email já existe
   - Hash da senha com bcrypt (salt rounds = 10)
   - Salva no banco via UsersService
   - Retorna { user, token }

4. Resposta: { user: {...}, access_token: "eyJhbG..." }
```

**Código do Service**:

```typescript
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    // Verificar duplicata
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new ConflictException("Email já existe");

    // Hash da senha
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Criar usuário
    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    // Gerar JWT
    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return { user, access_token: token };
  }
}
```

---

### 3.2 Tasks Service (Porta 5000)

**Responsabilidade**: CRUD de tarefas, comentários, histórico.

```
apps/tasks-service/src/
├── tasks/
│   ├── tasks.controller.ts   ← Rotas de tasks
│   ├── tasks.service.ts      ← Lógica de tasks
│   ├── task.entity.ts        ← Tabela 'tasks'
│   ├── task-history.entity.ts ← Tabela 'task_history'
│   └── dto/
│       ├── create-task.dto.ts
│       └── update-task.dto.ts
├── comments/
│   ├── comments.controller.ts ← POST /tasks/:id/comments
│   ├── comments.service.ts
│   ├── comment.entity.ts      ← Tabela 'comments'
│   └── dto/
│       └── create-comment.dto.ts
└── rabbitmq/
    └── rabbitmq.service.ts    ← Publicar eventos
```

**Fluxo de Criar Task**:

```
1. POST /api/tasks
   Headers: { Authorization: Bearer <token> }
   Body: { title, description, priority, status, assignees: [2, 3] }

2. JwtAuthGuard valida o token e injeta req.user

3. TasksController.create() chama TasksService.create()

4. TasksService:
   a) Cria task no banco
   b) Salva registro no task_history
   c) Publica evento 'task.created' no RabbitMQ

5. RabbitMQ entrega para NotificationsService

6. NotificationsService cria notificações para assignees
```

**Código simplificado**:

```typescript
@Injectable()
export class TasksService {
  async create(dto: CreateTaskDto, authorId: number) {
    // 1. Criar task
    const task = await this.tasksRepository.save({
      ...dto,
      authorId,
    });

    // 2. Histórico
    await this.historyRepository.save({
      taskId: task.id,
      field: "created",
      oldValue: null,
      newValue: JSON.stringify(task),
      changedBy: authorId,
    });

    // 3. Evento
    await this.rabbitMQ.publish("task.created", {
      taskId: task.id,
      title: task.title,
      assignees: dto.assignees,
      authorId,
    });

    return task;
  }
}
```

---

### 3.3 Notifications Service (Porta 6001)

**Responsabilidade**: Notificações via WebSocket e histórico.

```
apps/notifications-service/src/
├── notifications/
│   ├── notifications.controller.ts  ← GET /notifications, PATCH /read
│   ├── notifications.service.ts     ← CRUD de notificações
│   ├── notifications.consumer.ts    ← Consome RabbitMQ
│   └── notification.entity.ts       ← Tabela 'notifications'
└── websocket/
    └── websocket.gateway.ts         ← WebSocket /notifications
```

**Fluxo completo**:

```
1. Task criada → RabbitMQ recebe evento 'task.created'

2. NotificationsConsumer (escuta RabbitMQ):
   - Recebe: { taskId, title, assignees: [2, 3], authorId: 1 }
   - Para cada assignee:
     a) Cria notificação no banco
     b) Envia via WebSocket (se conectado)

3. Frontend conectado recebe:
   {
     id: 5,
     type: 'TASK_ASSIGNED',
     message: 'Você foi atribuído à tarefa: Implementar feature X',
     taskId: 1,
     timestamp: '2025-01-15T10:30:00Z'
   }

4. NotificationToast mostra o toast
```

**Consumer do RabbitMQ**:

```typescript
@Injectable()
export class NotificationsConsumer {
  constructor(
    private notificationsService: NotificationsService,
    private websocketGateway: WebSocketGateway
  ) {}

  @RabbitSubscribe({
    exchange: "tasks",
    routingKey: "task.created",
    queue: "notifications-task-created",
  })
  async handleTaskCreated(event: TaskCreatedEvent) {
    // Notificar assignees
    for (const userId of event.assignees) {
      const notification = await this.notificationsService.create({
        userId,
        type: "TASK_ASSIGNED",
        message: `Você foi atribuído à tarefa: ${event.title}`,
        taskId: event.taskId,
        metadata: event,
      });

      // Enviar via WebSocket
      this.websocketGateway.sendNotificationToUser(userId, notification);
    }
  }
}
```

---

### 3.4 API Gateway (Porta 3001)

**Responsabilidade**: Rotear requisições para os serviços corretos.

```
apps/api-gateway/src/
├── app.controller.ts         ← Rotas principais
├── app.module.ts             ← Importa módulos de proxy
└── config/
    └── proxy.config.ts       ← Configuração de rotas
```

**Como funciona o proxy**:

```typescript
// Exemplo simplificado
@Controller("api/tasks")
export class TasksProxyController {
  constructor(private httpService: HttpService) {}

  @Get()
  @UseGuards(JwtAuthGuard) // Valida JWT aqui
  async getAllTasks(@Req() req) {
    // Forward para tasks-service
    const response = await this.httpService
      .get("http://tasks-service:5000/tasks", {
        headers: { Authorization: req.headers.authorization },
      })
      .toPromise();

    return response.data;
  }
}
```

**Benefícios**:

- **Rate Limiting**: Limitar 100 requisições/minuto por IP
- **Logging**: Log centralizado de todas as requisições
- **Validação**: JWT validado uma vez só
- **CORS**: Configuração centralizada

---

## 4. Fluxo de Dados e Comunicação

### 4.1 RabbitMQ: Comunicação Assíncrona

**O que é**: Sistema de filas de mensagens - permite que serviços se comuniquem sem esperar resposta imediata.

**Analogia**: É como o correio:

- **Sem RabbitMQ**: Você vai até a casa do vizinho e espera ele abrir a porta
- **Com RabbitMQ**: Você deixa a carta na caixa de correio e vai embora

**Conceitos**:

```
Producer ──> Exchange ──> Queue ──> Consumer
(Tasks)      (tasks)     (notif)   (Notifications)
```

- **Producer**: Quem envia mensagens (Tasks Service)
- **Exchange**: Roteador de mensagens (tasks)
- **Queue**: Fila onde ficam as mensagens (notifications-task-created)
- **Consumer**: Quem processa mensagens (Notifications Service)

**Por que usar?**

```typescript
// ❌ SEM RabbitMQ (Síncrono)
async createTask(dto: CreateTaskDto) {
  const task = await this.save(dto);

  // Se NotificationsService estiver OFFLINE = ERRO FATAL
  await this.notificationsService.notify(task);  // Pode falhar!

  return task;
}

// ✅ COM RabbitMQ (Assíncrono)
async createTask(dto: CreateTaskDto) {
  const task = await this.save(dto);

  // Publica e esquece - não espera resposta
  await this.rabbitMQ.publish('task.created', task);

  return task;  // Retorna imediatamente
}
```

**Vantagens**:

- **Desacoplamento**: Serviços não precisam conhecer uns aos outros
- **Resiliência**: Se NotificationsService cair, mensagens ficam na fila
- **Escalabilidade**: Múltiplos consumers processam a fila em paralelo

**Routing Keys no projeto**:

```typescript
export const ROUTING_KEYS = {
  TASK_CREATED: "task.created", // Task criada
  TASK_UPDATED: "task.updated", // Task atualizada
  TASK_DELETED: "task.deleted", // Task deletada
  TASK_ASSIGNED: "task.assigned", // Usuário atribuído
  TASK_STATUS_CHANGED: "task.status_changed", // Status mudou
  COMMENT_CREATED: "task.comment.created", // Comentário criado
};
```

---

### 4.2 TypeORM: ORM e Banco de Dados

**O que é ORM?**: Object-Relational Mapping - escrever SQL usando objetos JavaScript.

**Sem ORM (SQL puro)**:

```typescript
const result = await db.query(
  "SELECT * FROM tasks WHERE author_id = $1 OR id IN (SELECT task_id FROM task_assignees WHERE user_id = $1)",
  [userId]
);
// Propenso a SQL Injection, difícil de manter
```

**Com ORM (TypeORM)**:

```typescript
const tasks = await this.tasksRepository
  .createQueryBuilder("task")
  .leftJoinAndSelect("task.assignees", "assignee")
  .where("task.authorId = :userId", { userId })
  .orWhere("assignee.id = :userId", { userId })
  .getMany();
// Type-safe, previne SQL Injection, fácil de ler
```

**Migrations**: Controle de versão do banco de dados

```typescript
// migration/1234567890-CreateTasksTable.ts
export class CreateTasksTable1234567890 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    await queryRunner.createTable(
      new Table({
        name: "tasks",
        columns: [
          { name: "id", type: "serial", isPrimary: true },
          { name: "title", type: "varchar", length: "200" },
          {
            name: "status",
            type: "enum",
            enum: ["TODO", "IN_PROGRESS", "DONE"],
          },
          { name: "created_at", type: "timestamp", default: "now()" },
        ],
      })
    );
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.dropTable("tasks");
  }
}
```

**Por que usar migrations?**

- **Versionamento**: Histórico de mudanças no banco
- **Reversível**: Pode voltar atrás (rollback)
- **Sincronização**: Todo mundo tem o mesmo schema

---

## 5. Banco de Dados e TypeORM

### 5.1 Relações no TypeORM

**1. One-to-Many (1:N)**

```typescript
// Um usuário tem MUITAS tasks
@Entity("users")
class User {
  @OneToMany(() => Task, (task) => task.author)
  createdTasks: Task[];
}

@Entity("tasks")
class Task {
  @ManyToOne(() => User, (user) => user.createdTasks)
  author: User;

  @Column()
  authorId: number;
}
```

**SQL gerado**:

```sql
CREATE TABLE users (id SERIAL PRIMARY KEY, ...);
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(id),
  ...
);
```

**2. Many-to-Many (N:N)**

```typescript
@Entity("tasks")
class Task {
  @ManyToMany(() => User)
  @JoinTable({
    name: "task_assignees", // Tabela intermediária
    joinColumn: { name: "task_id" },
    inverseJoinColumn: { name: "user_id" },
  })
  assignees: User[];
}
```

**SQL gerado**:

```sql
CREATE TABLE task_assignees (
  task_id INTEGER REFERENCES tasks(id),
  user_id INTEGER REFERENCES users(id),
  PRIMARY KEY (task_id, user_id)
);
```

**Consultando relações**:

```typescript
// Eager loading (carrega tudo de uma vez)
const task = await this.tasksRepository.findOne({
  where: { id },
  relations: ["author", "assignees", "comments"],
});

// Lazy loading (carrega sob demanda)
const task = await this.tasksRepository.findOne({ where: { id } });
const assignees = await task.assignees; // Carrega agora
```

---

### 5.2 Query Builder

**Queries complexas**:

```typescript
// Buscar tasks do usuário com filtros
async findUserTasks(userId: number, filters: TaskFilters) {
  const query = this.tasksRepository
    .createQueryBuilder('task')
    .leftJoinAndSelect('task.assignees', 'assignee')
    .leftJoinAndSelect('task.author', 'author')
    .where('(task.authorId = :userId OR assignee.id = :userId)', { userId });

  // Filtro de status
  if (filters.status) {
    query.andWhere('task.status = :status', { status: filters.status });
  }

  // Filtro de prioridade
  if (filters.priority) {
    query.andWhere('task.priority = :priority', { priority: filters.priority });
  }

  // Busca por texto
  if (filters.search) {
    query.andWhere(
      '(task.title ILIKE :search OR task.description ILIKE :search)',
      { search: `%${filters.search}%` }
    );
  }

  return query
    .orderBy('task.createdAt', 'DESC')
    .getMany();
}
```

---

## 6. Autenticação e Segurança

### 6.1 JWT (JSON Web Token)

**O que é**: Token assinado que contém informações do usuário.

**Estrutura**:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Header            Payload                     Signature
(algoritmo)       (dados do usuário)          (assinatura)
```

**Decodificado**:

```json
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "id": 1,
  "email": "user@example.com",
  "username": "john",
  "iat": 1516239022,  // Issued at
  "exp": 1516325422   // Expira em 24h
}

// Signature = HMACSHA256(base64(header) + "." + base64(payload), secret)
```

**Como funciona no projeto**:

```typescript
// 1. Login - Gerar JWT
@Post('login')
async login(@Body() dto: LoginDto) {
  const user = await this.authService.validateUser(dto.email, dto.password);

  const token = this.jwtService.sign({
    id: user.id,
    email: user.email,
    username: user.username,
  });

  return { access_token: token, user };
}

// 2. Requisições protegidas - Validar JWT
@Get('profile')
@UseGuards(JwtAuthGuard)  // ← Guarda que valida o token
async getProfile(@Req() req) {
  return req.user;  // user foi injetado pelo guard
}
```

**JwtAuthGuard**:

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    // Extrai token do header: Authorization: Bearer <token>
    // Valida assinatura
    // Decodifica payload
    // Injeta em req.user
    return super.canActivate(context);
  }
}
```

**JWT Strategy**:

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    // Chamado automaticamente após validar assinatura
    // O que retornar aqui vai para req.user
    return {
      id: payload.id,
      email: payload.email,
      username: payload.username,
    };
  }
}
```

---

### 6.2 Bcrypt: Hash de Senhas

**Por que hash?**

```typescript
// ❌ NUNCA FAÇA ISSO
users.save({ password: "123456" }); // Senha em texto plano no banco!

// ✅ SEMPRE FAÇA ISSO
const hash = await bcrypt.hash("123456", 10);
users.save({ password: hash }); // $2b$10$xyz... no banco
```

**Como funciona**:

```typescript
// Registro
const hash = await bcrypt.hash("minhaSenha123", 10);
// Resultado: $2b$10$N9qo8uLOickgx2ZMRZoMye.IjefHx8fDwXjD1K8JK8JK8JK8JK8JK

// Login
const isValid = await bcrypt.compare("minhaSenha123", hash);
// true - senha correta!

const isValid2 = await bcrypt.compare("senhaErrada", hash);
// false - senha incorreta
```

**Salt rounds = 10**: Quanto maior, mais seguro, mas mais lento.

---

## 7. Frontend: React e Arquitetura

### 7.1 Estrutura do Frontend

```
apps/web/src/
├── components/
│   ├── auth/                    ← LoginDialog, RegisterDialog
│   ├── tasks/                   ← TaskCard, TaskFilters, CreateTaskDialog
│   ├── notifications/           ← NotificationsDrawer, NotificationToast
│   └── ui/                      ← Componentes shadcn/ui
├── hooks/
│   ├── useTaskMutations.ts      ← Mutations de tasks (create, update, delete)
│   ├── useTaskDetail.ts         ← Query + mutations de task específica
│   └── useWebSocketConnection.ts ← Gerencia conexão WebSocket
├── routes/
│   ├── __root.tsx               ← Layout principal
│   ├── index.tsx                ← Home
│   ├── tasks.tsx                ← Lista de tasks
│   └── tasks_.$id.tsx           ← Detalhe da task
├── store/
│   ├── authStore.ts             ← Zustand: autenticação
│   └── useNotificationsStore.ts ← Zustand: notificações + WebSocket
└── lib/
    ├── api.ts                   ← Axios client + endpoints
    └── queryClient.ts           ← TanStack Query config
```

---

### 7.2 React Query (TanStack Query)

**O que é**: Gerenciamento de estado **assíncrono** (fetch, cache, sync).

**Problema sem React Query**:

```typescript
// ❌ Código repetitivo, sem cache, sem loading states
function TasksList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Error />;
  return <div>{tasks.map(...)}</div>;
}
```

**Com React Query**:

```typescript
// ✅ Simples, com cache, refetch automático
function TasksList() {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(res => res.data),
    staleTime: 5000,  // Cache válido por 5s
    refetchOnWindowFocus: true,  // Refetch ao voltar para a aba
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error />;
  return <div>{tasks.map(...)}</div>;
}
```

**Mutations (criar, atualizar, deletar)**:

```typescript
const createTaskMutation = useMutation({
  mutationFn: (data) => api.post("/tasks", data),
  onSuccess: () => {
    // Invalida cache para refetch automático
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    toast.success("Task criada!");
  },
  onError: (error) => {
    toast.error("Erro ao criar task");
  },
});

// Usar
createTaskMutation.mutate({
  title: "Nova task",
  priority: "HIGH",
});
```

---

### 7.3 Zustand: State Management

**O que é**: Alternativa leve ao Redux para estado global.

```typescript
// authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),

  login: async (email, password) => {
    const { user, access_token } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', access_token);
    set({ user, token: access_token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

// Usar em componentes
function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div>
      Olá, {user?.username}
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

**Por que Zustand vs Redux?**

- **Simples**: Menos boilerplate
- **Performático**: Re-renderiza apenas componentes que usam o estado específico
- **TypeScript**: Suporte nativo

---

### 7.4 TanStack Router

**File-based routing**:

```
routes/
├── __root.tsx          → /              (layout)
├── index.tsx           → /              (home)
├── tasks.tsx           → /tasks         (lista)
└── tasks_.$id.tsx      → /tasks/:id     (detalhe)
```

**Type-safe navigation**:

```typescript
// ✅ Type-safe
navigate({ to: "/tasks/$id", params: { id: "123" } });

// ❌ Erro de tipo
navigate({ to: "/tasks/$id" }); // Falta params.id
```

---

## 8. WebSocket e Notificações em Tempo Real

### 8.1 Como funciona WebSocket?

**HTTP tradicional** (request/response):

```
Cliente: "Tem notificações novas?"
Servidor: "Não"
(5 segundos depois)
Cliente: "E agora?"
Servidor: "Não"
(Polling = ineficiente)
```

**WebSocket** (conexão persistente):

```
Cliente: "Quero receber notificações em tempo real"
Servidor: "OK, conexão estabelecida"
(...)
Servidor: "Nova notificação!" → Cliente recebe instantaneamente
```

**Vantagens**:

- **Tempo real**: Latência mínima
- **Eficiente**: Uma conexão vs múltiplas requisições HTTP
- **Bidirecional**: Servidor pode enviar dados sem o cliente pedir

---

### 8.2 Socket.IO no Backend

```typescript
@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/notifications", // ws://localhost:6001/notifications
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<number, Set<string>>();

  handleConnection(client: Socket) {
    // Validar JWT
    const token = client.handshake.auth.token;
    const payload = this.jwtService.verify(token);

    // Armazenar socket do usuário
    if (!this.userSockets.has(payload.id)) {
      this.userSockets.set(payload.id, new Set());
    }
    this.userSockets.get(payload.id).add(client.id);

    // Juntar sala do usuário
    client.join(`user:${payload.id}`);
  }

  sendNotificationToUser(userId: number, notification: Notification) {
    // Envia para TODOS os sockets do usuário (múltiplas abas)
    this.server.to(`user:${userId}`).emit("notification", notification);
  }
}
```

---

### 8.3 Socket.IO no Frontend

```typescript
// useNotificationsStore.ts
export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  socket: null,
  isConnected: false,
  notifications: [],

  connect: (token: string) => {
    const socket = io("http://localhost:6001/notifications", {
      auth: { token },
      transports: ["polling", "websocket"],
    });

    socket.on("connect", () => {
      console.log("WebSocket conectado!");
      set({ isConnected: true });
    });

    socket.on("notification", (notification) => {
      // Adiciona notificação ao estado
      get().addNotification(notification);
    });

    set({ socket });
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
```

**NotificationToast.tsx** (mostra toasts):

```typescript
export const NotificationToast = () => {
  const notifications = useNotificationsStore((state) => state.notifications);
  const mountTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const latestNotification = notifications[0];
    if (!latestNotification) return;

    // Ignorar notificações antigas (do fetch inicial)
    const notificationTime = new Date(latestNotification.createdAt).getTime();
    if (notificationTime < mountTimeRef.current) return;

    // Mostrar toast
    toast.success("Tarefa Atribuída", {
      description: latestNotification.message,
      action: {
        label: "Ver Tarefa",
        onClick: () =>
          navigate({
            to: "/tasks/$id",
            params: { id: latestNotification.taskId },
          }),
      },
    });
  }, [notifications]);

  return null;
};
```

**Por que mountTimeRef?**

- Quando o usuário faz login, o store busca notificações antigas do banco
- Sem `mountTimeRef`, mostraria toasts para todas elas (spam!)
- Com `mountTimeRef`, só mostra toasts para notificações criadas APÓS conectar

---

## 9. Melhorias Futuras Explicadas

### 9.1 Curto Prazo

#### **1. Testes (Jest/Supertest)**

**O que são?**

- **Jest**: Framework de testes JavaScript
- **Supertest**: Testa APIs HTTP

**Por que adicionar?**

Atualmente, para verificar se o código funciona:

```bash
1. Subir todos os serviços
2. Abrir navegador
3. Fazer login
4. Criar task
5. Ver se notificação chegou
# 😫 Demorado e manual
```

Com testes:

```bash
npm test  # ✅ Testa tudo em 5 segundos
```

**Exemplo de teste**:

```typescript
// tasks.service.spec.ts
describe("TasksService", () => {
  let service: TasksService;
  let repository: Repository<Task>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository, // Mock do banco
        },
      ],
    }).compile();

    service = module.get(TasksService);
  });

  it("deve criar uma task", async () => {
    const dto = { title: "Test", priority: "HIGH" };
    const result = await service.create(dto, 1);

    expect(result.title).toBe("Test");
    expect(repository.save).toHaveBeenCalled();
  });

  it("deve rejeitar título vazio", async () => {
    await expect(service.create({ title: "" }, 1)).rejects.toThrow(
      "Título obrigatório"
    );
  });
});
```

**Teste de integração (API)**:

```typescript
// tasks.e2e-spec.ts
describe("Tasks API", () => {
  it("POST /tasks deve criar task", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Nova task", priority: "HIGH" })
      .expect(201);

    expect(response.body.title).toBe("Nova task");
  });

  it("GET /tasks deve retornar lista", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

**Benefícios**:

- ✅ Detecta bugs antes de ir pra produção
- ✅ Refatoração segura (se quebrar, teste avisa)
- ✅ Documentação viva (testes mostram como usar)
- ✅ CI/CD (testes automáticos no deploy)

---

#### **2. Logging Estruturado**

**Problema atual**:

```typescript
console.log("Task criada"); // ❌ Não tem contexto
console.log("Erro:", error); // ❌ Difícil buscar logs
```

**Solução: Winston/Pino**

```typescript
logger.info("Task criada", {
  taskId: 123,
  userId: 1,
  timestamp: new Date(),
  service: "tasks-service",
});

logger.error("Falha ao criar task", {
  error: error.message,
  stack: error.stack,
  userId: 1,
});
```

**Logs em JSON** (fácil de indexar):

```json
{
  "level": "info",
  "message": "Task criada",
  "taskId": 123,
  "userId": 1,
  "timestamp": "2025-01-15T10:30:00Z",
  "service": "tasks-service"
}
```

**Benefícios**:

- 🔍 **Buscar**: "Me mostre todos os erros do usuário 1"
- 📊 **Métricas**: "Quantas tasks criadas por hora?"
- 🚨 **Alertas**: "Se > 10 erros/min, avisar no Slack"

**Ferramentas**:

- **Winston/Pino**: Gerar logs
- **ELK Stack**: Elasticsearch + Logstash + Kibana (armazenar e visualizar)
- **Datadog/New Relic**: Monitoring como serviço

---

### 9.2 Médio Prazo

#### **1. Paginação**

**Problema atual**:

```typescript
GET / api / tasks;
// Retorna TODAS as tasks (pode ser 10.000!)
// Frontend congela
// Banco de dados sobrecarregado
```

**Solução: Cursor-based Pagination**

```typescript
GET /api/tasks?limit=20&cursor=eyJpZCI6MTIzfQ==

// Resposta
{
  "data": [...20 tasks...],
  "nextCursor": "eyJpZCI6MTQzfQ==",
  "hasMore": true
}
```

**Implementação**:

```typescript
async findAll(userId: number, limit = 20, cursor?: string) {
  const query = this.tasksRepository
    .createQueryBuilder('task')
    .where('task.authorId = :userId', { userId })
    .orderBy('task.id', 'DESC')
    .limit(limit);

  if (cursor) {
    const decodedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString());
    query.andWhere('task.id < :cursorId', { cursorId: decodedCursor.id });
  }

  const tasks = await query.getMany();

  const nextCursor = tasks.length === limit
    ? Buffer.from(JSON.stringify({ id: tasks[tasks.length - 1].id })).toString('base64')
    : null;

  return { data: tasks, nextCursor, hasMore: !!nextCursor };
}
```

**Frontend (Infinite Scroll)**:

```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['tasks'],
  queryFn: ({ pageParam }) => api.get('/tasks', { params: { cursor: pageParam } }),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});

// Scroll infinito
<InfiniteScroll onBottom={fetchNextPage} />
```

---

#### **2. Redis Cache**

**Problema**: Buscar no PostgreSQL toda vez é lento.

**Solução**: Cache em memória (Redis).

```typescript
@Injectable()
export class TasksService {
  constructor(
    private tasksRepository: Repository<Task>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async findOne(id: number): Promise<Task> {
    // 1. Tentar cache primeiro
    const cached = await this.cacheManager.get(`task:${id}`);
    if (cached) return cached;

    // 2. Se não tem no cache, buscar no banco
    const task = await this.tasksRepository.findOne({ where: { id } });

    // 3. Salvar no cache por 5 minutos
    await this.cacheManager.set(`task:${id}`, task, 300);

    return task;
  }

  async update(id: number, dto: UpdateTaskDto) {
    const task = await this.tasksRepository.update(id, dto);

    // Invalidar cache
    await this.cacheManager.del(`task:${id}`);

    return task;
  }
}
```

**Quando usar cache?**

- ✅ Dados que mudam pouco (perfil de usuário)
- ✅ Leituras frequentes (lista de tasks)
- ❌ Dados que mudam muito (notificações em tempo real)

**Estratégias de cache**:

1. **Cache-Aside**: App gerencia cache (exemplo acima)
2. **Write-Through**: Escreve no cache e banco simultaneamente
3. **Write-Behind**: Escreve no cache, depois no banco (assíncrono)

---

#### **3. CI/CD (Continuous Integration/Deployment)**

**O que é?**

- **CI**: Testar código automaticamente a cada commit
- **CD**: Deploy automático em produção

**Pipeline com GitHub Actions**:

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm install

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

  deploy:
    needs: test # Só roda se testes passarem
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
```

**Fluxo**:

```
git push
  ↓
GitHub Actions
  ↓
1. Instala dependências
2. Roda linter
3. Roda testes
4. Build
  ↓
✅ Tudo OK → Deploy automático
❌ Falhou → Notifica no Slack, bloqueia merge
```

---

#### **4. Monitoramento (Prometheus/Grafana)**

**O que monitorar?**

**Métricas de Negócio**:

- Quantas tasks criadas por hora?
- Média de tempo de resposta da API
- Taxa de erros (%)

**Métricas de Infraestrutura**:

- CPU/memória dos containers
- Conexões abertas no banco
- Tamanho da fila do RabbitMQ

**Prometheus** (coleta métricas):

```typescript
// Adicionar métrica customizada
import { Counter, Histogram } from 'prom-client';

const taskCreatedCounter = new Counter({
  name: 'tasks_created_total',
  help: 'Total de tasks criadas',
});

const apiDuration = new Histogram({
  name: 'api_duration_seconds',
  help: 'Tempo de resposta da API',
  labelNames: ['method', 'route', 'status'],
});

// Usar
@Post()
async create(@Body() dto: CreateTaskDto) {
  const start = Date.now();

  const task = await this.tasksService.create(dto);

  taskCreatedCounter.inc();  // +1 no contador
  apiDuration.observe({ method: 'POST', route: '/tasks', status: 200 }, (Date.now() - start) / 1000);

  return task;
}
```

**Grafana** (visualizar):

```
Dashboard:
┌─────────────────────────────────┐
│ Tasks Criadas/Hora: 📈 150      │
│ Tempo Médio de Resposta: 45ms   │
│ Taxa de Erro: 0.2%              │
├─────────────────────────────────┤
│ Gráfico de Linha: Requests/min  │
│       /\  /\                     │
│      /  \/  \  /\                │
│     /        \/  \               │
└─────────────────────────────────┘
```

**Alertas**:

```yaml
# alert.rules.yml
groups:
  - name: api_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(api_errors_total[5m]) > 0.05
        annotations:
          summary: "Taxa de erro alta: {{ $value }}%"
        # Envia para Slack, PagerDuty, etc.
```

---

### 9.3 Longo Prazo

#### **1. Kubernetes**

**O que é?** Orquestrador de containers - gerencia deploy, scaling, self-healing.

**Problema atual (Docker Compose)**:

```yaml
# docker-compose.yml
services:
  api-gateway:
    image: jungle/api-gateway
    replicas: 1 # Só 1 instância
    # Se cair, precisa restart manual
```

**Solução: Kubernetes**

```yaml
# api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3 # 3 instâncias automáticas
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
        - name: api-gateway
          image: jungle/api-gateway:v1.2.3
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe: # Se falhar, K8s mata e reinicia
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe: # Se não estiver pronto, não recebe tráfego
            httpGet:
              path: /ready
              port: 3001
```

**Service (Load Balancer)**:

```yaml
# api-gateway-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
spec:
  type: LoadBalancer
  selector:
    app: api-gateway
  ports:
    - port: 80
      targetPort: 3001
```

**O que Kubernetes faz automaticamente?**

- ✅ **Self-Healing**: Container caiu? Sobe outro
- ✅ **Load Balancing**: Distribui requisições entre as 3 réplicas
- ✅ **Auto-Scaling**: Muito tráfego? Sobe mais réplicas
- ✅ **Rolling Updates**: Deploy sem downtime
- ✅ **Secret Management**: Credenciais seguras

**Exemplo de Auto-Scaling**:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70 # Se CPU > 70%, sobe mais pods
```

**Quando usar Kubernetes?**

- ✅ Tráfego variável (Black Friday precisa escalar)
- ✅ Alta disponibilidade (99.99% uptime)
- ✅ Multi-região (deploy em múltiplos datacenters)
- ❌ Projeto pequeno (overhead complexidade)

---

#### **2. Event Sourcing**

**O que é?** Em vez de salvar o estado atual, salva TODOS os eventos que aconteceram.

**Arquitetura tradicional (CRUD)**:

```sql
-- Estado atual
UPDATE tasks SET status = 'DONE' WHERE id = 1;

-- Perdemos o histórico:
-- Quando mudou?
-- Quem mudou?
-- Qual era o status anterior?
```

**Event Sourcing**:

```sql
-- Salvamos TODOS os eventos
INSERT INTO events (aggregate_id, type, data) VALUES
(1, 'TaskCreated', '{"title": "Implementar feature", "status": "TODO"}'),
(1, 'TaskAssigned', '{"assignees": [2, 3]}'),
(1, 'TaskStatusChanged', '{"from": "TODO", "to": "IN_PROGRESS"}'),
(1, 'TaskStatusChanged', '{"from": "IN_PROGRESS", "to": "DONE"}');

-- Estado atual = replay de todos os eventos
```

**Exemplo no código**:

```typescript
// task.events.ts
export class TaskCreatedEvent {
  constructor(
    public readonly taskId: number,
    public readonly title: string,
    public readonly authorId: number
  ) {}
}

export class TaskStatusChangedEvent {
  constructor(
    public readonly taskId: number,
    public readonly from: TaskStatus,
    public readonly to: TaskStatus,
    public readonly changedBy: number
  ) {}
}

// task.aggregate.ts
export class TaskAggregate {
  id: number;
  title: string;
  status: TaskStatus;
  private events: Event[] = [];

  // Aplicar evento (replay)
  apply(event: Event) {
    if (event instanceof TaskCreatedEvent) {
      this.id = event.taskId;
      this.title = event.title;
      this.status = "TODO";
    } else if (event instanceof TaskStatusChangedEvent) {
      this.status = event.to;
    }
  }

  // Reconstruir estado atual
  static fromEvents(events: Event[]): TaskAggregate {
    const task = new TaskAggregate();
    events.forEach((event) => task.apply(event));
    return task;
  }

  // Mudar status (gera novo evento)
  changeStatus(newStatus: TaskStatus, userId: number) {
    if (this.status === newStatus) {
      throw new Error("Status já é esse");
    }

    const event = new TaskStatusChangedEvent(
      this.id,
      this.status,
      newStatus,
      userId
    );
    this.apply(event);
    this.events.push(event);
  }
}

// task.service.ts
@Injectable()
export class TasksService {
  async changeStatus(taskId: number, newStatus: TaskStatus, userId: number) {
    // 1. Buscar todos os eventos da task
    const events = await this.eventStore.getEvents(taskId);

    // 2. Reconstruir estado atual
    const task = TaskAggregate.fromEvents(events);

    // 3. Executar comando (gera novo evento)
    task.changeStatus(newStatus, userId);

    // 4. Salvar novo evento
    await this.eventStore.save(task.uncommittedEvents);

    // 5. Publicar no RabbitMQ
    await this.publishEvents(task.uncommittedEvents);
  }
}
```

**Benefícios**:

- 📜 **Auditoria completa**: Histórico de tudo que aconteceu
- ⏮️ **Time Travel**: Voltar ao estado de ontem
- 🐛 **Debug**: "O que causou esse bug?" → Replay dos eventos
- 📊 **Analytics**: Quantas tasks mudaram de TODO → DONE hoje?
- 🔄 **CQRS**: Separar leitura (queries) de escrita (commands)

**Desvantagens**:

- ⚠️ Complexidade alta
- 📦 Muito armazenamento (todos os eventos)
- 🐌 Replay pode ser lento (usar snapshots)

**Quando usar?**

- ✅ Sistema financeiro (precisa auditoria)
- ✅ E-commerce (histórico de pedidos)
- ✅ Sistemas colaborativos (quem mudou o quê)
- ❌ CRUD simples (overhead desnecessário)

---

## 10. Perguntas Comuns em Entrevistas

### 10.1 Arquitetura

**P: Por que usar microserviços em vez de monolito?**

**R**: Microserviços permitem:

- **Escalabilidade independente**: Se só o tasks-service tá sobrecarregado, escalo só ele
- **Deploy independente**: Posso atualizar auth-service sem mexer nos outros
- **Tecnologias diferentes**: Posso usar Node.js em um serviço e Python em outro
- **Isolamento de falhas**: Se auth-service cair, tasks-service continua funcionando
- **Times independentes**: Cada time cuida de um serviço

**Desvantagens**:

- Complexidade maior (precisa gerenciar múltiplos deploys, logs, etc)
- Latência de rede (serviços conversam via HTTP/RabbitMQ)
- Transações distribuídas (mais difícil garantir consistência)

---

**P: O que é API Gateway e por que usar?**

**R**: É um ponto de entrada único que roteia requisições para os serviços corretos.

**Benefícios**:

- **Centralização**: Frontend só conhece um endpoint
- **Autenticação**: Valida JWT uma vez, antes de rotear
- **Rate Limiting**: Evita abuse (100 req/min por IP)
- **CORS**: Configura uma vez só
- **Load Balancing**: Distribui entre múltiplas instâncias
- **Transformação**: Converte respostas (ex: XML → JSON)

---

**P: RabbitMQ vs REST API - quando usar cada um?**

**R**:

**REST API** (síncrono):

- ✅ Quando precisa de resposta imediata
- ✅ Operações CRUD simples
- Exemplo: `GET /tasks/:id` → Precisa da task agora

**RabbitMQ** (assíncrono):

- ✅ Fire-and-forget (não precisa de resposta)
- ✅ Processos demorados (enviar email, gerar relatório)
- ✅ Desacoplamento (serviços não precisam conhecer uns aos outros)
- Exemplo: Task criada → Notificar assignees (pode demorar, não bloqueante)

---

### 10.2 NestJS

**P: Qual a diferença entre Controller e Service?**

**R**:

- **Controller**: Recebe requisições HTTP, valida entrada, chama Service, retorna resposta
- **Service**: Contém lógica de negócio, acessa banco de dados, faz cálculos

**Analogia**: Controller = garçom (atende e serve), Service = cozinha (prepara a comida)

**Por que separar?**

- Testabilidade (posso testar Service sem HTTP)
- Reusabilidade (mesmo Service usado por múltiplos Controllers)
- Organização (responsabilidade única)

---

**P: O que é Dependency Injection?**

**R**: NestJS cria e fornece automaticamente as dependências que uma classe precisa.

```typescript
// NestJS faz isso automaticamente:
const tasksRepository = new TasksRepository(connection);
const historyRepository = new HistoryRepository(connection);
const rabbitMQ = new RabbitMQService(config);
const tasksService = new TasksService(
  tasksRepository,
  historyRepository,
  rabbitMQ
);
const tasksController = new TasksController(tasksService);
```

**Benefícios**:

- Singleton (uma instância compartilhada)
- Fácil de testar (mock dependências)
- Baixo acoplamento

---

### 10.3 Banco de Dados

**P: O que é ORM? Vantagens e desvantagens?**

**R**: Object-Relational Mapping - mapeia objetos JavaScript para tabelas SQL.

**Vantagens**:

- ✅ Type-safe (TypeScript)
- ✅ Previne SQL Injection
- ✅ Migrations versionadas
- ✅ Código mais legível

**Desvantagens**:

- ❌ Queries complexas podem ser ineficientes
- ❌ Abstração pode esconder problemas de performance
- ❌ Curva de aprendizado

**Quando usar SQL puro?**

- Queries muito complexas (joins múltiplos)
- Performance crítica (otimizar com EXPLAIN)
- Relatórios (agregações complexas)

---

**P: N+1 Problem - o que é e como resolver?**

**R**: Quando você faz N queries adicionais em um loop.

```typescript
// ❌ N+1 Problem
const tasks = await this.tasksRepository.find(); // 1 query
for (const task of tasks) {
  task.author = await this.usersRepository.findOne(task.authorId); // N queries
}

// ✅ Solução: Eager Loading
const tasks = await this.tasksRepository.find({
  relations: ["author"], // 1 query com JOIN
});
```

---

### 10.4 Frontend

**P: Por que React Query em vez de useState/useEffect?**

**R**: React Query gerencia estado assíncrono automaticamente.

**Problemas com useState/useEffect**:

- ❌ Código boilerplate (loading, error, data)
- ❌ Sem cache (refetch desnecessário)
- ❌ Race conditions (requests fora de ordem)

**React Query resolve**:

- ✅ Cache automático
- ✅ Refetch em background
- ✅ Dedupe (não faz requisições duplicadas)
- ✅ Optimistic updates

---

**P: Zustand vs Redux?**

**R**:

- **Redux**: Mais verboso, actions/reducers, DevTools poderoso
- **Zustand**: Simples, menos boilerplate, performático

**Quando usar Redux?**

- Estado global muito complexo
- Precisa de time-travel debugging
- Middleware complexo (sagas, thunks)

**Quando usar Zustand?**

- Estado global simples
- Quer menos código
- Performance é crítica

---

### 10.5 Segurança

**P: Como prevenir SQL Injection?**

**R**: Usar prepared statements (ORM faz isso automaticamente).

```typescript
// ❌ VULNERÁVEL
const email = req.body.email; // user@example.com' OR '1'='1
await db.query(`SELECT * FROM users WHERE email = '${email}'`);
// SQL: SELECT * FROM users WHERE email = 'user@example.com' OR '1'='1'
// Retorna TODOS os usuários!

// ✅ SEGURO (TypeORM)
await this.usersRepository.findOne({ where: { email } });
// Usa prepared statement: SELECT * FROM users WHERE email = $1
```

---

**P: O que é XSS e como prevenir?**

**R**: Cross-Site Scripting - injetar JavaScript malicioso.

```typescript
// ❌ VULNERÁVEL
const comment = '<script>alert("XSS")</script>';
<div dangerouslySetInnerHTML={{ __html: comment }} />
// Executa o script!

// ✅ SEGURO
<div>{comment}</div>
// React escapa automaticamente: &lt;script&gt;...
```

**Prevenção**:

- Sempre escapar HTML
- Content Security Policy (CSP)
- HTTPOnly cookies (JS não acessa)

---

**P: JWT vs Session - quando usar cada um?**

**R**:

**JWT**:

- ✅ Stateless (servidor não precisa armazenar sessões)
- ✅ Escalável (não precisa Redis compartilhado)
- ✅ Cross-domain (pode usar em múltiplos subdomínios)
- ❌ Não pode revogar (até expirar)
- ❌ Token grande (trafega em toda requisição)

**Session**:

- ✅ Pode revogar (deletar do Redis)
- ✅ Token pequeno (só o ID)
- ❌ Stateful (precisa Redis/DB compartilhado)
- ❌ Difícil escalar

**Quando usar JWT?**

- APIs RESTful
- Microserviços
- Mobile apps

**Quando usar Session?**

- Aplicação monolítica
- Precisa logout imediato
- Segurança extrema

---

## 11. Resumo Executivo

### Stack Tecnológica

**Backend**:

- NestJS (framework)
- TypeORM (ORM)
- PostgreSQL (banco)
- RabbitMQ (mensageria)
- Socket.IO (WebSocket)
- JWT (autenticação)
- Bcrypt (hash de senhas)

**Frontend**:

- React + TypeScript
- TanStack Router (rotas)
- TanStack Query (state assíncrono)
- Zustand (state global)
- Socket.IO Client (WebSocket)
- shadcn/ui + Tailwind (UI)

**Infraestrutura**:

- Docker + Docker Compose
- Turborepo (monorepo)
- Nginx (reverse proxy)

### Padrões Arquiteturais

- **Microserviços**: Serviços independentes e especializados
- **API Gateway**: Ponto de entrada único
- **Event-Driven**: RabbitMQ para comunicação assíncrona
- **CQRS (básico)**: Separação de comandos (mutations) e queries
- **Repository Pattern**: Abstração do banco de dados
- **Dependency Injection**: Inversão de controle

### Próximos Passos

**Curto prazo** (1-2 semanas):

- Testes unitários e E2E
- Logging estruturado (Winston)

**Médio prazo** (1-3 meses):

- Paginação e filtros avançados
- Redis cache
- CI/CD pipeline
- Monitoramento (Prometheus/Grafana)

**Longo prazo** (6+ meses):

- Kubernetes
- Event Sourcing
- Multi-tenancy

---

## 12. Recursos para Estudar

### Documentações Oficiais

- NestJS: https://docs.nestjs.com
- TypeORM: https://typeorm.io
- RabbitMQ: https://www.rabbitmq.com/tutorials
- React Query: https://tanstack.com/query
- Socket.IO: https://socket.io/docs

### Cursos Recomendados

- NestJS Zero to Hero (Udemy)
- Microservices with Node.js and React (Udemy)
- System Design Interview (educative.io)

### Livros

- "Designing Data-Intensive Applications" - Martin Kleppmann
- "Building Microservices" - Sam Newman
- "Clean Architecture" - Robert C. Martin

---

**Boa sorte na entrevista! 🚀**

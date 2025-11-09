import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommentsAndHistoryTables1731040000000
  implements MigrationInterface
{
  name = 'CreateCommentsAndHistoryTables1731040000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela de comentários
    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" SERIAL NOT NULL,
        "text" text NOT NULL,
        "authorId" integer NOT NULL,
        "taskId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comments_id" PRIMARY KEY ("id")
      )
    `);

    // Criar foreign key para tasks
    await queryRunner.query(`
      ALTER TABLE "comments"
      ADD CONSTRAINT "FK_comments_taskId"
      FOREIGN KEY ("taskId") REFERENCES "tasks"("id")
      ON DELETE CASCADE
    `);

    // Criar índice no taskId para performance
    await queryRunner.query(`
      CREATE INDEX "IDX_comments_taskId" ON "comments" ("taskId")
    `);

    // Criar índice no authorId
    await queryRunner.query(`
      CREATE INDEX "IDX_comments_authorId" ON "comments" ("authorId")
    `);

    // Criar enum para ações do histórico
    await queryRunner.query(`
      CREATE TYPE "task_history_action_enum" AS ENUM (
        'created',
        'updated',
        'commented',
        'deleted'
      )
    `);

    // Criar tabela de histórico
    await queryRunner.query(`
      CREATE TABLE "task_history" (
        "id" SERIAL NOT NULL,
        "taskId" integer NOT NULL,
        "action" "task_history_action_enum" NOT NULL,
        "userId" integer,
        "metadata" jsonb,
        "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_task_history_id" PRIMARY KEY ("id")
      )
    `);

    // Criar foreign key para tasks (sem CASCADE pois queremos manter o histórico)
    await queryRunner.query(`
      ALTER TABLE "task_history"
      ADD CONSTRAINT "FK_task_history_taskId"
      FOREIGN KEY ("taskId") REFERENCES "tasks"("id")
      ON DELETE CASCADE
    `);

    // Criar índice no taskId para performance
    await queryRunner.query(`
      CREATE INDEX "IDX_task_history_taskId" ON "task_history" ("taskId")
    `);

    // Criar índice no action
    await queryRunner.query(`
      CREATE INDEX "IDX_task_history_action" ON "task_history" ("action")
    `);

    // Criar índice no timestamp para queries ordenadas
    await queryRunner.query(`
      CREATE INDEX "IDX_task_history_timestamp" ON "task_history" ("timestamp")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices do task_history
    await queryRunner.query(`DROP INDEX "IDX_task_history_timestamp"`);
    await queryRunner.query(`DROP INDEX "IDX_task_history_action"`);
    await queryRunner.query(`DROP INDEX "IDX_task_history_taskId"`);

    // Remover foreign key e tabela task_history
    await queryRunner.query(
      `ALTER TABLE "task_history" DROP CONSTRAINT "FK_task_history_taskId"`,
    );
    await queryRunner.query(`DROP TABLE "task_history"`);

    // Remover enum
    await queryRunner.query(`DROP TYPE "task_history_action_enum"`);

    // Remover índices dos comments
    await queryRunner.query(`DROP INDEX "IDX_comments_authorId"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_taskId"`);

    // Remover foreign key e tabela comments
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_taskId"`,
    );
    await queryRunner.query(`DROP TABLE "comments"`);
  }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTasksTable1731030000000 implements MigrationInterface {
  name = "CreateTasksTable1731030000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tipos ENUM
    await queryRunner.query(`
      CREATE TYPE "task_priority_enum" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT')
    `);

    await queryRunner.query(`
      CREATE TYPE "task_status_enum" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE')
    `);

    // Criar tabela tasks
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" SERIAL NOT NULL,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "dueDate" TIMESTAMP,
        "priority" "task_priority_enum" NOT NULL DEFAULT 'MEDIUM',
        "status" "task_status_enum" NOT NULL DEFAULT 'TODO',
        "assignees" text NOT NULL DEFAULT '',
        "createdBy" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id")
      )
    `);

    // Criar índices
    await queryRunner.query(`
      CREATE INDEX "IDX_tasks_status" ON "tasks" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tasks_priority" ON "tasks" ("priority")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tasks_createdBy" ON "tasks" ("createdBy")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_tasks_createdBy"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_priority"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_status"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "task_status_enum"`);
    await queryRunner.query(`DROP TYPE "task_priority_enum"`);
  }
}

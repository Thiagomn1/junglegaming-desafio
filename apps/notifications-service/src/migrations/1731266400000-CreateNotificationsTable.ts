import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1731266400000
  implements MigrationInterface
{
  name = 'CreateNotificationsTable1731266400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for notification types
    await queryRunner.query(`
      CREATE TYPE "notifications_type_enum" AS ENUM (
        'task.created',
        'task.updated',
        'task.deleted',
        'task.assigned',
        'task.status_changed',
        'task.comment.created'
      )
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" SERIAL NOT NULL,
        "type" "notifications_type_enum" NOT NULL,
        "message" text NOT NULL,
        "userId" integer NOT NULL,
        "taskId" integer NOT NULL,
        "read" boolean NOT NULL DEFAULT false,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_userId_read"
      ON "notifications" ("userId", "read")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_userId_createdAt"
      ON "notifications" ("userId", "createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX "IDX_notifications_userId_createdAt"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_notifications_userId_read"
    `);

    // Drop table
    await queryRunner.query(`DROP TABLE "notifications"`);

    // Drop enum type
    await queryRunner.query(`DROP TYPE "notifications_type_enum"`);
  }
}

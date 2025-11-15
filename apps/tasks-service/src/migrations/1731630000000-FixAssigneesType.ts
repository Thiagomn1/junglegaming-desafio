import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAssigneesType1731630000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert existing data from text to integer array
    // First, we need to handle the existing data
    await queryRunner.query(`
      -- Create temporary column
      ALTER TABLE tasks ADD COLUMN assignees_temp INTEGER[];
    `);

    // Convert existing comma-separated values to integer array
    await queryRunner.query(`
      UPDATE tasks
      SET assignees_temp = CASE
        WHEN assignees = '' OR assignees IS NULL THEN '{}'::INTEGER[]
        ELSE string_to_array(assignees, ',')::INTEGER[]
      END;
    `);

    // Drop old column and rename new one
    await queryRunner.query(`
      ALTER TABLE tasks DROP COLUMN assignees;
      ALTER TABLE tasks RENAME COLUMN assignees_temp TO assignees;
      ALTER TABLE tasks ALTER COLUMN assignees SET DEFAULT '{}';
      ALTER TABLE tasks ALTER COLUMN assignees SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to text type
    await queryRunner.query(`
      ALTER TABLE tasks ADD COLUMN assignees_temp TEXT;
    `);

    await queryRunner.query(`
      UPDATE tasks
      SET assignees_temp = array_to_string(assignees, ',');
    `);

    await queryRunner.query(`
      ALTER TABLE tasks DROP COLUMN assignees;
      ALTER TABLE tasks RENAME COLUMN assignees_temp TO assignees;
      ALTER TABLE tasks ALTER COLUMN assignees SET DEFAULT '';
    `);
  }
}

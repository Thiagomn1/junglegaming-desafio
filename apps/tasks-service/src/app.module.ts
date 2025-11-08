import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TasksModule } from "./tasks/tasks.module";
import { Task } from "./tasks/task.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "db",
      port: 5432,
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASS || "password",
      database: process.env.DB_NAME || "challenge_db",
      entities: [Task],
      synchronize: true,
    }),
    TasksModule,
  ],
})
export class AppModule {}

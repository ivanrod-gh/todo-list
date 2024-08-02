import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { RolesModule } from './roles/roles.module';
import { Role } from './roles/role.entity';
import { ProjectsModule } from './projects/projects.module';
import { Project } from "./projects/project.entity";
import { StatusesModule } from './statuses/statuses.module';
import { Status } from "./statuses/status.entity";
import { TasksModule } from './tasks/tasks.module';
import { Task } from "./tasks/task.entity";
import { FieldsModule } from './fields/fields.module';
import { Field } from "./fields/field.entity";

@Module({
  controllers: [],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User, Role, Project, Status, Task, Field],
      synchronize: true, // миграции отсутствуют, синхронизация работает в development и production
      logging: process.env.NODE_ENV === "development" ? true : false,
    }),
    UsersModule,
    RolesModule,
    ProjectsModule,
    StatusesModule,
    TasksModule,
    FieldsModule,
  ]
})
export class AppModule {}
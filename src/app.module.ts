import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { RolesModule } from './roles/roles.module';
import { Role } from './roles/role.entity';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { Project } from "./projects/project.entity";
import { StatusesModule } from './statuses/statuses.module';
import { Status } from "./statuses/status.entity";

@Module({
  controllers: [],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}.local`
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User, Role, Project, Status],
      synchronize: process.env.NODE_ENV === 'production' ? false : true
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    ProjectsModule,
    StatusesModule,
  ]
})
export class AppModule {}
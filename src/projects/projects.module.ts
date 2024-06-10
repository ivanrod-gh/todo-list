import { Global, Module, forwardRef } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService],
  imports: [
    TypeOrmModule.forFeature([Project]),
  ],
  exports: [ProjectsService]
})
export class ProjectsModule {}

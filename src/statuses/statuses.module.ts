import { Global, Module } from '@nestjs/common';
import { StatusesController } from './statuses.controller';
import { StatusesService } from './statuses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from './status.entity';

@Global()
@Module({
  controllers: [StatusesController],
  providers: [StatusesService],
  imports: [
    TypeOrmModule.forFeature([Status]),
  ]
})
export class StatusesModule {}

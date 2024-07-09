import { Module } from '@nestjs/common';
import { FieldsController } from './fields.controller';
import { FieldsService } from './fields.service';
import { Field } from './field.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [FieldsController],
  providers: [FieldsService],
  imports: [
    TypeOrmModule.forFeature([Field]),
  ]
})
export class FieldsModule {}

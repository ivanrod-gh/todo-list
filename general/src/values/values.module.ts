import { Global, Module } from '@nestjs/common';
import { ValuesService } from './values.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StringValue } from './string-value.entity';
import { RealValue } from './real-value.entity';
import { ArrayElemValue } from './array-elem-value.entity';

@Global()
@Module({
  providers: [ValuesService],
  imports: [
    TypeOrmModule.forFeature([StringValue]),
    TypeOrmModule.forFeature([RealValue]),
    TypeOrmModule.forFeature([ArrayElemValue]),
  ],
  exports: [ValuesService]
})
export class ValuesModule {}

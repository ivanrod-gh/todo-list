import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StringValue } from './string-value.entity';
import { Repository } from 'typeorm';
import { CreateStringValueDto } from './dto/create-string-value.dto';
import { CreateRealValueDto } from './dto/create-real-value.dto';
import { RealValue } from './real-value.entity';
import { UpdateStringValueDto } from './dto/update-string-value.dto';
import { UpdateRealValueDto } from './dto/update-real-value.dto';
import { CreateArrayElemValueDto } from './dto/create-array-elem-value.dto';
import { UpdateArrayElemValueDto } from './dto/update-array-elem-value.dto';
import { ArrayElemValue } from './array-elem-value.entity';

@Injectable()
export class ValuesService {
  constructor(
    @InjectRepository(StringValue)
    private readonly stringValueRepository: Repository<StringValue>,
    @InjectRepository(RealValue)
    private readonly realValueRepository: Repository<RealValue>,
    @InjectRepository(ArrayElemValue)
    private readonly arrayElemValueRepository: Repository<ArrayElemValue>
  ) {}

  buildStringValue(dto: CreateStringValueDto | UpdateStringValueDto) {
    return this.stringValueRepository.create(dto);
  }

  buildRealValue(dto: CreateRealValueDto | UpdateRealValueDto) {
    return this.realValueRepository.create(dto);
  }

  buildArrayElemValue(dto: CreateArrayElemValueDto | UpdateArrayElemValueDto) {
    return this.arrayElemValueRepository.create(dto);
  }
}

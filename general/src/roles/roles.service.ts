import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from './role.entity';

@Injectable()
export class RolesService {

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) {}

  async getAll() {
    return await this.roleRepository.find();
  }

  async getRoleByValue(value: string) {
    return await this.roleRepository.findOneBy({ value });
  }
}

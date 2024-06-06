import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private roleService: RolesService
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const configuredData = {
      email: dto.email,
      encryptedPassword: dto.password
    }
    const user = this.userRepository.create(configuredData);

    const baseRole = await this.roleService.getRoleByValue('USER');
    user.roles = [baseRole]

    return await this.userRepository.save(user);
  }

  async getAll(): Promise<User[]> {
    return await this.userRepository.find();
  }
}

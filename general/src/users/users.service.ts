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
    private readonly roleService: RolesService
  ) {}

  async create(dto: CreateUserDto) {
    const user = this.userRepository.create({ ...dto, encryptedPassword: dto.password });

    const baseRole = await this.roleService.getRoleByValue('USER');
    user.roles = [baseRole];

    return await this.userRepository.save(user);
  }

  async getAll() {
    return await this.userRepository.find();
  }
  
  async getUserByEmail(email: string) {
    const users = await this.userRepository.findBy({ email });
    if (users.length) {
      return users[0];
    } else {
      return null;
    }
  }

  async getUserByEmailWithPassword(email: string) {
    const user = await this.getUserByEmail(email);
    return { user: user, encryptedPassword: user.encryptedPassword };
  }

  async getUserById(id: number) {
    const users = await this.userRepository.findBy({ id });
    if (users.length) {
      return users[0];
    } else {
      return null;
    }
  }
}



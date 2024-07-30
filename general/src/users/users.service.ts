import { Inject, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { RolesService } from 'src/roles/roles.service';
import { ClientProxy } from '@nestjs/microservices';
import { TimeoutError, catchError, firstValueFrom, throwError, timeout } from 'rxjs';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roleService: RolesService,
    @Inject('GO_CLIENT') private goClient: ClientProxy,
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

  async sendRequest() {

    const candidate = await firstValueFrom(this
      .goClient
      .send({ cmd: 'get' }, "request_string абвгде")
      .pipe(timeout(5000), catchError(err => this.handleMicroserviceError(err)))
    );
    // console.log(candidate)

    return {"request": candidate}
  }

  private handleMicroserviceError(err: Error) {
    if (err instanceof TimeoutError) {
      return throwError(() => new Error('Timeout'));
    }
    return throwError(() => err);
  }
}



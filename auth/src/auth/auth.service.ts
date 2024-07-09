import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, RequestTimeoutException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { TimeoutError, catchError, firstValueFrom, throwError, timeout } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {

  constructor(
    private jwtService: JwtService,
    @Inject('USER_CLIENT') private userClient: ClientProxy,
  ) {}

  async login(userDto: CreateUserDto) {
    const user = await this.validateUser(userDto);
    return this.generateToken(user);
  }

  async registration(userDto: CreateUserDto) {
    try {
      const candidate = await firstValueFrom(this
        .userClient
        .send({ role: 'user', cmd: 'get' }, userDto.email)
        .pipe(timeout(5000), catchError(err => this.handleMicroserviceError(err)))
      );
      
      if (candidate) {
        throw new Error('UserAlreadyExists');
      }
      const hashPassword = await bcrypt.hash(userDto.password, 10);
      const user = await firstValueFrom(this
        .userClient
        .send({ role: 'user', cmd: 'create' }, { ...userDto, password: hashPassword })
        .pipe(timeout(5000), catchError(err => this.handleMicroserviceError(err)))
      );
      return this.generateToken(user);
    }  catch (err) {
      if (err.message === "UserAlreadyExists") {
        throw new HttpException('Пользователь с такой почтой уже зарегистирован', HttpStatus.BAD_REQUEST);
      } else if (err.message === "Timeout") {
        throw new RequestTimeoutException({ message: 'Время ожидания истекло' });
      } else {
        throw new BadRequestException();
      }
    }
  }

  private async validateUser(userDto: CreateUserDto) {
    try {
      const userData = await firstValueFrom(this
        .userClient
        .send({ role: 'user', cmd: 'get', feature: 'with password' }, userDto.email)
        .pipe(timeout(5000), catchError(err => this.handleMicroserviceError(err)))
      );
      
      const paswordIsCorrect = await bcrypt.compare(userDto.password, userData.encryptedPassword);
      if (userData.user && paswordIsCorrect) {
        return userData.user;
      }
      throw new Error();
    } catch(err) {
      if (err.message === "Timeout") {
        throw new RequestTimeoutException({ message: 'Время ожидания истекло' });
      } else {
        throw new UnauthorizedException({ message: 'Некорректная почта или пароль' });
      }
    }
  }

  private async generateToken(user: any) {
    const payload = {
      email: user.email,
      id: user.id,
      roles: user.roles
    };
    return { token: this.jwtService.sign(payload) };
  }

  private handleMicroserviceError(err: Error) {
    if (err instanceof TimeoutError) {
      return throwError(() => new Error('Timeout'));
    }
    return throwError(() => err);
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch(err) {
      return null;
    }
  }
}

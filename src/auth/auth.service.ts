import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/user.entity';
import { ResponseToken } from './dto/response-token.dto';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(userDto: CreateUserDto): Promise<ResponseToken> {
    const user = await this.validateUser(userDto);
    return this.generateToken(user);
  }

  async registration(userDto: CreateUserDto): Promise<ResponseToken> {
    const candidate = await this.usersService.getUserByEmail(userDto.email);
    if (candidate) {
      throw new HttpException('Пользователь с такой почтой уже зарегистирован', HttpStatus.BAD_REQUEST);
    }
    const hashPassword = await bcrypt.hash(userDto.password, 10);
    const user = await this.usersService.create({...userDto, password: hashPassword});
    return this.generateToken(user);
  }

  private async validateUser(userDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.usersService.getUserByEmail(userDto.email);
      const paswordIsCorrect = await bcrypt.compare(userDto.password, user.encryptedPassword);
      if (user && paswordIsCorrect) {
        return user;
      } 
      throw new Error();
    } catch {
      throw new UnauthorizedException({ message: 'Некорректная почта или пароль' });
    }
  }

  private async generateToken(user: User): Promise<ResponseToken> {
    const payload = {
      email: user.email,
      id: user.id,
      roles: user.roles
    };
    return { token: this.jwtService.sign(payload) };
  }
}

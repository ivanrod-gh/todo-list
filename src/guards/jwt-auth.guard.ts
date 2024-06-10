import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";

@Injectable()
export class JWTAuthGuard implements CanActivate {

  constructor (
    private jwtService: JwtService,
    private usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext) {
    try {
      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers.authorization;
      const authData = authHeader.split(' ');
      const bearer = authData[0];
      const token = authData[1];
      if (bearer !== 'Bearer' || !token) {
        throw new Error('Unauthorized')
      }
      const tokenData = this.jwtService.verify(token);

      const findedUser = await this.usersService.getUserById(tokenData.id)
      if (!findedUser) {
        throw new Error('NoUserFound')
      }
      req.user = findedUser;
      // req.user = tokenData;

      return true;
    } catch (err) {
      if (err.message === "NoUserFound") {
        throw new HttpException('Пользователь не найден', HttpStatus.FORBIDDEN);
      } else {
        throw new UnauthorizedException({ message: 'Требуется аутентификация' })
      }
    }
  }
}
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable, RequestTimeoutException, UnauthorizedException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { TimeoutError, catchError, firstValueFrom, throwError, timeout } from "rxjs";
import { UsersService } from "src/users/users.service";

@Injectable()
export class JWTAuthGuard implements CanActivate {

  constructor (
    private usersService: UsersService,
    @Inject('JWT_CLIENT') private jwtClient: ClientProxy,
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

      const tokenData = await firstValueFrom(this
        .jwtClient
        .send({ role: 'token', cmd: 'verify' }, token)
        .pipe(timeout(5000), catchError(err => {
          if (err instanceof TimeoutError) {
            return throwError(() => new Error('Timeout'));
          }
          return throwError(() => err);
        }))
      );

      const findedUser = await this.usersService.getUserById(tokenData.id)
      if (!findedUser) {
        throw new Error('NoUserFound');
      }
      req.user = findedUser;
      // req.user = tokenData;

      return true;
    } catch (err) {
      if (err.message === "NoUserFound") {
        throw new HttpException('Пользователь не найден', HttpStatus.FORBIDDEN);
      } else if (err.message === "Timeout")  {
        throw new RequestTimeoutException({ message: 'Время ожидания истекло' });
      } else {
        throw new UnauthorizedException({ message: 'Требуется аутентификация' })
      }
    }
  }
}
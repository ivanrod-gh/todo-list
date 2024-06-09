import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class OwnerGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    try {
      const req = context.switchToHttp().getRequest();

      const reqUserId = req.user.id;
      const reqParamsUserId = +req.params.userId;
      if (reqUserId !== reqParamsUserId) {
        throw new Error();
      }

      const reqParamsProjectId = +req.params.projectId;
      if (reqParamsProjectId && !req.user.projects.some((elem: {id: number}) => elem.id === reqParamsProjectId)) {
        throw new Error('NoProjectFound');
      }

      return true;
    } catch (err) {
      if (err.message === "NoProjectFound") {
        throw new HttpException('Проект пользователя не найден', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException('Неавторизованный доступ', HttpStatus.FORBIDDEN);
      }
    }
  }
}
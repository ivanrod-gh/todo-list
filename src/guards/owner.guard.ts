import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Status } from "src/statuses/status.entity";

@Injectable()
export class OwnerGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    try {
      const req = context.switchToHttp().getRequest();
      const reqUserId = req.user.id;

      const reqParamsUserId = +req.params.userId;
      if (reqParamsUserId && reqUserId !== reqParamsUserId) {
        throw new Error();
      }

      const reqParamsProjectId = +req.params.projectId;
      if (reqParamsProjectId && !req.user.projects.some((elem: {id: number}) => elem.id === reqParamsProjectId)) {
        throw new Error('NoProjectFound');
      }

      const reqParamsStatusId = +req.params.statusId;
      if (reqParamsStatusId &&
        !req.user.projects.some(
          (elem: {statuses: Status[]}) => { 
            return elem.statuses.some((elem: {id: number}) => elem.id === reqParamsStatusId)
          }
        )
      ) { 
        throw new Error('NoStatusFound');
      }

      return true;
    } catch (err) {
      if (err.message === "NoProjectFound") {
        throw new HttpException('Указанный проект пользователя не найден', HttpStatus.BAD_REQUEST);
      } else if (err.message === "NoStatusFound") {
        throw new HttpException('Указанный статус проекта не найден', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException('Неавторизованный доступ', HttpStatus.FORBIDDEN);
      }
    }
  }
}
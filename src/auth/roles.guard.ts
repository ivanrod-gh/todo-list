import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles-auth.decorator";
import { Role } from "src/roles/role.entity";

@Injectable()
export class RolesGuard implements CanActivate {

  constructor (private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
      if (!requiredRoles) {
        return true;
      }
      const req = context.switchToHttp().getRequest();
      if (!req.user.roles.some((role: Role): boolean => requiredRoles.includes(role.value))) {
        throw new HttpException('Неавторизованный доступ', HttpStatus.FORBIDDEN);
      }
      return true;
    } catch (err) {
      throw new HttpException('Неавторизованный доступ', HttpStatus.FORBIDDEN);
    }
  }
}
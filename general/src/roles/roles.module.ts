import { Global, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from './role.entity';
import { RolesController } from './roles.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Global()
@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [
    TypeOrmModule.forFeature([Role]),
  ],
  exports: [
    RolesService,
  ]
})
export class RolesModule {}

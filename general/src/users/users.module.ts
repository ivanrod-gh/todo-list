import { Global, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from './user.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`
    }),
    TypeOrmModule.forFeature([User]),
    ClientsModule.register([
      {
        name: 'JWT_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [{
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST,
            port: +process.env.RABBITMQ_PORT,
            username: process.env.RABBITMQ_DEFAULT_USER,
            password: process.env.RABBITMQ_DEFAULT_PASS,
            locale: 'en_US',
            frameMax: 0,
            heartbeat: 0,
            vhost: process.env.RABBITMQ_DEFAULT_VHOST,
          }],
          queue: 'auth_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ],
  exports: [
    UsersService,
    ClientsModule,
  ]
})
export class UsersModule {}

import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`
    }),
    JwtModule.register({
      secret: process.env.JWT_PRIVATE_KEY || 'supersecret',
      signOptions: {
        expiresIn: '20h'
      }
    }),
    ClientsModule.register([
      {
        name: 'USER_CLIENT',
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
          queue: 'main_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ],
  exports: []
})
export class AuthModule {}

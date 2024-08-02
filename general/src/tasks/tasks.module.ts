import { Global, Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Global()
@Module({
  controllers: [TasksController],
  providers: [TasksService],
  imports: [
    TypeOrmModule.forFeature([Task]),
    ClientsModule.register([
      {
        name: 'GO_CLIENT',
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
          queue: 'go_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ],
  exports: [
    TasksService,
    ClientsModule,
  ]
})
export class TasksModule {}

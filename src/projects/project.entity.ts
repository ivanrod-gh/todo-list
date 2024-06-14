import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { ApiExcludeEndpoint, ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/user.entity";
import { Status } from "src/statuses/status.entity";
import { Task } from "src/tasks/task.entity";
import { Exclude, classToPlain } from "class-transformer";

@Entity("projects")
@Index(['userId', 'name'], { unique: true })
export class Project {
  @ApiProperty({example: 1, description: 'Уникальный идентификатор'})
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({example: 'Спортивные задачи', description: 'Уникальное (в рамках одного пользователя) название проекта'})
  @Column("varchar", { length: 100 })
  name: string;

  @ApiProperty({example: 'Это мои задачи, связанные со спортом', description: 'Описание проекта пользователя'})
  @Column("varchar", { length: 100, nullable: true })
  description?: string;

  @ApiProperty({example: '2024-01-01T10:10:10', description: 'Время создания записи'})
	@CreateDateColumn()
	createdAt: Date;

  @ApiProperty({example: '2024-01-01T10:10:10', description: 'Время обновления записи'})
	@UpdateDateColumn()
	updatedAt: Date;

  @ManyToOne(() => User, user => user.projects, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
	@JoinColumn({ name: 'userId' })
  user: User

  @ApiProperty({example: '1', description: 'Id пользователя, которому принадлежит проект'})
  @Column()
  userId: number;

  @ApiProperty({type: [Status], description: 'Массив сатусов проекта'})
  @OneToMany(() => Status, status => status.project, {
    eager: true,
    cascade: true,
  })
  statuses: Status[]

  @OneToMany(() => Task, task => task.project, {
    cascade: true,
  })
  tasks: Task[]

  @ApiProperty({example: "['1']", description: 'Очередность статусов проекта (согласно id)'})
  @Column("simple-array", { default: '' })
  order: string[];
}

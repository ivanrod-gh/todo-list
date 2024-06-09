import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/user.entity";

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

  @ApiProperty({type: () => User, description: 'Принадлежит пользователю)'})
  @ManyToOne(() => User, user => user.projects)
	@JoinColumn({ name: 'userId' })
  user: User

  @ApiProperty({example: '1', description: 'Id владельца'})
  @Column()
  userId: number;
}

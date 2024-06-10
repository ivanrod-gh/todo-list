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
import { Project } from "src/projects/project.entity";

@Entity("statuses")
@Index(['projectId', 'name'], { unique: true })
export class Status {
  @ApiProperty({example: 1, description: 'Уникальный идентификатор'})
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({example: 'Сделать', description: 'Уникальное (в рамках одного пользователя) название статуса'})
  @Column("varchar", { length: 100 })
  name: string;

  @ApiProperty({example: 'Задачи, которые необходимо начать выполнять', description: 'Описание статуса задач'})
  @Column("varchar", { length: 100, nullable: true })
  description?: string;

  @ApiProperty({example: '2024-01-01T10:10:10', description: 'Время создания записи'})
	@CreateDateColumn()
	createdAt: Date;

  @ApiProperty({example: '2024-01-01T10:10:10', description: 'Время обновления записи'})
	@UpdateDateColumn()
	updatedAt: Date;

  @ApiProperty({type: () => Project, description: 'Принадлежит указанному проекту'})
  @ManyToOne(() => Project, project => project.statuses)
	@JoinColumn({ name: 'projectId' })
  project: Project

   @ApiProperty({example: '1', description: 'Id проекта, которому принадлежит статус'})
  @Column()
  projectId: number;
}

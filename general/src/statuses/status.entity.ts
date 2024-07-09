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
import { ApiProperty } from "@nestjs/swagger";
import { Project } from "src/projects/project.entity";
import { Task } from "src/tasks/task.entity";

@Entity("statuses")
@Index(['projectId', 'name'], { unique: true })
export class Status {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Сделать', description: 'Уникальное (в рамках одного проекта) название статуса' })
  @Column("varchar", { length: 100 })
  name: string;

  @ApiProperty({ example: 'Задачи, которые необходимо начать выполнять', description: 'Описание статуса' })
  @Column("varchar", { length: 100, nullable: true })
  description?: string;

  @ApiProperty({ example: '2024-01-01T10:10:10', description: 'Время создания записи' })
	@CreateDateColumn()
	createdAt: Date;

  @ApiProperty({ example: '2024-01-01T10:10:10', description: 'Время обновления записи' })
	@UpdateDateColumn()
	updatedAt: Date;

  @ManyToOne(() => Project, project => project.statuses, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
	@JoinColumn({ name: 'projectId' })
  project: Project

  @ApiProperty({ example: 1, description: 'Id проекта, которому принадлежит статус' })
  @Column()
  projectId: number;

  @ApiProperty({ type: [Task], description: 'Массив задач статуса' })
  @OneToMany(() => Task, task => task.status, {
    eager: true,
    cascade: true,
  })
  tasks: Task[]

  @ApiProperty({ example: "['1']", description: 'Очередность статусов проекта (согласно id)' })
  @Column("simple-array", { default: '' })
  order: string[];
}

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
import { Status } from "src/statuses/status.entity";
import { StringValue } from "src/values/string-value.entity";
import { RealValue } from "src/values/real-value.entity";
import { ArrayElemValue } from "src/values/array-elem-value.entity";

@Entity("tasks")
@Index(['projectId', 'name'], { unique: true })
export class Task {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Пробежка', description: 'Уникальное (в рамках одного проекта) название задачи' })
  @Column("varchar", { length: 100 })
  name: string;

  @ApiProperty({ example: 'Надо пробежать 1 километр', description: 'Описание задачи' })
  @Column("varchar", { length: 100, nullable: true })
  description?: string;

  @ApiProperty({ example: '2024-01-01T10:10:10', description: 'Время создания записи' })
	@CreateDateColumn()
	createdAt: Date;

  @ApiProperty({ example: '2024-01-01T10:10:10', description: 'Время обновления записи' })
	@UpdateDateColumn()
	updatedAt: Date;

  @ManyToOne(() => Status, status => status.tasks, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
	@JoinColumn({ name: 'statusId' })
  status: Status

  @ApiProperty({ example: 1, description: 'Id статуса, которому принадлежит задача' })
  @Column()
  statusId: number;

  @ManyToOne(() => Project, project => project.tasks, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
	@JoinColumn({ name: 'projectId' })
  project: Project

  @ApiProperty({ example: 1, description: 'Id проекта, которому принадлежит задача' })
  @Column()
  projectId: number;

  @ApiProperty({ type: [StringValue], description: 'Массив значений строковых полей задачи' })
  @OneToMany(() => StringValue, stringValue => stringValue.task, {
    eager: true,
    cascade: true,
  })
  stringValues: StringValue[]

  @ApiProperty({ type: [RealValue], description: 'Массив значений числовых полей задачи' })
  @OneToMany(() => RealValue, realValue => realValue.task, {
    eager: true,
    cascade: true,
  })
  realValues: RealValue[]

  @ApiProperty({ type: [ArrayElemValue], description: 'Массив значений массивных полей задачи' })
  @OneToMany(() => ArrayElemValue, arrayElemValue => arrayElemValue.task, {
    eager: true,
    cascade: true,
  })
  arrayElemValues: ArrayElemValue[]
}

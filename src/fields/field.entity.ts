import { ApiProperty } from "@nestjs/swagger";
import { Project } from "src/projects/project.entity";
import { ArrayElemValue } from "src/values/array-elem-value.entity";
import { RealValue } from "src/values/real-value.entity";
import { StringValue } from "src/values/string-value.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum FieldEnum { "real" , "string", "array" }

@Entity("fileds")
@Index(['projectId', 'name'], { unique: true })
export class Field {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'string', description: "Тип поля - 'real', 'string' или 'array'" })
  @Column("enum", { enum: ["real", "string", "array"] })
  type: FieldEnum;

  @ApiProperty({ example: 'День недели', description: 'Уникальное (в рамках одного проекта) название поля' })
  @Column("varchar", { length: 100 })
  name: string;

  @ApiProperty({ example: "['Медленно', 'Быстро']", description: "Простой массив значений для типа поля 'array'" })
  @Column("simple-array", { nullable: true })
  value: string[];

  @ApiProperty({ example: '2024-01-01T10:10:10', description: 'Время создания записи' })
	@CreateDateColumn()
	createdAt: Date;

  @ApiProperty({ example: '2024-01-01T10:10:10', description: 'Время обновления записи' })
	@UpdateDateColumn()
	updatedAt: Date;

  @ManyToOne(() => Project, project => project.fields, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
	@JoinColumn({ name: 'projectId' })
  project: Project

  @ApiProperty({ example: '1', description: 'Id проекта, которому принадлежит поле' })
  @Column()
  projectId: number;

  @OneToMany(() => StringValue, stringValue => stringValue.field, {
    cascade: true,
  })
  stringValues: StringValue[]

  @OneToMany(() => RealValue, realValue => realValue.field, {
    cascade: true,
  })
  realValues: RealValue[]

  @OneToMany(() => ArrayElemValue, arrayElemValue => arrayElemValue.field, {
    cascade: true,
  })
  arrayElemValues: ArrayElemValue[]
}
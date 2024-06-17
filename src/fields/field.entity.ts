import { ApiProperty } from "@nestjs/swagger";
import { Project } from "src/projects/project.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum FieldEnum { "integer" , "string" }

@Entity("fileds")
@Index(['projectId', 'name'], { unique: true })
export class Field {
  @ApiProperty({example: 1, description: 'Уникальный идентификатор'})
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({example: 'string', description: 'Тип поля - перечисление integer или string'})
  @Column("enum", { enum: ["integer", "string"] })
  type: FieldEnum;

  @ApiProperty({example: 'На выполнение потребуется часов', description: 'Уникальное (в рамках одного проекта) название поля'})
  @Column("varchar", { length: 100 })
  name: string;

  @ApiProperty({example: '2024-01-01T10:10:10', description: 'Время создания записи'})
	@CreateDateColumn()
	createdAt: Date;

  @ApiProperty({example: '2024-01-01T10:10:10', description: 'Время обновления записи'})
	@UpdateDateColumn()
	updatedAt: Date;

  @ManyToOne(() => Project, project => project.fields, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
	@JoinColumn({ name: 'projectId' })
  project: Project

  @ApiProperty({example: '1', description: 'Id проекта, которому принадлежит поле'})
  @Column()
  projectId: number;
}
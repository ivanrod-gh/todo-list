import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Index,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Task } from "src/tasks/task.entity";
import { Field } from "src/fields/field.entity";

@Entity("string_values")
@Index(['field', 'taskId'], { unique: true })
export class StringValue {
  @ApiProperty({ example: 'Понедельник', description: 'Строковое значение поля' })
  @Column("varchar", { length: 100 })
  value: string;

  @ManyToOne(() => Field, field => field.stringValues, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
	@JoinColumn({ name: 'fieldId' })
  field: Field;

  @ApiProperty({ example: 1, description: 'Id поля, которому принадлежит значение' })
  @PrimaryColumn()
  fieldId: number;

  @ManyToOne(() => Task, task => task.stringValues, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
	@JoinColumn({ name: 'taskId' })
  task: Task;

  @ApiProperty({ example: 1, description: 'Id задачи, которой принадлежит значение' })
  @PrimaryColumn()
  taskId: number;
}

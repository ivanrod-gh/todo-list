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

@Entity("array_elem_values")
@Index(['field', 'taskId'], { unique: true })
export class ArrayElemValue {
  @ApiProperty({ example: 'Медленно', description: 'Строковое значение поля' })
  @Column("varchar", { length: 100 })
  value: string;

  @ManyToOne(() => Field, field => field.arrayElemValues, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
	@JoinColumn({ name: 'fieldId' })
  field: Field;

  @ApiProperty({ example: 1, description: 'Id поля, которому принадлежит значение' })
  @PrimaryColumn()
  fieldId: number;

  @ManyToOne(() => Task, task => task.arrayElemValues, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
	@JoinColumn({ name: 'taskId' })
  task: Task;

  @ApiProperty({ example: 1, description: 'Id задачи, которой принадлежит значение' })
  @PrimaryColumn()
  taskId: number;
}

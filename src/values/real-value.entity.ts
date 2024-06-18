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

@Entity("real_values")
@Index(['field', 'taskId'], { unique: true })
export class RealValue {
  @ApiProperty({ example: 10, description: 'Числовое значение поля' })
  @Column("real")
  value: number;

  @ManyToOne(() => Field, field => field.realValues, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
	@JoinColumn({ name: 'fieldId' })
  field: Field;

  @ApiProperty({ example: 1, description: 'Id поля, которому принадлежит значение' })
  @PrimaryColumn()
  fieldId: number;

  @ManyToOne(() => Task, task => task.realValues, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
	@JoinColumn({ name: 'taskId' })
  task: Task;

  @ApiProperty({ example: 1, description: 'Id задачи, которой принадлежит значение' })
  @PrimaryColumn()
  taskId: number;
}

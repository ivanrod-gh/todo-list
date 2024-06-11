import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { User } from '../users/user.entity';

@Entity("roles")
export class Role {
  @ApiProperty({example: 1, description: 'Уникальный идентификатор'})
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({example: 'USER', description: 'Уникальная роль пользователя'})
  @Column("varchar", { unique: true, length: 50 })
  value: string;

  @ApiProperty({example: 'Роль обычного пользователя', description: 'Описание роли'})
  @Column("text")
  description: string;

  @ApiProperty({example: '2024-01-01T10:10:10', description: 'Время создания записи'})
	@CreateDateColumn()
	createdAt: Date;

  @ApiProperty({example: '2024-01-01T10:10:10', description: 'Время обновления записи'})
	@UpdateDateColumn()
	updatedAt: Date;

  @ManyToMany(() => User, user => user.roles, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: "users_roles",
    joinColumn: {
      name: "roleId",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "userId",
      referencedColumnName: "id"
    }
  })
  users: User[]
}

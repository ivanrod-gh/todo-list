import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Role } from "src/roles/role.entity";
import { Project } from "src/projects/project.entity";

@Entity("users")
export class User {
  @ApiProperty({example: 1, description: 'Уникальный идентификатор'})
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({example: 'some@mail.ru', description: 'Уникальная почта пользователя'})
  @Column("varchar", { unique: true, length: 50 })
  email: string;

  @ApiProperty({example: '!@#$%^&', description: 'Зашифрованный пароль пользователя'})
  @Column("varchar", { length: 100 })
  encryptedPassword: string;

  @ApiProperty({example: '2024-01-01T10:10:10', description: 'Время создания записи'})
	@CreateDateColumn()
	createdAt: Date;

  @ApiProperty({example: '2024-01-01T10:10:10', description: 'Время обновления записи'})
	@UpdateDateColumn()
	updatedAt: Date;

  @ApiProperty({type: [Role], description: 'Массив ролей пользователя'})
  @ManyToMany(() => Role, role => role.users, {
    eager: true,
    onDelete: 'CASCADE',
  })
  roles: Role[]

  @ApiProperty({type: [Project], description: 'Массив проектов пользователя'})
  @OneToMany(() => Project, project => project.user, {
    eager: true,
    onDelete: 'CASCADE',
  })
  projects: Project[]
}

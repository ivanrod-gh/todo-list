import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { unique: true, length: 50 })
  email: string;

  @Column("varchar", { length: 100 })
  encryptedPassword: string;
}

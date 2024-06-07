import { DataSource } from "typeorm";
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import * as bcrypt from 'bcryptjs';

export async function prepareDB() {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [User, Role],
    synchronize: process.env.NODE_ENV === 'production' ? false : true
  })

  await AppDataSource.initialize();
  const manager = AppDataSource.manager

  const adminRole = await manager.findOneBy(Role, {value: 'ADMIN'});
  if (!adminRole) {
    const newRole = manager.create(Role, {value: 'ADMIN', description: 'Роль администратора'});
    await manager.save(newRole);
  }
  if (!await manager.findOneBy(Role, {value: 'USER'})) {
    const newRole = manager.create(Role, {value: 'USER', description: 'Роль обычного пользователя'});
    await manager.save(newRole);
  }
  if (!await manager.findOneBy(User, {email: process.env.ROOT_USER_MAIL})) {
    const hashPassword = await bcrypt.hash(process.env.ROOT_USER_PASSWORD, 10);
    const rootUser = manager.create(User, {
      email: process.env.ROOT_USER_MAIL,
      encryptedPassword: hashPassword,
    });
    rootUser.roles = [adminRole];
    await manager.save(rootUser);
  }

  await AppDataSource.destroy();
}

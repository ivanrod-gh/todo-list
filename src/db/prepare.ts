import { DataSource } from "typeorm";
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';

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
  const findedRole = await manager.findOneBy(Role, {value: 'USER'});
  if (!findedRole) {
    const newUser = manager.create(Role, {value: 'USER', description: 'Роль обычного пользователя'});
    await manager.save(newUser);
  }
  await AppDataSource.destroy();
}


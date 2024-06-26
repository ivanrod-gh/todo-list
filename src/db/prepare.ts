import { DataSource } from "typeorm";
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import * as bcrypt from 'bcryptjs';
import { Project } from "src/projects/project.entity";
import { Status } from "src/statuses/status.entity";
import { Task } from "src/tasks/task.entity";
import { Field } from "src/fields/field.entity";
import { StringValue } from "src/values/string-value.entity";
import { RealValue } from "src/values/real-value.entity";
import { ArrayElemValue } from "src/values/array-elem-value.entity";

export async function prepareDB() {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [User, Role, Project, Status, Task, Field, StringValue, RealValue, ArrayElemValue],
    synchronize: true,
  })

  let unconnected: boolean = true;
  while (unconnected) {
    try {
      await AppDataSource.initialize();
      console.log('The connection to the database was successfully established');
      unconnected = false;
    } catch {
      console.log('Error: Failed to connect to the database. Waiting 1000ms');
      await new Promise(function(resolve, reject) {
        setTimeout(() => resolve('Another attempt to connect to the database'), 1000);
      }).then(result => console.log(result));
    }
  }

  const manager = AppDataSource.manager

  if (!await manager.findOneBy(Role, { value: 'ADMIN' })) {
    const newRole = manager.create(Role, { value: 'ADMIN', description: 'Роль администратора' });
    await manager.save(newRole);
  }
  if (!await manager.findOneBy(Role, { value: 'USER' })) {
    const newRole = manager.create(Role, { value: 'USER', description: 'Роль обычного пользователя' });
    await manager.save(newRole);
  }
  if (!await manager.findOneBy(User, { email: process.env.ROOT_USER_MAIL })) {
    const hashPassword = await bcrypt.hash(process.env.ROOT_USER_PASSWORD, 10);
    const rootUser = manager.create(User, {
      email: process.env.ROOT_USER_MAIL,
      encryptedPassword: hashPassword,
    });
    const adminRole = await manager.findOneBy(Role, {value: 'ADMIN'});
    rootUser.roles = [adminRole];
    await manager.save(rootUser);
  }

  await AppDataSource.destroy();
}

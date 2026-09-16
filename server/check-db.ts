import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';

async function check() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  
  const admins = await dataSource.query('SELECT uid, role, account, group_code FROM user WHERE role="admin"');
  console.log('=== 管理员 ===');
  console.table(admins);
  
  const customers = await dataSource.query('SELECT uid, role, account, admin_uid FROM user WHERE role="customer"');
  console.log('=== 顾客 ===');
  console.table(customers);
  
  await app.close();
}
check();

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import configuration from './configuration';

export default (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configuration().database.host,
  port: configuration().database.port,
  username: configuration().database.user,
  password: configuration().database.pass,
  database: configuration().database.name,
  entities: [__dirname + '/../entities/*.entity.{js,ts}'],
  synchronize: true,
  extra: {
    connectionLimit: 5,
  },
});

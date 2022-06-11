const dbConfig = require('../ormconfig');
import { DataSource } from "typeorm"
// const source = new DataSource({
//   type: 'sqlite',
//   synchronize: process.env.NODE_ENV === 'test' ? true : false,
//   migrations: ['migrations/*.js'],
//   entities:
//     process.env.NODE_ENV === 'test' ? ['**/*.entity.ts'] : ['**/*.entity.js'],
//   database: process.env.NODE_ENV === 'test' ? 'test.sqlite' : 'db.sqlite',
//   migrationsRun: process.env.NODE_ENV === 'test' ? true : false,
// });

// console.log(dbConfig);

const ormconfig = new DataSource({
  ...dbConfig,
});

export default ormconfig;

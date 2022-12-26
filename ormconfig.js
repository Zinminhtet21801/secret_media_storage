var dotenv = require('dotenv');
var fs = require('fs');
var path = require('path');
// var variable = fs.readFileSync(path.resolve(__dirname, '.env.production'),'utf8');
// console.log(__dirname,dotenv.config({ path: '.env.production' }), variable);

let parsed;

if (process.env.NODE_ENV === 'production') {
  parsed = dotenv.config({ path: `.env.${process.env.NODE_ENV}` }).parsed
  // parsed = {
  //   ETHEREAL_NAME: process.env.ETHEREAL_NAME,
  //   ETHEREAL_USERNAME: process.env.ETHEREAL_USERNAME,
  //   ETHEREAL_PASSWORD: process.env.ETHEREAL_PASSWORD,
  //   BASE_URL: process.env.BASE_URL,
  //   GMAIL_USERNAME: process.env.GMAIL_USERNAME,
  //   GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
  //   JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  //   JWT_REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET_KEY,
  //   JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME,
  //   FRONT_END_URL: process.env.FRONT_END_URL,
  //   RAILWAY_POSTGRES_URL: process.env.RAILWAY_POSTGRES_URL,
  // };
} else {
  parsed = dotenv.config({ path: `.env.${process.env.NODE_ENV}` }).parsed;
}

var dbConfig = {
  synchronize: false,
  migrations: ['migrations/*.js'],
  cli: {
    migrationsDir: 'migrations',
  },
};

switch (process.env.NODE_ENV) {
  case 'development':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'db.sqlite',
      entities: ['**/*.entity.js'],
      synchronize: true,
    });
    break;
  case 'test':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'test.sqlite',
      entities: ['**/*.entity.ts'],
      migrationsRun: true,
    });
    break;
  case 'production':
    Object.assign(dbConfig, {
      type: 'postgres',
      url: parsed.RAILWAY_POSTGRES_URL,
      migrationsRun: true,
      entities: ['**/*.entity.js'],
      ssl: {
        rejectUnauthorized: false,
      },
    });
    break;
  default:
    Object.assign(dbConfig, {
      type: 'postgres',
      url: process.env.RAILWAY_POSTGRES_URL,
      migrationsRun: true,
      entities: ['**/*.entity.js'],
      ssl: {
        rejectUnauthorized: false,
      },
    });
    break;
  // throw new Error('unknown environment');
}

module.exports = dbConfig;

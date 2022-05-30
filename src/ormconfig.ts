const config = {
  type: 'sqlite',
  database: 'db.sqlite',
  entities: ['./user/entity/user.entity.ts'],
  synchronize: true,
};

module.exports = config;

const config = {
  type: 'sqlite',
  database: 'db.sqlite',
  entities: ['**/*.entity.js'],
  synchronize: true,
};

module.exports = config;

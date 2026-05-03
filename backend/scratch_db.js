const { User } = require('./src/models');
const sequelize = require('./src/config/database');

async function check() {
  await sequelize.authenticate();
  const users = await User.findAll({ attributes: ['id', 'name', 'role', 'static_user_id'], raw: true });
  console.log(users);
  process.exit(0);
}
check();

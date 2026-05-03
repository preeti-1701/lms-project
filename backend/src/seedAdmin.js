const bcrypt = require('bcryptjs');
const { User } = require('./models');

module.exports = async () => {
  try {
    const existing = await User.findOne({ where: { email: process.env.ADMIN_EMAIL } });
    if (existing) {
      console.log('ℹ️  Admin already exists');
      return;
    }
    const password_hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await User.create({
      name: 'System Admin',
      email: process.env.ADMIN_EMAIL,
      password_hash,
      role: 'admin',
      is_active: true,
      static_user_id: 'ADMIN-001',
    });
    console.log('✅ Admin user seeded:', process.env.ADMIN_EMAIL);
  } catch (err) {
    console.error('⚠️ Seed error:', err.message);
  }
};

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:          { type: DataTypes.STRING(100), allowNull: false },
  email:         { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role:          { type: DataTypes.ENUM('admin', 'trainer', 'student'), allowNull: false, defaultValue: 'student' },
  is_active:     { type: DataTypes.BOOLEAN, defaultValue: true },
  static_user_id:{ type: DataTypes.STRING(20), allowNull: true },
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = User;

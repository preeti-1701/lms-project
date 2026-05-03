const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title:         { type: DataTypes.STRING(200), allowNull: false },
  description:   { type: DataTypes.TEXT },
  category:      { type: DataTypes.STRING(100) },
  thumbnail_url: { type: DataTypes.STRING },
  trainer_id:    { type: DataTypes.UUID, allowNull: true },
  is_published:  { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'courses',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Course;

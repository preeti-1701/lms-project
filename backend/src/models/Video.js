const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Video = sequelize.define('Video', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  course_id:   { type: DataTypes.UUID, allowNull: false },
  title:       { type: DataTypes.STRING(200), allowNull: false },
  youtube_url: { type: DataTypes.STRING, allowNull: false },
  youtube_id:  { type: DataTypes.STRING(20) },
  description: { type: DataTypes.TEXT },
  duration:    { type: DataTypes.STRING(20) },
  order_index: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'videos',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Video;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseAssignment = sequelize.define('CourseAssignment', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  course_id:   { type: DataTypes.UUID, allowNull: false },
  student_id:  { type: DataTypes.UUID, allowNull: false },
  assigned_by: { type: DataTypes.UUID, allowNull: true },
}, {
  tableName: 'course_assignments',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = CourseAssignment;

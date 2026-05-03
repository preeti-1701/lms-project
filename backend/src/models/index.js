const sequelize = require('../config/database');
const User             = require('./User');
const Course           = require('./Course');
const Video            = require('./Video');
const CourseAssignment = require('./CourseAssignment');

// Associations
User.hasMany(Course, { foreignKey: 'trainer_id', as: 'courses' });
Course.belongsTo(User, { foreignKey: 'trainer_id', as: 'trainer' });

Course.hasMany(Video, { foreignKey: 'course_id', as: 'videos', onDelete: 'CASCADE' });
Video.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

Course.hasMany(CourseAssignment, { foreignKey: 'course_id', as: 'assignments', onDelete: 'CASCADE' });
CourseAssignment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

User.hasMany(CourseAssignment, { foreignKey: 'student_id', as: 'enrollments', onDelete: 'CASCADE' });
CourseAssignment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

module.exports = { sequelize, User, Course, Video, CourseAssignment };

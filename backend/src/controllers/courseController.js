const { Course, Video, CourseAssignment, User } = require('../models');
const { Op } = require('sequelize');

const extractYoutubeId = (url) => {
  const m = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/i);
  return m ? m[1] : null;
};

// GET /api/courses
const getCourses = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let courses;

    if (role === 'admin') {
      courses = await Course.findAll({
        include: [
          { model: User,  as: 'trainer',  attributes: ['id','name','email'] },
          { model: Video, as: 'videos',   attributes: ['id','title','order_index','youtube_id'] },
        ],
        order: [['created_at','DESC']],
      });
    } else if (role === 'trainer') {
      courses = await Course.findAll({
        where: { trainer_id: userId },
        include: [{ model: Video, as: 'videos' }],
        order: [['created_at','DESC']],
      });
    } else {
      // student: only assigned + published
      const assignments = await CourseAssignment.findAll({ where: { student_id: userId } });
      const ids = assignments.map(a => a.course_id);
      courses = await Course.findAll({
        where: { id: { [Op.in]: ids }, is_published: true },
        include: [
          { model: User,  as: 'trainer', attributes: ['id','name'] },
          { model: Video, as: 'videos',  order: [['order_index','ASC']] },
        ],
      });
    }
    res.json({ courses });
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/courses/:id
const getCourseById = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: User,  as: 'trainer', attributes: ['id','name','email'] },
        { model: Video, as: 'videos',  order: [['order_index','ASC']] },
      ],
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (role === 'student') {
      const enrolled = await CourseAssignment.findOne({ where: { student_id: userId, course_id: course.id } });
      if (!enrolled) return res.status(403).json({ message: 'Not enrolled in this course' });
    }
    if (role === 'trainer' && course.trainer_id !== userId)
      return res.status(403).json({ message: 'Access denied' });

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/courses
const createCourse = async (req, res) => {
  try {
    const { title, description, category, thumbnail_url, trainer_id } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

    const course = await Course.create({
      title, description, category, thumbnail_url,
      trainer_id: req.user.role === 'trainer' ? req.user.id : (trainer_id || null),
    });
    res.status(201).json({ message: 'Course created', course });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/courses/:id
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (req.user.role === 'trainer' && course.trainer_id !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });

    const { title, description, category, thumbnail_url, is_published, trainer_id } = req.body;
    const updates = {};
    if (title       !== undefined) updates.title        = title;
    if (description !== undefined) updates.description  = description;
    if (category    !== undefined) updates.category     = category;
    if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url;
    if (is_published !== undefined) updates.is_published = is_published;
    if (trainer_id !== undefined && req.user.role === 'admin') updates.trainer_id = trainer_id;

    await course.update(updates);
    res.json({ message: 'Course updated', course });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/courses/:id  (admin only)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await course.destroy();
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/courses/:id/videos
const addVideo = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (req.user.role === 'trainer' && course.trainer_id !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });

    const { title, youtube_url, description, duration } = req.body;
    if (!title || !youtube_url) return res.status(400).json({ message: 'Title and YouTube URL required' });

    const youtube_id = extractYoutubeId(youtube_url);
    if (!youtube_id) return res.status(400).json({ message: 'Invalid YouTube URL' });

    const count = await Video.count({ where: { course_id: course.id } });
    const video = await Video.create({ course_id: course.id, title, youtube_url, youtube_id, description, duration, order_index: count });
    res.status(201).json({ message: 'Video added', video });
  } catch (err) {
    console.error('Add video error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/courses/:id/videos/:videoId
const updateVideo = async (req, res) => {
  try {
    const video = await Video.findOne({ where: { id: req.params.videoId, course_id: req.params.id } });
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const { title, youtube_url, description, duration, order_index } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (youtube_url !== undefined) {
      const youtube_id = extractYoutubeId(youtube_url);
      if (!youtube_id) return res.status(400).json({ message: 'Invalid YouTube URL' });
      updates.youtube_url = youtube_url;
      updates.youtube_id  = youtube_id;
    }
    if (description !== undefined) updates.description  = description;
    if (duration    !== undefined) updates.duration     = duration;
    if (order_index !== undefined) updates.order_index  = order_index;

    await video.update(updates);
    res.json({ message: 'Video updated', video });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/courses/:id/videos/:videoId
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findOne({ where: { id: req.params.videoId, course_id: req.params.id } });
    if (!video) return res.status(404).json({ message: 'Video not found' });
    await video.destroy();
    res.json({ message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/courses/:id/assign  — admin/trainer assigns to student
const assignCourse = async (req, res) => {
  try {
    const { student_id } = req.body;
    const course  = await Course.findByPk(req.params.id);
    const student = await User.findOne({ where: { id: student_id, role: 'student' } });
    if (!course)  return res.status(404).json({ message: 'Course not found' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const exists = await CourseAssignment.findOne({ where: { course_id: course.id, student_id } });
    if (exists) return res.status(409).json({ message: 'Already assigned' });

    const a = await CourseAssignment.create({ course_id: course.id, student_id, assigned_by: req.user.id });
    res.status(201).json({ message: 'Course assigned', assignment: a });
  } catch (err) {
    console.error('Assign error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/courses/:id/assign/:studentId
const unassignCourse = async (req, res) => {
  try {
    const a = await CourseAssignment.findOne({ where: { course_id: req.params.id, student_id: req.params.studentId } });
    if (!a) return res.status(404).json({ message: 'Assignment not found' });
    await a.destroy();
    res.json({ message: 'Unassigned' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/courses/public — published courses for students
const getPublicCourses = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const courses = await Course.findAll({
      where: { is_published: true },
      include: [
        { model: User,  as: 'trainer', attributes: ['id','name'] },
        { model: Video, as: 'videos',  attributes: ['id'] },
      ],
      order: [['created_at','DESC']],
    });
    const enrollments = await CourseAssignment.findAll({ where: { student_id: userId } });
    const enrolled = new Set(enrollments.map(e => e.course_id));
    res.json({ courses: courses.map(c => ({ ...c.toJSON(), isEnrolled: enrolled.has(c.id) })) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/courses/:id/enroll — student self-enroll
const enrollCourse = async (req, res) => {
  try {
    const { id: studentId } = req.user;
    const course = await Course.findByPk(req.params.id);
    if (!course)               return res.status(404).json({ message: 'Course not found' });
    if (!course.is_published)  return res.status(403).json({ message: 'Course not available' });
    const exists = await CourseAssignment.findOne({ where: { course_id: course.id, student_id: studentId } });
    if (exists) return res.status(409).json({ message: 'Already enrolled' });
    const a = await CourseAssignment.create({ course_id: course.id, student_id: studentId, assigned_by: studentId });
    res.status(201).json({ message: 'Enrolled', assignment: a });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCourses, getCourseById, createCourse, updateCourse, deleteCourse,
  addVideo, updateVideo, deleteVideo, assignCourse, unassignCourse,
  getPublicCourses, enrollCourse,
};

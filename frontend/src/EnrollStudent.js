import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function EnrollStudent() {

  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');



  /* ---------------------------- Fetch Students / Courses --------------------------------*/
  const fetchData = async () => {

    try {

      const [studentsRes, coursesRes, enrollmentsRes] =
        await Promise.all([
          api.get('/api/students/'),
          api.get('/api/courses/'),
          api.get('/api/enrollments/')
        ]);

      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
      setEnrollments(enrollmentsRes.data);

    }
    catch (error) {
      console.error(error);
    }

  };



  useEffect(() => {
    fetchData();
  }, []);



  /* ----------------------------- Enroll Student --------------------------------*/
  const handleEnroll = async () => {

    if (!studentId || !courseId) {
      alert('Please select student and course');
      return;
    }

    try {

      await api.post(
        '/api/enroll/',
        {
          student_id: studentId,
          course_id: courseId
        }
      );

      alert(
        'Student enrolled successfully'
      );

      setStudentId('');
      setCourseId('');

      fetchData();

    }
    catch (error) {

      console.error(
        error.response
      );

      alert(
        'Enrollment failed'
      );

    }

  };



  /* ----------------------------- Remove Enrollment (optional) --------------------------------*/
  const handleRemoveEnrollment = async (id) => {

    const confirmDelete =
      window.confirm(
        'Remove this enrollment?'
      );

    if (!confirmDelete) return;

    try {

      await api.delete(
        `/api/enrollment/${id}/`
      );

      alert(
        'Enrollment removed'
      );

      fetchData();

    } catch (error) {

      console.error(error);

      alert(
        'Error removing enrollment'
      );

    }

  };



  return (
    <section className="min-h-screen bg-slate-950 relative overflow-hidden px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent opacity-30 pointer-events-none" />

      <div className="relative z-10 mx-auto mb-6 flex w-full max-w-6xl items-center justify-between px-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-slate-300 backdrop-blur-xl transition hover:border-cyan-400/30 hover:text-cyan-400"
        >
          <span aria-hidden="true">←</span>
          Back
        </button>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_24px_60px_rgba(2,6,23,0.6)] lg:grid-cols-[0.9fr_1.1fr]">
        {/* Sidebar */}
        <aside className="flex flex-col gap-5 bg-slate-900/40 px-7 py-9 text-white backdrop-blur-xl sm:px-9 sm:py-11 lg:px-10">
          <span className="w-fit rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Enrollment System
          </span>

          <div className="space-y-3">
            <h1 className="max-w-lg text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                Enrollment Management
              </span>
            </h1>
            <p className="max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              Manage student enrollments across courses with an intuitive, organized workspace.
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col gap-4 bg-slate-900/40 px-6 py-8 backdrop-blur-xl sm:px-8 sm:py-10 lg:px-10">
          <div className="space-y-2 mb-2">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Enroll Student</h2>
            <p className="text-sm text-slate-400">Select a student and course, then click enroll.</p>
          </div>

          {/* Student */}
          <div className="space-y-1.5">
            <label htmlFor="student-id" className="text-sm font-semibold text-slate-300">Student</label>
            <select
              id="student-id"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/15"
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name && s.last_name ? `${s.first_name} ${s.last_name}` : s.username}
                </option>
              ))}
            </select>
          </div>

          {/* Course */}
          <div className="space-y-1.5">
            <label htmlFor="course-id" className="text-sm font-semibold text-slate-300">Course</label>
            <select
              id="course-id"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/15"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleEnroll}
            className="mt-3 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(34,211,238,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(34,211,238,0.28)] w-full"
          >
            Enroll Student
          </button>
        </div>
      </div>


      {/* Existing Enrollments */}
      <div className="relative z-10 mx-auto w-full max-w-6xl mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Current Enrollments</h2>

        {enrollments.length === 0 && (
          <p className="text-slate-400">No enrollments yet</p>
        )}

        <div className="grid gap-4">
          {enrollments.map((e) => (
            <div key={e.id} className="flex justify-between items-center p-4 rounded-2xl border border-white/6 bg-slate-900/30">
              <div>
                <h4 className="m-0 text-base font-semibold text-white">{e.student_name}</h4>
                <p className="my-1 text-sm text-slate-300">Enrolled in: <b className="text-white ml-1">{e.course_title}</b></p>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveEnrollment(e.id)}
                className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition font-medium text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

    </section>

  );

}


export default EnrollStudent;
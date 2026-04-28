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

    <section className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(255,184,77,0.16)_0%,transparent_28%),radial-gradient(circle_at_90%_18%,rgba(13,142,123,0.14)_0%,transparent_30%),linear-gradient(155deg,#f7fbfa_0%,#eef4ff_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      
      <div className="mx-auto mb-6 flex w-full max-w-6xl items-center justify-between px-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
        >
          <span aria-hidden="true">←</span>
          Back
        </button>
      </div>

      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] shadow-[0_24px_60px_rgba(15,23,42,0.12)] lg:grid-cols-[0.85fr_1.15fr]">
        {/* Sidebar */}
        <aside className="flex flex-col gap-5 bg-[linear-gradient(160deg,#0f7f72,#0b6f88)] px-7 py-9 text-white sm:px-9 sm:py-11 lg:px-10">
          <span className="w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur">
            Enrollment System
          </span>

          <div className="space-y-3">
            <h1 className="max-w-lg text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Enrollment Management
            </h1>
            <p className="max-w-lg text-sm leading-7 text-white/82 sm:text-base">
              Manage student enrollments across courses with an intuitive, organized workspace.
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col gap-3 bg-white px-6 py-7 sm:px-8 sm:py-9 lg:px-10">
          <div className="space-y-2 mb-4">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Enroll Student</h2>
          </div>


        {/* Student */}
        <div className="space-y-1.5">
          <label htmlFor="student-id" className="text-sm font-semibold text-slate-700">Student</label>
          <select
            id="student-id"
            value={studentId}
            onChange={(e) =>
              setStudentId(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
          >

            <option value="">
              Select Student
            </option>

            {students.map((s) => (

              <option
                key={s.id}
                value={s.id}
              >

                {s.first_name && s.last_name
                  ? `${s.first_name} ${s.last_name}`
                  : s.username
                }

              </option>

            ))}

          </select>
        </div>



        {/* Course */}
        <div className="space-y-1.5">
          <label htmlFor="course-id" className="text-sm font-semibold text-slate-700">Course</label>
          <select
            id="course-id"
            value={courseId}
            onChange={(e) =>
              setCourseId(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
          >

            <option value="">
              Select Course
            </option>

            {courses.map((c) => (

              <option
                key={c.id}
                value={c.id}
              >

                {c.title}

              </option>

            ))}

          </select>
        </div>



        <button
          type="button"
          onClick={handleEnroll}
          className="mt-3 inline-flex items-center justify-center rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(13,142,123,0.24)] transition hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-[0_20px_36px_rgba(13,142,123,0.3)] w-full"
        >
          Enroll Student
        </button>

        </div>
      </div>




      {/* Existing Enrollments */}
      <div className="mx-auto w-full max-w-6xl bg-white rounded-[28px] mt-8 shadow-[0_24px_60px_rgba(15,23,42,0.12)] px-6 py-7 sm:px-8 sm:py-9 lg:px-10">

        <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl mb-6">
          Current Enrollments
        </h2>


        {enrollments.length === 0 && (
          <p className="text-gray-600">
            No enrollments yet
          </p>
        )}



        {enrollments.map((e) => (
          <div
            key={e.id}
            className="flex justify-between items-center p-4 mt-4 border border-slate-200 rounded-2xl hover:shadow-md transition bg-slate-50"
          >

            <div>

              <h4 className="m-0 text-base font-semibold text-slate-900">
                {e.student_name}
              </h4>

              <p className="my-1 text-sm text-slate-600">
                Enrolled in:
                <b className="text-slate-800 ml-1">
                  {e.course_title}
                </b>
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                handleRemoveEnrollment(
                  e.id
                )
              }
              className="bg-rose-600 text-white border-none px-4 py-2 rounded-lg cursor-pointer hover:bg-rose-700 transition font-medium text-sm"
            >
              Remove
            </button>


          </div>
        ))}


      </div>

    </section>

  );

}



export default EnrollStudent;
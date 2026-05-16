import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";

import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import StudentLogin from "./pages/StudentLogin";
import TrainerLogin from "./pages/TrainerLogin";
import AdminLogin from "./pages/AdminLogin";
import StudentSignup from "./pages/StudentSignup";
import TrainerSignup from "./pages/TrainerSignup";
import AdminSignup from "./pages/AdminSignup";
import StudentDashboard from "./pages/student/StudentDashboard";
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCourseDetails from "./pages/admin/AdminCourseDetails";
import AdminCreateCourse from "./pages/admin/AdminCreateCourse";
import AdminEditCourse from "./pages/admin/AdminEditCourse";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminTrainers from "./pages/admin/AdminTrainers";
import AdminSessions from "./pages/admin/AdminSessions";
import AdminAddChapter from "./pages/admin/AddChapter";
import AdminEnrollmentRequests from "./pages/admin/AdminEnrollmentRequests";
import EnrollmentRequests from "./pages/admin/EnrollmentRequests";
import AdminDashboardWrapper from "./pages/admin/AdminDashboardWrapper";
import AdminDashboardLanding from "./pages/admin/AdminDashboardLanding";
import StudentCourses from "./pages/student/StudentCourses";
import StudentEnrolled from "./pages/student/StudentEnrolled";
import StudentDashboardLanding from "./pages/student/StudentDashboardLanding";
import TrainerCourses from "./pages/trainer/TrainerCourses";
import TrainerCourseDetails from "./pages/trainer/TrainerCourseDetails";
import TrainerEnrollmentRequests from "./pages/trainer/TrainerEnrollmentRequests";
import TrainerAddChapter from "./pages/trainer/TrainerAddChapter";
import TrainerDashboardLanding from "./pages/trainer/TrainerDashboardLanding";
import TrainerWatchChapter from "./pages/trainer/TrainerWatchChapter";

function App() {
  return (
    <Router>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/trainer/login" element={<TrainerLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/student/signup" element={<StudentSignup />} />
        <Route path="/trainer/signup" element={<TrainerSignup/>} />
        <Route path="/admin/signup" element={<AdminSignup/>} />
        <Route path="/student/dashboard" element={<StudentDashboard/>}>
          <Route index element={<StudentDashboardLanding/>} />
          <Route path="courses" element={<StudentCourses/>} />
          <Route path="enrolled" element={<StudentEnrolled/>} />
        </Route>
        <Route path="/trainer/dashboard" element={<TrainerDashboard />}>
          <Route index element={<TrainerDashboardLanding/>} />
          <Route path="courses" element={<TrainerCourses />} />
          <Route path="enrollment-requests" element={<TrainerEnrollmentRequests />} />
          <Route path="course/:id" element={<TrainerCourseDetails />} />
          <Route path="course/:id/watch/:chapterId" element={<TrainerWatchChapter />} />
          <Route path="add-chapter/:courseId" element={<TrainerAddChapter />} />
        </Route>
        <Route path="/admin/dashboard" element={<AdminDashboardWrapper />}>
          <Route index element={<AdminDashboardLanding />} />
          <Route path="stats" element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="course/:id/edit" element={<AdminEditCourse />} />
          <Route path="course/:id" element={<AdminCourseDetails />} />
          <Route path="create-course" element={<AdminCreateCourse />} />
          <Route path="add-chapter/:courseId" element={<AdminAddChapter />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="trainers" element={<AdminTrainers />} />
          <Route path="sessions" element={<AdminSessions />} />
          <Route path="enrollment-requests" element={<AdminEnrollmentRequests />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

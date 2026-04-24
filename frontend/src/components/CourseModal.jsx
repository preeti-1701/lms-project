import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

export default function CourseModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    API.get("/users/courses/")
      .then((res) => {
        const found = res.data.find((c) => c.id === Number(id));
        setCourse(found);
      })
      .catch((err) => console.log(err));
  }, [id]);

  // ⏳ Loading state
  if (!course) {
    return <p className="p-6 text-gray-500">Loading course...</p>;
  }

  return (
    <div className="min-h-screen bg-[#f6f4f0] p-6">

      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 text-blue-500 hover:underline"
      >
        ← Back
      </button>

      {/* 🎯 Course Title */}
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>

      {/* 📺 Video */}
      <iframe
        src={course.youtube_link}
        title={course.title}
        className="w-full h-[400px] mb-6 rounded-lg"
        allowFullScreen
      ></iframe>

      {/* 📝 Description */}
      <p className="text-gray-600 mb-6">{course.description}</p>

      {/* 📊 Details */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2 text-lg">Course Details</h2>

        <p>📚 Lessons: {course.lessons || 10}</p>
        <p>⏱ Duration: {course.duration || "2h"}</p>
        <p>📈 Progress: {course.progress || 0}%</p>
      </div>

    </div>
  );
}
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

export default function CoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    API.get("/users/courses/")
      .then((res) => {
        const found = res.data.find((c) => c.id === Number(id));
        setCourse(found);
      });
  }, [id]);

  if (!course) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">{course.title}</h1>

      {/* VIDEO */}
      <iframe
        src={course.youtube_link}
        title={course.title}
        className="w-full h-[400px] mb-6"
        allowFullScreen
      ></iframe>

      {/* DESCRIPTION */}
      <p className="text-gray-600 mb-6">{course.description}</p>

      {/* EXTRA INFO */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Course Details</h2>
        <p>Lessons: {course.lessons}</p>
        <p>Duration: {course.duration}</p>
        <p>Progress: {course.progress}%</p>
      </div>

    </div>
  );
}
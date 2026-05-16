import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../utils/api";
import SecureVideoPlayer from "../../components/SecureVideoPlayer";

const TrainerWatchChapter = () => {
  const { id: courseId, chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/courses/${courseId}/`);
        setCourse(res.data);
        
        const chapterData = res.data.chapters?.find(ch => ch.id === parseInt(chapterId));
        if (chapterData) {
          setChapter(chapterData);
        } else {
          setError("Chapter not found");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    };
    if (courseId && chapterId) {
      fetchData();
    }
  }, [courseId, chapterId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!chapter) return <div>Chapter not found</div>;

  const userEmail = localStorage.getItem("email") || "trainer@example.com";

  return (
    <div className="watch-chapter-container">
      <button onClick={() => navigate(`/trainer/dashboard/course/${courseId}`)} style={{ marginBottom: "20px", padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
        Back to Course
      </button>
      {course && (
        <h2>{course.title}</h2>
      )}
      <h3>{chapter.title}</h3>
      <SecureVideoPlayer
        videoUrl={chapter.youtube_url}
        title={chapter.title}
        userEmail={userEmail}
      />
    </div>
  );
};

export default TrainerWatchChapter;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar";

export default function CourseDetail() {
  const { id } = useParams();
  const [videos, setVideos] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    api.get(`courses/${id}/videos/`)
      .then(res => {
        setVideos(res.data);
        setCurrent(res.data[0]);
      });
  }, [id]);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ display: "flex", width: "100%" }}>
        
        {/* Video Player */}
        <div style={{ flex: 3, padding: 20 }}>
          {current && (
            <>
              <h3>{current.title}</h3>
              <iframe
                width="100%"
                height="400"
                src={current.url.replace("watch?v=", "embed/")}
                title="video"
                allowFullScreen
              />
            </>
          )}
        </div>

        {/* Playlist */}
        <div style={{ flex: 1, background: "#eee", padding: 10 }}>
          <h4>Videos</h4>
          {videos.map(v => (
            <div key={v.id} onClick={() => setCurrent(v)} style={{ cursor: "pointer" }}>
              ▶ {v.title}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
import {
  useEffect,
  useState
} from "react";

import api from "../api";

import "./TrainerDashboard.css";

export default function TrainerDashboard() {

  const [page,
    setPage] = useState(
      "dashboard"
    );

  const [videos,
    setVideos] = useState([]);

  const [course,
    setCourse] = useState("");

  const [title,
    setTitle] = useState("");

  const [videoUrl,
    setVideoUrl] = useState("");

  const [editId,
    setEditId] = useState(null);

  useEffect(() => {

    fetchVideos();

  }, []);

  // FETCH COURSES + VIDEOS

  const fetchVideos = () => {

    api.get(
      "courses/all/"
    )

    .then((res) => {

      setVideos(
        res.data
      );
    })

    .catch((err) => {

      console.log(err);
    });
  };

  // ADD VIDEO

  const addVideo = () => {

    api.post(

      "courses/add-video/",

      {

        course: course,

        title: title,

        video_url: videoUrl
      }
    )

    .then(() => {

      alert(
        "Video Added"
      );

      fetchVideos();

      setCourse("");
      setTitle("");
      setVideoUrl("");
    })

    .catch((err) => {

      console.log(err);

      alert(
        "Error Adding Video"
      );
    });
  };

  // UPDATE VIDEO

  const updateVideo = () => {

    api.put(

      `courses/update-video/${editId}/`,

      {

        title: title,

        video_url: videoUrl
      }
    )

    .then(() => {

      alert(
        "Video Updated"
      );

      fetchVideos();

      setEditId(null);

      setCourse("");
      setTitle("");
      setVideoUrl("");
    })

    .catch((err) => {

      console.log(err);

      alert(
        "Error Updating Video"
      );
    });
  };

  // DELETE VIDEO

  const deleteVideo = (id) => {

    api.delete(

      `courses/delete-video/${id}/`

    )

    .then(() => {

      alert(
        "Video Deleted"
      );

      fetchVideos();
    })

    .catch((err) => {

      console.log(err);

      alert(
        "Error Deleting Video"
      );
    });
  };

  return (

    <div className="trainer-layout">

      {/* SIDEBAR */}

      <div className="sidebar">

        <h2>
          LMS
        </h2>

        <button
          onClick={() =>
            setPage(
              "dashboard"
            )
          }
        >

          Dashboard

        </button>

        <button
          onClick={() =>
            setPage(
              "manage"
            )
          }
        >

          Manage Course

        </button>

      </div>

      {/* MAIN */}

      <div className="main-content">

        {/* TOPBAR */}

        <div className="topbar">

          <h1>
            Trainer Dashboard
          </h1>

          <div className="user-info">

            <div>

              <h3>
                👤 {
                  localStorage.getItem(
                    "username"
                  )
                }
              </h3>

              <p>
                (trainer)
              </p>

            </div>

            <button

              onClick={() => {

                localStorage.clear();

                window.location.href = "/";
              }}
            >

              Logout

            </button>

          </div>

        </div>

        {/* DASHBOARD */}

        {page === "dashboard" && (

          <div className="dashboard-box">

            <h2>
              Welcome Trainer 👋
            </h2>

            <p>

              Trainers can upload,
              manage, edit and delete
              YouTube learning videos
              for assigned courses.

            </p>

          </div>
        )}

        {/* MANAGE */}

        {page === "manage" && (

          <div className="manage-box">

            <h2>
              Video Management
            </h2>

            <input
              placeholder="Course"
              value={course}
              onChange={(e) =>
                setCourse(
                  e.target.value
                )
              }
            />

            <input
              placeholder="Video Title"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
            />

            <input
              placeholder="YouTube URL"
              value={videoUrl}
              onChange={(e) =>
                setVideoUrl(
                  e.target.value
                )
              }
            />

            <button

              onClick={
                editId
                ?

                updateVideo
                :

                addVideo
              }
            >

              {
                editId
                ?

                "Update Video"
                :

                "Add Video"
              }

            </button>

            {/* VIDEO LIST */}

            <div className="video-list">

              {videos.map((c) => (

                <div
                  key={c.id}
                  className="video-card"
                >

                  <h3>
                    {c.title}
                  </h3>

                  <p>
                    {c.description}
                  </p>

                  {/* VIDEOS */}

                  {c.videos &&
                   c.videos.map((v) => (

                    <div
                      key={v.id}
                      className="video-item"
                    >

                      <p>
                        {v.title}
                      </p>

                      {/* VIEW */}

                      <a
                        href={v.video}
                        target="_blank"
                        rel="noreferrer"
                      >

                        <button>

                          View

                        </button>

                      </a>

                      {/* CHANGE */}

                      <button

                        onClick={() => {

                          setEditId(
                            v.id
                          );

                          setCourse(
                            c.title
                          );

                          setTitle(
                            v.title
                          );

                          setVideoUrl(
                            v.video
                          );
                        }}
                      >

                        Change

                      </button>

                      {/* DELETE */}

                      <button

                        onClick={() =>
                          deleteVideo(
                            v.id
                          )
                        }
                      >

                        Delete

                      </button>

                    </div>

                  ))}

                </div>

              ))}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
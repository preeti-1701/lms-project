import {
  useEffect,
  useState
} from "react";

import api from "../api";

import "./AdminDashboard.css";

export default function AdminDashboard() {

  const [page,
    setPage] = useState(
      "dashboard"
    );

  const [users,
    setUsers] = useState([]);

  const [courses,
    setCourses] = useState([]);

  const [username,
    setUsername] = useState("");

    const [deleteUsername,
  setDeleteUsername] = useState("");

  const [password,
    setPassword] = useState("");

  const [role,
    setRole] = useState("");

  const [courseTitle,
    setCourseTitle] = useState("");

  const [description,
    setDescription] = useState("");

  const [videoCourse,
    setVideoCourse] = useState("");

  const [videoTitle,
    setVideoTitle] = useState("");

  const [videoUrl,
    setVideoUrl] = useState("");

  const [student,
    setStudent] = useState("");

  const [assignCourse,
    setAssignCourse] = useState("");

  const [editId,
    setEditId] = useState(null);

  useEffect(() => {

    fetchCourses();

  }, []);

  // FETCH COURSES

  const fetchCourses = () => {

    api.get(
      "courses/all/"
    )

    .then((res) => {

      setCourses(
        res.data
      );
    });
  };

  // CREATE USER
const createUser = () => {

  api.post(

    "users/create/",

    {

      username,

      password,

      role
    }
  )

  .then((res) => {

    console.log(res.data);

    alert(
      "User Created"
    );

    setUsername("");

    setPassword("");

    setRole("");
  })

  .catch((err) => {

    console.log(err);

    alert(
      "Error Creating User"
    );
  });
};

  const deleteUser = () => {

  api.delete(

    `users/delete/${deleteUsername}/`

  )

  .then(() => {

    alert(
      "User Deleted"
    );
  })

  .catch((err) => {

    console.log(err);

    alert(
      "Error deleting user"
    );
  });
};

  // CREATE COURSE

  const createCourse = () => {

    api.post(

      "courses/create/",

      {

        title: courseTitle,

        description
      }
    )

    .then(() => {

      alert(
        "Course Created"
      );

      fetchCourses();
    });
  };

  // ADD VIDEO

  const addVideo = () => {

  api.post(

    "courses/add-video/",

    {

      course: videoCourse,

      title: videoTitle,

      video_url: videoUrl
    }
  )

  .then(() => {

    alert(
      "Video Added"
    );

    fetchCourses();

    setVideoCourse("");
    setVideoTitle("");
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

        title: videoTitle,

        video_url: videoUrl
      }
    )

    .then(() => {

      alert(
        "Video Updated"
      );

      setEditId(null);

      fetchCourses();
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

      fetchCourses();
    });
  };

  const deleteCourse = (id) => {

  api.delete(

    `courses/delete-course/${id}/`

  )

  .then(() => {

    alert(
      "Course Deleted"
    );

    fetchCourses();
  })

  .catch((err) => {

    console.log(err);

    alert(
      "Error deleting course"
    );
  });
};

  // ASSIGN COURSE

  const assign = () => {

    api.post(

      "courses/assign/",

      {

        student,

        course: assignCourse
      }
    )

    .then(() => {

      alert(
        "Course Assigned"
      );
    });
  };

  return (

    <div className="admin-layout">

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
              "users"
            )
          }
        >

          Manage Users

        </button>

        <button
          onClick={() =>
            setPage(
              "courses"
            )
          }
        >

          Manage Courses

        </button>

      </div>

      {/* MAIN */}

      <div className="main-content">

        {/* TOPBAR */}

        <div className="topbar">

          <h1>
            Admin Dashboard
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
                (admin)
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
              Welcome Admin 👋
            </h2>

            <p>

              Admin has full access
              to manage users,
              courses, videos and
              assign courses to
              students.

            </p>

          </div>
        )}

        {/* USERS */}

        {page === "users" && (

          <div className="manage-box">

            <h2>
              Create User
            </h2>

            <input
              placeholder="Username"
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
            />

            <input
              placeholder="Password"
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />

            <input
              placeholder="Role"
              onChange={(e) =>
                setRole(
                  e.target.value
                )
              }
            />

            <button
              onClick={createUser}
            >

              Create User

            </button>



    {/* DELETE USER */}

    <h2>
      Delete User
    </h2>

    <input
      placeholder="Username"

      onChange={(e) =>
        setDeleteUsername(
          e.target.value
        )
      }
    />

    <button
      onClick={deleteUser}
    >

      Delete User

    </button>


            <h2>
              Assign Course
            </h2>

            <input
              placeholder="Student Username"
              onChange={(e) =>
                setStudent(
                  e.target.value
                )
              }
            />

            <input
              placeholder="Course Title"
              onChange={(e) =>
                setAssignCourse(
                  e.target.value
                )
              }
            />

            <button
              onClick={assign}
            >

              Assign Course

            </button>

          </div>
        )}

        {/* COURSES */}

        {page === "courses" && (

          <div className="manage-box">

            <h2>
              Create Course
            </h2>

            <input
              placeholder="Course Title"
              onChange={(e) =>
                setCourseTitle(
                  e.target.value
                )
              }
            />

            <input
              placeholder="Description"
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
            />

            <button
              onClick={createCourse}
            >

              Create Course

            </button>

            <h2>
              Add Video
            </h2>

            <input
              placeholder="Course"
              onChange={(e) =>
                setVideoCourse(
                  e.target.value
                )
              }
            />

            <input
              placeholder="Video Title"
              value={videoTitle}
              onChange={(e) =>
                setVideoTitle(
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

              {courses.map((c) => (

                <div
                  key={c.id}
                  className="video-card"
                >

                  <h3>
                    {c.title}
                  </h3>
                  <button

  onClick={() =>
    deleteCourse(c.id)
  }
>

  Delete Course

</button>

                  <p>
                    {c.description}
                  </p>

                  {c.videos &&
                   c.videos.map((v) => (

                    <div
                      key={v.id}
                    >

                      <p>
                        {v.title}
                      </p>

                      <a
                        href={v.video}
                        target="_blank"
                        rel="noreferrer"
                      >

                        <button>

                          View

                        </button>

                      </a>

                      <button

                        onClick={() => {

                          setEditId(
                            v.id
                          );

                          setVideoTitle(
                            v.title
                          );

                          setVideoUrl(
                            v.video
                          );
                        }}
                      >

                        Change

                      </button>

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
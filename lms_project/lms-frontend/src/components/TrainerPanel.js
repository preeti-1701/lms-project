import { useEffect, useState } from "react";
import styles from "../styles";

function TrainerPanel({ token }) {

    // COURSES
    const [courses, setCourses] = useState([]);

    // VIDEOS
    const [videos, setVideos] = useState({});

    // VIDEO FORM
    const [videoForm, setVideoForm] = useState({
        course_id: "",
        title: "",
        youtube_url: "",
    });

    // FETCH TRAINER COURSES
    const fetchCourses = () => {

        fetch("http://127.0.0.1:8000/api/courses/", {

            headers: {
                Authorization: `Token ${token}`,
            },

        })

            .then(res => res.json())

            .then(data => {

                if (Array.isArray(data)) {

                    setCourses(data);

                    // FETCH VIDEOS FOR EACH COURSE
                    data.forEach(course => {

                        fetch(
                            `http://127.0.0.1:8000/api/courses/${course.id}/videos/`,
                            {
                                headers: {
                                    Authorization: `Token ${token}`,
                                },
                            }
                        )

                            .then(res => res.json())

                            .then(videoData => {

                                setVideos(prev => ({
                                    ...prev,
                                    [course.id]:
                                        Array.isArray(videoData)
                                            ? videoData
                                            : [],
                                }));
                            });
                    });

                } else {

                    setCourses([]);
                }
            });
    };

    useEffect(() => {

        fetchCourses();

    }, []);

    // ADD VIDEO
    const addVideo = () => {

        // VALIDATION
        if (
            !videoForm.course_id ||
            !videoForm.title ||
            !videoForm.youtube_url
        ) {

            alert("Please fill all fields");

            return;
        }

        fetch(
            "http://127.0.0.1:8000/api/videos/add/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },

                body: JSON.stringify(videoForm),
            }
        )

            .then(res => res.json())

            .then(data => {

                alert(
                    data.message || data.error
                );

                // REFRESH
                fetchCourses();

                // RESET FORM
                setVideoForm({
                    course_id: "",
                    title: "",
                    youtube_url: "",
                });
            });
    };

    return (

        <div>

            {/* HEADER */}
            <div style={{ marginBottom: "30px" }}>

                <h2>
                    Trainer Dashboard
                </h2>

                <p style={{ color: "#64748b" }}>
                    Manage your assigned courses and videos
                </p>

            </div>

            {/* DASHBOARD STATS */}
            <div style={styles.statsGrid}>

                <div style={styles.statsCard}>

                    <h3>Total Courses</h3>

                    <p style={styles.statsNumber}>
                        {courses.length}
                    </p>

                </div>

                <div style={styles.statsCard}>

                    <h3>Total Videos</h3>

                    <p style={styles.statsNumber}>

                        {
                            Object.values(videos)
                                .flat()
                                .length
                        }

                    </p>

                </div>

            </div>

            {/* ADD VIDEO */}
            <div style={styles.card}>

                <h3 style={{ marginBottom: "20px" }}>
                    Add New Video
                </h3>

                {/* COURSE */}
                <select
                    style={styles.input}

                    value={videoForm.course_id}

                    onChange={(e) =>
                        setVideoForm({
                            ...videoForm,
                            course_id: e.target.value,
                        })
                    }
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

                {/* TITLE */}
                <input
                    style={styles.input}

                    placeholder="Video Title"

                    value={videoForm.title}

                    onChange={(e) =>
                        setVideoForm({
                            ...videoForm,
                            title: e.target.value,
                        })
                    }
                />

                {/* URL */}
                <input
                    style={styles.input}

                    placeholder="YouTube URL"

                    value={videoForm.youtube_url}

                    onChange={(e) =>
                        setVideoForm({
                            ...videoForm,
                            youtube_url: e.target.value,
                        })
                    }
                />

                <button
                    style={styles.button}
                    onClick={addVideo}
                >
                    Add Video
                </button>

            </div>

            {/* COURSE LIST */}
            {courses.length === 0 ? (

                <p>No courses assigned</p>

            ) : (

                courses.map((course) => (

                    <div
                        key={course.id}
                        style={styles.card}
                    >

                        {/* COURSE HEADER */}
                        <div
                            style={{
                                marginBottom: "15px",
                            }}
                        >

                            <h3>
                                {course.title}
                            </h3>

                            <p
                                style={{
                                    color: "#64748b",
                                }}
                            >
                                {course.description}
                            </p>

                        </div>

                        {/* VIDEOS */}
                        <div>

                            <h4
                                style={{
                                    marginBottom: "12px",
                                }}
                            >
                                Course Videos
                            </h4>

                            {videos[course.id]?.length === 0 ? (

                                <p>
                                    No videos uploaded
                                </p>

                            ) : (

                                videos[course.id]?.map((video) => (

                                    <div
                                        key={video.id}

                                        style={{
                                            ...styles.videoCard,
                                            marginBottom: "12px",
                                        }}
                                    >

                                        <p
                                            style={{
                                                fontWeight: "600",
                                                marginBottom: "10px",
                                            }}
                                        >
                                            {video.title}
                                        </p>

                                        <button
                                            style={styles.button}

                                            onClick={() =>
                                                window.open(
                                                    `http://127.0.0.1:8000/api/videos/${video.id}/play/?token=${token}`,
                                                    "_blank"
                                                )
                                            }
                                        >
                                            Watch Video
                                        </button>

                                    </div>
                                ))
                            )}

                        </div>

                    </div>
                ))
            )}

        </div>
    );
}

export default TrainerPanel;
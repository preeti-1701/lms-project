import { useEffect, useState } from "react";
import styles from "../styles";

function AdminPanel({ token }) {

    // USERS
    const [users, setUsers] = useState([]);

    // COURSES
    const [courses, setCourses] = useState([]);

    // ACTIVE VIEW
    const [view, setView] = useState("dashboard");

    // TRAINERS
    const [trainers, setTrainers] = useState([]);

    // STUDENTS
    const [students, setStudents] = useState([]);

    // LOGIN ACTIVITY
    const [activities, setActivities] = useState([]);

    // USER FORM
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        role: "",
    });

    // COURSE FORM
    const [courseForm, setCourseForm] = useState({
        title: "",
        description: "",
        trainer_id: "",
    });

    // ENROLL FORM
    const [enrollForm, setEnrollForm] = useState({
        student_id: "",
        course_id: "",
    });

    // FETCH USERS
    const fetchUsers = () => {

        fetch("http://127.0.0.1:8000/api/users/", {

            headers: {
                Authorization: `Token ${token}`,
            },

        })

            .then(res => res.json())

            .then(data => {

                if (Array.isArray(data)) {

                    setUsers(data);

                    // TRAINERS
                    const trainerList = data.filter(
                        u => u.role === "trainer"
                    );

                    setTrainers(trainerList);

                    // STUDENTS
                    const studentList = data.filter(
                        u => u.role === "student"
                    );

                    setStudents(studentList);

                } else {

                    alert(
                        data.error ||
                        "Failed to fetch users"
                    );
                }
            });
    };

    // FETCH COURSES
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

                } else {

                    setCourses([]);
                }
            });
    };

    // FETCH LOGIN ACTIVITY
    const fetchActivities = () => {

        fetch("http://127.0.0.1:8000/api/activity/", {

            headers: {
                Authorization: `Token ${token}`,
            },

        })

            .then(res => res.json())

            .then(data => {

                if (Array.isArray(data)) {

                    setActivities(data);

                } else {

                    setActivities([]);
                }
            });
    };

    useEffect(() => {

        fetchUsers();

        fetchCourses();

        fetchActivities();

    }, []);

    // CREATE USER
    const createUser = () => {

        fetch(
            "http://127.0.0.1:8000/api/users/create/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },

                body: JSON.stringify(form),
            }
        )

            .then(res => res.json())

            .then(data => {

                alert(
                    data.message || data.error
                );

                fetchUsers();

                setForm({
                    username: "",
                    email: "",
                    password: "",
                    role: "",
                });
            });
    };

    // ENABLE / DISABLE USER
    const toggleUser = (id) => {

        fetch(
            `http://127.0.0.1:8000/api/users/${id}/toggle/`,
            {
                method: "POST",

                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        )

            .then(res => res.json())

            .then(data => {

                alert(
                    data.message || data.error
                );

                fetchUsers();
            });
    };

    // FORCE LOGOUT
    const forceLogout = (id) => {

        fetch(
            `http://127.0.0.1:8000/api/users/${id}/force-logout/`,
            {
                method: "POST",

                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        )

            .then(res => res.json())

            .then(data => {

                alert(
                    data.message || data.error
                );
            });
    };

    // CREATE COURSE
    const createCourse = () => {

        fetch(
            "http://127.0.0.1:8000/api/courses/create/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },

                body: JSON.stringify({
                    title: courseForm.title,
                    description: courseForm.description,
                    trainer_id: courseForm.trainer_id,
                }),
            }
        )

            .then(res => res.json())

            .then(data => {

                alert(
                    data.message || data.error
                );

                fetchCourses();

                setCourseForm({
                    title: "",
                    description: "",
                    trainer_id: "",
                });
            });
    };

    // ENROLL STUDENT
    const enrollStudent = () => {

        fetch(
            "http://127.0.0.1:8000/api/enroll/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },

                body: JSON.stringify(enrollForm),
            }
        )

            .then(res => res.json())

            .then(data => {

                alert(
                    data.message || data.error
                );

                setEnrollForm({
                    student_id: "",
                    course_id: "",
                });
            });
    };

    return (

        <div>

            {/* HEADER */}
            <div style={{ marginBottom: "30px" }}>

                <h2>Admin Dashboard</h2>

                <p style={{ color: "#64748b" }}>
                    Manage users, courses and activity
                </p>

            </div>

            {/* NAVIGATION */}
            <div
                style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "25px",
                }}
            >

                <button
                    style={styles.button}
                    onClick={() => setView("dashboard")}
                >
                    Dashboard
                </button>

                <button
                    style={styles.button}
                    onClick={() => setView("users")}
                >
                    Users
                </button>

                <button
                    style={styles.button}
                    onClick={() => setView("courses")}
                >
                    Courses
                </button>

                <button
                    style={styles.button}
                    onClick={() => setView("activity")}
                >
                    Activity Logs
                </button>

            </div>

            {/* DASHBOARD */}
            {view === "dashboard" && (

                <div style={styles.statsGrid}>

                    <div style={styles.statsCard}>

                        <h3>Total Users</h3>

                        <p style={styles.statsNumber}>
                            {users.length}
                        </p>

                    </div>

                    <div style={styles.statsCard}>

                        <h3>Total Courses</h3>

                        <p style={styles.statsNumber}>
                            {courses.length}
                        </p>

                    </div>

                    <div style={styles.statsCard}>

                        <h3>Trainers</h3>

                        <p style={styles.statsNumber}>
                            {trainers.length}
                        </p>

                    </div>

                    <div style={styles.statsCard}>

                        <h3>Students</h3>

                        <p style={styles.statsNumber}>
                            {students.length}
                        </p>

                    </div>

                </div>
            )}

            {/* USERS */}
            {view === "users" && (

                <div>

                    {/* CREATE USER */}
                    <div style={styles.card}>

                        <h3>Create User</h3>

                        <input
                            style={styles.input}
                            placeholder="Username"
                            value={form.username}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    username: e.target.value,
                                })
                            }
                        />

                        <input
                            style={styles.input}
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    email: e.target.value,
                                })
                            }
                        />

                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    password: e.target.value,
                                })
                            }
                        />

                        <select
                            style={styles.input}
                            value={form.role}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    role: e.target.value,
                                })
                            }
                        >
                            <option value="">
                                Select Role
                            </option>

                            <option value="admin">
                                Admin
                            </option>

                            <option value="trainer">
                                Trainer
                            </option>

                            <option value="student">
                                Student
                            </option>

                        </select>

                        <button
                            style={styles.button}
                            onClick={createUser}
                        >
                            Create User
                        </button>

                    </div>

                    {/* USER LIST */}
                    {users.map((u) => (

                        <div
                            key={u.id}
                            style={styles.card}
                        >

                            <h3>{u.username}</h3>

                            <p>{u.email}</p>

                            <p>
                                Role:
                                {" "}
                                <strong>
                                    {u.role}
                                </strong>
                            </p>

                            <p>
                                Status:
                                {" "}
                                <strong>
                                    {u.is_active
                                        ? "Active"
                                        : "Disabled"}
                                </strong>
                            </p>

                            <button
                                style={
                                    u.is_active
                                        ? styles.dangerBtn
                                        : styles.button
                                }

                                onClick={() =>
                                    toggleUser(u.id)
                                }
                            >
                                {u.is_active
                                    ? "Disable"
                                    : "Enable"}
                            </button>

                            <button
                                style={styles.logoutBtn}
                                onClick={() =>
                                    forceLogout(u.id)
                                }
                            >
                                Force Logout
                            </button>

                        </div>
                    ))}

                </div>
            )}

            {/* COURSES */}
            {view === "courses" && (

                <div>

                    {/* CREATE COURSE */}
                    <div style={styles.card}>

                        <h3>Create Course</h3>

                        <input
                            style={styles.input}
                            placeholder="Title"
                            value={courseForm.title}
                            onChange={(e) =>
                                setCourseForm({
                                    ...courseForm,
                                    title: e.target.value,
                                })
                            }
                        />

                        <input
                            style={styles.input}
                            placeholder="Description"
                            value={courseForm.description}
                            onChange={(e) =>
                                setCourseForm({
                                    ...courseForm,
                                    description: e.target.value,
                                })
                            }
                        />

                        <select
                            style={styles.input}
                            value={courseForm.trainer_id}
                            onChange={(e) =>
                                setCourseForm({
                                    ...courseForm,
                                    trainer_id: e.target.value,
                                })
                            }
                        >
                            <option value="">
                                Select Trainer
                            </option>

                            {trainers.map((t) => (

                                <option
                                    key={t.id}
                                    value={t.id}
                                >
                                    {t.username}
                                </option>

                            ))}

                        </select>

                        <button
                            style={styles.button}
                            onClick={createCourse}
                        >
                            Create Course
                        </button>

                    </div>

                    {/* COURSE LIST */}
                    {courses.map((c) => (

                        <div
                            key={c.id}
                            style={styles.card}
                        >

                            <h3>{c.title}</h3>

                            <p>{c.description}</p>

                            <p>
                                Trainer:
                                {" "}
                                <strong>
                                    {c.trainer}
                                </strong>
                            </p>

                        </div>
                    ))}

                    {/* ENROLLMENT */}
                    <div style={styles.card}>

                        <h3>Enroll Student</h3>

                        <select
                            style={styles.input}
                            value={enrollForm.student_id}
                            onChange={(e) =>
                                setEnrollForm({
                                    ...enrollForm,
                                    student_id: e.target.value,
                                })
                            }
                        >
                            <option value="">
                                Select Student
                            </option>

                            {students.map((s) => (

                                <option
                                    key={s.id}
                                    value={s.id}
                                >
                                    {s.username}
                                </option>

                            ))}

                        </select>

                        <select
                            style={styles.input}
                            value={enrollForm.course_id}
                            onChange={(e) =>
                                setEnrollForm({
                                    ...enrollForm,
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

                        <button
                            style={styles.button}
                            onClick={enrollStudent}
                        >
                            Enroll Student
                        </button>

                    </div>

                </div>
            )}

            {/* ACTIVITY LOGS */}
            {view === "activity" && (

                <div>

                    <h2>Login Activity</h2>

                    {activities.length === 0 ? (

                        <p>No activity found</p>

                    ) : (

                        activities.map((a, index) => (

                            <div
                                key={index}
                                style={styles.card}
                            >

                                <p>
                                    <strong>User:</strong>
                                    {" "}
                                    {a.username}
                                </p>

                                <p>
                                    <strong>IP:</strong>
                                    {" "}
                                    {a.ip_address}
                                </p>

                                <p>
                                    <strong>Device:</strong>
                                    {" "}
                                    {a.device}
                                </p>

                                <p>
                                    <strong>Login Time:</strong>
                                    {" "}
                                    {a.login_time}
                                </p>

                            </div>
                        ))
                    )}

                </div>
            )}

        </div>
    );
}

export default AdminPanel;
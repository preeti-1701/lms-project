// ================= GLOBAL VARIABLES =================

let currentVideoId = null;
let completedVideos = 0;
let totalVideos = 0;

let player = null;

let currentVideoDuration = 0;

let progressChecker = null;

let watchedVideos = [];


// ================= LOGIN =================

async function login() {

    let username =
        document.getElementById("username").value;

    let password =
        document.getElementById("password").value;

    if (!username || !password) {

        alert("Enter username and password");

        return;
    }

    try {

        let response = await fetch(
            "http://127.0.0.1:8000/api/token/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );

        let data = await response.json();

        if (!response.ok) {

            alert("Invalid Username or Password");

            return;
        }

        // SAVE TOKEN

        localStorage.setItem(
            "token",
            data.access
        );

        // GET USER INFO

        let userResponse = await fetch(
            "http://127.0.0.1:8000/api/users/me/",
            {
                headers: {
                    "Authorization":
                        "Bearer " + data.access
                }
            }
        );

        let userData = await userResponse.json();

        localStorage.setItem(
            "username",
            userData.username
        );

        localStorage.setItem(
            "role",
            userData.role
        );

        // REDIRECT

        window.location.href =
            "dashboard.html";

    } catch (error) {

        console.log(error);

        alert("Server Error");
    }
}


// ================= LOAD COURSES =================

async function loadCourses() {

    let token = localStorage.getItem("token");

    if (!token) {

        window.location.href = "login.html";

        return;
    }

    try {

        let response = await fetch(
            "http://127.0.0.1:8000/api/courses/",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        let courses = await response.json();

        let container =
            document.getElementById("courses");

        if (!container) return;

        container.innerHTML = "";

        let courseCount =
            document.getElementById("courseCount");

        if (courseCount) {

            courseCount.innerText = courses.length;
        }

        if (courses.length === 0) {

            container.innerHTML = `

                <div class="col-12">

                    <div class="alert alert-warning text-center p-4 rounded-4">

                        <h4>
                            No Courses Assigned Yet 🚫
                        </h4>

                    </div>

                </div>
            `;

            setupRoleUI();

            return;
        }

        courses.forEach(course => {

            container.innerHTML += `

                <div class="col-lg-4 col-md-6">

                    <div class="course-card">

                        <div class="course-icon">
                            📘
                        </div>

                        <div class="course-title">
                            ${course.title}
                        </div>

                        <div class="course-desc">
                            Learn through videos
                            and progress tracking.
                        </div>

                        <div class="progress mb-3">

                            <div
                                class="progress-bar"
                                style="width:${course.progress || 0}%">
                            </div>

                        </div>

                        <button
                            class="start-btn"
                            onclick="viewVideos(${course.id})">

                            Start Learning →

                        </button>

                    </div>

                </div>
            `;
        });

        setupRoleUI();

    } catch (error) {

        console.log(error);

        alert("Error loading courses");
    }
}


// ================= ROLE UI =================

function setupRoleUI() {

    let role =
        localStorage.getItem("role") || "Student";

    let roleBadge =
        document.getElementById("roleBadge");

    if (roleBadge) {

        roleBadge.innerText = role;
    }

    let manageUsersBtn =
        document.getElementById("manageUsersBtn");

    let assignCoursesBtn =
        document.getElementById("assignCoursesBtn");

    let uploadVideoBtn =
        document.getElementById("uploadVideoBtn");

    let myLearningBtn =
        document.getElementById("myLearningBtn");

    // HIDE ALL

    if (manageUsersBtn) {
        manageUsersBtn.style.display = "none";
    }

    if (assignCoursesBtn) {
        assignCoursesBtn.style.display = "none";
    }

    if (uploadVideoBtn) {
        uploadVideoBtn.style.display = "none";
    }

    if (myLearningBtn) {
        myLearningBtn.style.display = "none";
    }

    // ADMIN

    if (role.toLowerCase() === "admin") {

        if (manageUsersBtn) {
            manageUsersBtn.style.display = "inline-block";
        }

        if (assignCoursesBtn) {
            assignCoursesBtn.style.display = "inline-block";
        }

        if (uploadVideoBtn) {
            uploadVideoBtn.style.display = "inline-block";
        }

        if (myLearningBtn) {
            myLearningBtn.style.display = "inline-block";
        }
    }

    // TRAINER

    else if (role.toLowerCase() === "trainer") {

        if (uploadVideoBtn) {
            uploadVideoBtn.style.display = "inline-block";
        }

        if (myLearningBtn) {
            myLearningBtn.style.display = "inline-block";
        }
    }

    // STUDENT

    else {

        if (myLearningBtn) {
            myLearningBtn.style.display = "inline-block";
        }
    }

    // BUTTON ACTIONS

    if (uploadVideoBtn) {

        uploadVideoBtn.onclick = function () {

            window.location.href =
                "upload-video.html";
        };
    }

    if (manageUsersBtn) {

        manageUsersBtn.onclick = function () {

            window.location.href =
                "admin-users.html";
        };
    }

    if (assignCoursesBtn) {

        assignCoursesBtn.onclick = function () {

            window.location.href =
                "assign-course.html";
        };
    }

    if (myLearningBtn) {

        myLearningBtn.onclick = function () {

            let section =
                document.querySelector(".course-section");

            if (section) {

                section.scrollIntoView({
                    behavior: "smooth"
                });
            }
        };
    }
}


// ================= VIEW VIDEOS =================

function viewVideos(courseId) {

    localStorage.setItem("courseId", courseId);

    window.location.href = "videos.html";
}


// ================= LOAD VIDEOS =================

async function loadVideos() {

    let token = localStorage.getItem("token");

    let courseId =
        localStorage.getItem("courseId");

    try {

        let response = await fetch(
            "http://127.0.0.1:8000/api/videos/",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        let videos = await response.json();

        let videoList =
            document.getElementById("videoList");

        if (!videoList) return;

        videoList.innerHTML = "";

        let firstVideo = null;

        totalVideos = 0;

        completedVideos = 0;

        watchedVideos = [];

        videos.forEach(video => {

            if (video.course == courseId) {

                totalVideos++;

                if (!firstVideo) {

                    firstVideo = video;
                }

                videoList.innerHTML += `

                    <div
                        class="video-item"
                        onclick="playVideo(
                            '${video.youtube_link}',
                            '${video.title}',
                            ${video.id},
                            this
                        )">

                        ▶ ${video.title}

                    </div>
                `;
            }
        });

        if (firstVideo) {

            playVideo(
                firstVideo.youtube_link,
                firstVideo.title,
                firstVideo.id
            );
        }

        updateCourseProgress();

    } catch (error) {

        console.log(error);

        alert("Error loading videos");
    }
}


// ================= PLAY VIDEO =================

function playVideo(
    url,
    title,
    videoId,
    clickedElement = null
) {

    try {

        currentVideoId = videoId;

        document.getElementById(
            "videoTitle"
        ).innerText = title;

        document.getElementById(
            "completeBtn"
        ).disabled = true;

        let allVideos =
            document.querySelectorAll(".video-item");

        allVideos.forEach(item => {

            item.classList.remove(
                "active-video"
            );
        });

        if (clickedElement) {

            clickedElement.classList.add(
                "active-video"
            );
        }

        let videoKey = "";

        if (url.includes("watch?v=")) {

            videoKey =
                url.split("watch?v=")[1];
        }

        else if (url.includes("youtu.be/")) {

            videoKey =
                url.split("youtu.be/")[1];
        }

        else if (url.includes("embed/")) {

            videoKey =
                url.split("embed/")[1];
        }

        if (videoKey.includes("&")) {

            videoKey =
                videoKey.split("&")[0];
        }

        if (videoKey.includes("?")) {

            videoKey =
                videoKey.split("?")[0];
        }

        if (!videoKey) {

            alert("Invalid YouTube URL");

            return;
        }

        if (player) {

            player.destroy();
        }

        player = new YT.Player(
            "videoPlayer",
            {

                height: "650",

                width: "100%",

                videoId: videoKey,

                playerVars: {
                    autoplay: 1
                },

                events: {

                    onReady:
                        onPlayerReady,

                    onStateChange:
                        onPlayerStateChange
                }
            }
        );

    } catch (error) {

        console.log(error);

        alert("Video player failed");
    }
}


// ================= PLAYER READY =================

function onPlayerReady(event) {

    currentVideoDuration =
        player.getDuration();
}


// ================= PLAYER STATE =================

function onPlayerStateChange(event) {

    if (event.data == YT.PlayerState.PLAYING) {

        clearInterval(progressChecker);

        progressChecker = setInterval(() => {

            let currentTime =
                player.getCurrentTime();

            let watchedPercent =
                (currentTime /
                    currentVideoDuration) * 100;

            if (watchedPercent >= 95) {

                document.getElementById(
                    "completeBtn"
                ).disabled = false;
            }

        }, 1000);
    }

    if (event.data == YT.PlayerState.ENDED) {

        document.getElementById(
            "completeBtn"
        ).disabled = false;
    }

    if (
        event.data == YT.PlayerState.PAUSED ||
        event.data == YT.PlayerState.ENDED
    ) {

        clearInterval(progressChecker);
    }
}


// ================= MARK COMPLETED =================

async function markCompleted() {

    if (
        watchedVideos.includes(currentVideoId)
    ) {

        alert("Already Completed");

        return;
    }

    let token =
        localStorage.getItem("token");

    let response = await fetch(
        "http://127.0.0.1:8000/api/progress/",
        {
            method: "POST",

            headers: {

                "Content-Type":
                    "application/json",

                "Authorization":
                    "Bearer " + token
            },

            body: JSON.stringify({

                video: currentVideoId,

                completed: true
            })
        }
    );

    if (response.ok) {

        watchedVideos.push(currentVideoId);

        completedVideos++;

        updateCourseProgress();

        alert("Video Completed ✅");

    } else {

        alert("Error Saving Progress");
    }
}


// ================= UPDATE PROGRESS =================

function updateCourseProgress() {

    let percent = 0;

    if (totalVideos > 0) {

        percent = Math.round(
            (completedVideos / totalVideos) * 100
        );
    }

    let progressBar =
        document.getElementById("progressBar");

    let progressText =
        document.getElementById("progressText");

    if (progressBar) {

        progressBar.style.width =
            percent + "%";
    }

    if (progressText) {

        progressText.innerText =
            percent + "%";
    }
}


// ================= LOAD USERS =================

async function loadUsers() {

    let token = localStorage.getItem("token");

    try {

        let response = await fetch(
            "http://127.0.0.1:8000/api/users/users/",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        let users = await response.json();

        let usersList =
            document.getElementById("usersList");

        if (!usersList) return;

        usersList.innerHTML = "";

        users.forEach(user => {

            usersList.innerHTML += `

                <div class="user-item">

                    <div class="user-info">

                        <h4>
                            ${user.username}
                        </h4>

                        <div class="role">
                            ${user.role}
                        </div>

                    </div>

                    <button
                        class="delete-btn"
                        onclick="deleteUser(${user.id})">

                        Delete

                    </button>

                </div>
            `;
        });

    } catch (error) {

        console.log(error);

        alert("Error Loading Users");
    }
}


// ================= CREATE USER =================

async function createUser() {

    let username =
        document.getElementById(
            "newUsername"
        ).value;

    let password =
        document.getElementById(
            "newPassword"
        ).value;

    let role =
        document.getElementById(
            "newRole"
        ).value;

    if (!username || !password) {

        alert("Fill all fields");

        return;
    }

    let token =
        localStorage.getItem("token");

    try {

        let response = await fetch(
            "http://127.0.0.1:8000/api/users/users/",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({

                    username: username,

                    password: password,

                    role: role
                })
            }
        );

        let data = await response.json();

        console.log(data);

        if (response.ok) {

            alert("User Created ✅");

            document.getElementById(
                "newUsername"
            ).value = "";

            document.getElementById(
                "newPassword"
            ).value = "";

            loadUsers();

        } else {

            alert(JSON.stringify(data));
        }

    } catch (error) {

        console.log(error);

        alert("Error Creating User");
    }
}


// ================= DELETE USER =================

async function deleteUser(userId) {

    let confirmDelete = confirm(
        "Delete this user?"
    );

    if (!confirmDelete) return;

    let token =
        localStorage.getItem("token");

    try {

        let response = await fetch(
            `http://127.0.0.1:8000/api/users/users/${userId}/`,
            {

                method: "DELETE",

                headers: {

                    "Authorization":
                        "Bearer " + token
                }
            }
        );

        if (response.ok) {

            alert("User Deleted ✅");

            loadUsers();

        } else {

            alert("Delete Failed");
        }

    } catch (error) {

        console.log(error);

        alert("Delete Error");
    }
}


// ================= LOAD STUDENTS =================

async function loadStudents() {

    let token =
        localStorage.getItem("token");

    try {

        let response = await fetch(
            "http://127.0.0.1:8000/api/users/users/",
            {
                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );

        let users = await response.json();

        let studentSelect =
            document.getElementById(
                "studentSelect"
            );

        if (!studentSelect) return;

        studentSelect.innerHTML =
            `<option value="">
                Select Student
            </option>`;

        users.forEach(user => {

            if (
                user.role &&
                user.role.toLowerCase() === "student"
            ) {

                studentSelect.innerHTML += `

                    <option value="${user.id}">
                        ${user.username}
                    </option>
                `;
            }
        });

    } catch (error) {

        console.log(error);
    }
}


// ================= LOAD ALL COURSES =================

async function loadAllCourses() {

    let token =
        localStorage.getItem("token");

    try {

        let response = await fetch(
            "http://127.0.0.1:8000/api/courses/",
            {
                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );

        let courses = await response.json();

        let courseSelect =
            document.getElementById(
                "courseSelect"
            );

        if (!courseSelect) return;

        courseSelect.innerHTML =
            `<option value="">
                Select Course
            </option>`;

        courses.forEach(course => {

            courseSelect.innerHTML += `

                <option value="${course.id}">
                    ${course.title}
                </option>
            `;
        });

    } catch (error) {

        console.log(error);
    }
}


// ================= ASSIGN COURSE =================

async function assignCourse() {

    let username =
        document.getElementById(
            "username"
        ).value;

    let courseName =
        document.getElementById(
            "courseName"
        ).value;

    let role =
        document.getElementById(
            "assignRole"
        ).value;

    if (!username || !courseName) {

        alert("Fill all fields");

        return;
    }

    let token =
        localStorage.getItem("token");

    try {

        // ================= GET USERS =================

        let usersResponse = await fetch(
            "http://127.0.0.1:8000/api/users/users/",
            {
                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );

        let users = await usersResponse.json();

        // ================= GET COURSES =================

        let coursesResponse = await fetch(
            "http://127.0.0.1:8000/api/courses/",
            {
                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );

        let courses = await coursesResponse.json();

        // ================= FIND USER =================

        let selectedUser = users.find(
            u =>
                u.username.toLowerCase() ===
                username.toLowerCase()
        );

        // ================= FIND COURSE =================

        let selectedCourse = courses.find(
            c =>
                c.title.toLowerCase() ===
                courseName.toLowerCase()
        );

        if (!selectedUser) {

            alert("User not found");

            return;
        }

        if (!selectedCourse) {

            alert("Course not found");

            return;
        }

        // ================= ASSIGN STUDENT =================

        if (role === "student") {

            let response = await fetch(
                "http://127.0.0.1:8000/api/enrollments/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body: JSON.stringify({

                        student:
                            selectedUser.id,

                        course:
                            selectedCourse.id
                    })
                }
            );

            if (response.ok) {

                alert(
                    "Student Assigned ✅"
                );

            } else {

                alert(
                    "Assignment Failed"
                );
            }
        }

        // ================= ASSIGN TRAINER =================

        else if (role === "trainer") {

            let response = await fetch(
                `http://127.0.0.1:8000/api/courses/${selectedCourse.id}/`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body: JSON.stringify({

                        trainers: [
                            selectedUser.id
                        ]
                    })
                }
            );

            if (response.ok) {

                alert(
                    "Trainer Assigned ✅"
                );

            } else {

                alert(
                    "Trainer Assignment Failed"
                );
            }
        }

    } catch (error) {

        console.log(error);

        alert("Server Error");
    }
}



// ================= LOGOUT =================

function logout() {

    localStorage.clear();

    window.location.href = "login.html";
}


// ================= GO BACK =================

function goBack() {

    window.location.href =
        "dashboard.html";
}


// ================= PAGE LOAD =================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            document.getElementById("courses")
        ) {

            loadCourses();
        }

        if (
            document.getElementById("videoList")
        ) {

            loadVideos();
        }

        if (
            document.getElementById("usersList")
        ) {

            loadUsers();
        }

        if (
            document.getElementById(
                "studentSelect"
            )
        ) {

            loadStudents();
        }

        if (
            document.getElementById(
                "courseSelect"
            )
        ) {

            loadAllCourses();
        }
    }
);
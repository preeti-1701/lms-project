const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const videoRoutes = require("./routes/videoRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const studentRoutes = require("./routes/studentRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json())

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/admin", adminRoutes);


pool.connect()
  .then(() => console.log("PostgreSQL Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("LMS Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



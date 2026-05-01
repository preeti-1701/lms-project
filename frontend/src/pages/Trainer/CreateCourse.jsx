import { useState } from "react";
import API from "../../services/api";

export default function CreateCourse() {
  const [title, setTitle] = useState("");

  const createCourse = async () => {
    await API.post("/courses", { title });
    alert("Course Created");
  };

  return (
    <div>
      <h2>Create Course</h2>
      <input onChange={(e) => setTitle(e.target.value)} />
      <button onClick={createCourse}>Create</button>
    </div>
  );
}
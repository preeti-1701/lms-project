import React, { useState } from 'react';
import api from './api';

function CreateCourse() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [level, setLevel] = useState('');
    const [duration, setDuration] = useState('');

    const handleCreate = async () => {
        // ✅ validation
        if (!title) {
            alert("Please enter course title");
            return;
        }

        try {
            const response = await api.post('/api/create-course/', {   // ✅ FIXED
                title,
                description,
                category,
                level,
                duration
            });

            alert(response.data.message);

            // 🔄 reset input
            setTitle('');

        } catch (error) {
            console.error(error.response);
            alert("Error creating course");
        }
    };

    return (
        <div tyle={{
            padding: "20px",
            maxWidth: "100px",
            margin: "auto",
            border: "1px solid #ddd",
            borderRadius: "10px",
            backgroundColor: "#f9f9f9"
        }}>
            <h2 style={{ textAlign: "center" }}>Create Course</h2>

            <input
                placeholder="Course Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <br /><br />

            <textarea
                placeholder="Course Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <br /><br />

            <select
                value={category}
                onChange={(e) => setCategory(
                    e.target.value
                )}
            >
                <option value="">Select Category</option>
                <option>Programming</option>
                <option>Web Development</option>
                <option>Data Science</option>
                <option>Computer Networks</option>
            </select>

            <br /><br />

            <select
                value={level}
                onChange={(e) => setLevel(
                    e.target.value
                )}
            >

                <option value="">Select Level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>

            </select>

            <br /><br />

            <input
                placeholder="Duration (e.g 8 Weeks)"
                value={duration}
                onChange={(e) => setDuration(
                    e.target.value
                )}
            />

            <br /><br />


            <button
                onClick={handleCreate}
                style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                }}
            >
                Create Course
            </button>
        </div>
    );
}

export default CreateCourse;
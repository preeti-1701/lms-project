import React, { useState } from 'react';
import api from './api';

function CreateCourse() {
    const [title, setTitle] = useState('');

    const handleCreate = async () => {
        // ✅ validation
        if (!title) {
            alert("Please enter course title");
            return;
        }

        try {
            const response = await api.post('/api/create-course/', {   // ✅ FIXED
                title
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
            maxWidth: "500px",
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
                Create
            </button>
        </div>
    );
}

export default CreateCourse;
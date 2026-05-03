import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoData, setVideoData] = useState({ title: '', youtube_url: '', order: 0, course_id: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/courses/');
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/courses/', formData);
      toast.success('Course created successfully!');
      setShowForm(false);
      setFormData({ title: '', description: '' });
      fetchCourses();
    } catch (error) {
      toast.error('Failed to create course');
    }
  };

  const addVideo = async (e) => {
    e.preventDefault();
    if (!videoData.course_id) {
      toast.error('Please select a course');
      return;
    }
    try {
      await axios.post(`http://localhost:8000/api/courses/${videoData.course_id}/add_video/`, {
        title: videoData.title,
        youtube_url: videoData.youtube_url,
        order: videoData.order
      });
      toast.success('Video added successfully!');
      setVideoData({ title: '', youtube_url: '', order: 0, course_id: '' });
      setShowVideoForm(false);
      fetchCourses();
    } catch (error) {
      toast.error('Failed to add video');
    }
  };

  const deleteVideo = async (courseId, videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await axios.delete(`http://localhost:8000/api/courses/${courseId}/videos/${videoId}/`);
        toast.success('Video deleted');
        fetchCourses();
      } catch (error) {
        toast.error('Failed to delete video');
      }
    }
  };

  const deleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? All videos will be deleted too.')) {
      try {
        await axios.delete(`http://localhost:8000/api/courses/${courseId}/`);
        toast.success('Course deleted');
        fetchCourses();
      } catch (error) {
        toast.error('Failed to delete course');
      }
    }
  };

  const openYouTube = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>📚 Course Management</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              + Create Course
            </button>
            <button onClick={() => setShowVideoForm(!showVideoForm)} className="btn-primary" style={{ background: '#28a745' }}>
              + Add Video to Course
            </button>
          </div>
        </div>

        {/* Create Course Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '30px', backgroundColor: '#f9fafb' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Create New Course</h2>
            <form onSubmit={createCourse}>
              <div className="form-group">
                <input type="text" placeholder="Course Title" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-control" required />
              </div>
              <div className="form-group">
                <textarea placeholder="Course Description" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-control" rows="3" required />
              </div>
              <button type="submit" className="btn-success">Create Course</button>
            </form>
          </div>
        )}

        {/* Add Video Form */}
        {showVideoForm && (
          <div className="card" style={{ marginBottom: '30px', backgroundColor: '#f9fafb' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Add Video to Existing Course</h2>
            <form onSubmit={addVideo}>
              <div className="form-group">
                <select value={videoData.course_id} onChange={(e) => setVideoData({ ...videoData, course_id: e.target.value })}
                  className="form-control" required>
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <input type="text" placeholder="Video Title" value={videoData.title}
                  onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                  className="form-control" required />
              </div>
              <div className="form-group">
                <input type="url" placeholder="YouTube URL (e.g., https://youtu.be/... or https://youtube.com/watch?v=...)" 
                  value={videoData.youtube_url}
                  onChange={(e) => setVideoData({ ...videoData, youtube_url: e.target.value })}
                  className="form-control" required />
              </div>
              <div className="form-group">
                <input type="number" placeholder="Order (0, 1, 2...)" value={videoData.order}
                  onChange={(e) => setVideoData({ ...videoData, order: parseInt(e.target.value) || 0 })}
                  className="form-control" />
              </div>
              <button type="submit" className="btn-primary">Add Video</button>
            </form>
          </div>
        )}

        {/* Display Courses with Videos */}
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>Your Courses</h2>
        {courses.map(course => (
          <div key={course.id} className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <h3 className="card-title">{course.title}</h3>
                <p className="card-text">{course.description}</p>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  📹 Total Videos: {course.video_count || course.videos?.length || 0}
                </p>
                
                {/* Videos List */}
                {course.videos && course.videos.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>Videos:</h4>
                    {course.videos.sort((a,b) => a.order - b.order).map(video => (
                      <div key={video.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '10px',
                        marginBottom: '8px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px'
                      }}>
                        <div>
                          <span style={{ fontWeight: '500' }}>{video.order}. {video.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => openYouTube(video.youtube_watch_url || video.youtube_url)}
                            className="btn-primary" 
                            style={{ padding: '5px 12px', fontSize: '12px' }}>
                            Watch
                          </button>
                          <button 
                            onClick={() => deleteVideo(course.id, video.id)}
                            className="btn-danger" 
                            style={{ padding: '5px 12px', fontSize: '12px' }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => deleteCourse(course.id)} 
                className="btn-danger" 
                style={{ padding: '8px 16px' }}>
                Delete Course
              </button>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
            No courses yet. Click "Create Course" to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
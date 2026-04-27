import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, contentAPI } from '../services/api';
import Navbar from '../components/Navbar';

const CourseManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [contentType, setContentType] = useState('youtube');
  const [formData, setFormData] = useState({
    title: '',
    youtube_url: '',
    order: 0,
    file: null,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [courseRes, contentsRes] = await Promise.all([
        courseAPI.get(id),
        contentAPI.list(id),
      ]);
      setCourse(courseRes.data);
      setContents(contentsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContent = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (contentType === 'youtube') {
        await contentAPI.addYouTube(id, {
          title: formData.title,
          youtube_url: formData.youtube_url,
          order: formData.order,
        });
      } else {
        const data = new FormData();
        data.append('title', formData.title);
        data.append('order', formData.order);
        data.append('file', formData.file);
        await contentAPI.uploadFile(id, data);
      }

      setShowAddModal(false);
      setFormData({ title: '', youtube_url: '', order: 0, file: null });
      loadData();
    } catch (error) {
      alert('Failed to add content: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      await contentAPI.delete(id, contentId);
      loadData();
    } catch (error) {
      alert('Failed to delete content');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-indigo-600 hover:text-indigo-700 font-medium mb-6 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course?.title}</h1>
            <p className="text-gray-600 mt-2">Manage course content and resources</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Content</span>
          </button>
        </div>

        {/* Content List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {contents.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No content yet</h3>
              <p className="text-gray-600 mb-6">Start adding videos, files, or resources to your course</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition inline-flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Your First Content</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {contents.map((content) => (
                <div key={content.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        {content.content_type === 'youtube' ? (
                          <div className="bg-red-100 rounded-lg p-3">
                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                        ) : (
                          <div className="bg-blue-100 rounded-lg p-3">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-600 capitalize">
                            Type: {content.content_type}
                          </span>
                          <span className="text-sm text-gray-600">
                            Order: {content.order}
                          </span>
                          {content.youtube_url && (
                            <a
                              href={content.youtube_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-700"
                            >
                              View on YouTube
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteContent(content.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Content</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Type Selector */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setContentType('youtube')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  contentType === 'youtube'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                YouTube Video
              </button>
              <button
                onClick={() => setContentType('file')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  contentType === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Upload File
              </button>
            </div>

            <form onSubmit={handleAddContent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Lesson 1: Introduction"
                />
              </div>

              {contentType === 'youtube' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                  <input
                    type="url"
                    required
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Paste the full YouTube video URL</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File Upload</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload PDF, video, or other files</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? 'Adding...' : 'Add Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, contentAPI, activityAPI } from '../services/api';
import YouTube from 'react-youtube';
import Navbar from '../components/Navbar';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourseData();
  }, [id]);

  const loadCourseData = async () => {
    try {
      const [courseRes, contentsRes] = await Promise.all([
        courseAPI.get(id),
        contentAPI.list(id),
      ]);
      setCourse(courseRes.data);
      setContents(contentsRes.data);
      if (contentsRes.data.length > 0) {
        setSelectedContent(contentsRes.data[0]);
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleContentSelect = async (content) => {
    setSelectedContent(content);
    try {
      await activityAPI.log({
        content_id: content.id,
        event: 'viewed',
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await courseAPI.complete(id);
      alert('Course marked as complete!');
      navigate('/dashboard');
    } catch (error) {
      alert('Failed to mark course as complete');
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{course?.title}</h1>
          <p className="text-gray-600 mt-2">{course?.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Player */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {selectedContent ? (
                <>
                  {selectedContent.content_type === 'youtube' && selectedContent.youtube_url ? (
                    <div className="aspect-video bg-black">
                      <YouTube
                        videoId={extractYouTubeId(selectedContent.youtube_url)}
                        opts={{
                          width: '100%',
                          height: '100%',
                          playerVars: {
                            autoplay: 0,
                          },
                        }}
                        className="w-full h-full"
                      />
                    </div>
                  ) : selectedContent.content_type === 'file' ? (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <div className="text-center p-8">
                        <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600 mb-4">File: {selectedContent.file_path?.split('/').pop()}</p>
                        <a
                          href={`http://localhost:8000/${selectedContent.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg inline-block"
                        >
                          Download File
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <p className="text-gray-600">Content preview not available</p>
                    </div>
                  )}

                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedContent.title}</h2>
                    {selectedContent.body && (
                      <div className="text-gray-700 whitespace-pre-wrap">{selectedContent.body}</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-gray-600">No content available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              <div className="bg-indigo-600 text-white px-6 py-4">
                <h3 className="font-semibold">Course Content</h3>
                <p className="text-sm opacity-90">{contents.length} items</p>
              </div>

              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {contents.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No content available yet
                  </div>
                ) : (
                  contents.map((content, index) => (
                    <button
                      key={content.id}
                      onClick={() => handleContentSelect(content)}
                      className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition ${
                        selectedContent?.id === content.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {content.content_type === 'youtube' ? (
                            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{content.title}</p>
                          <p className="text-xs text-gray-500 mt-1 capitalize">{content.content_type}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleComplete}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Mark as Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

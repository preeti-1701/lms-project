import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from './api';

const CATEGORY_OPTIONS = [
    'Programming',
    'Web Development',
    'Data Science',
    'Computer Networks'
];

const LEVEL_OPTIONS = [
    'Beginner',
    'Intermediate',
    'Advanced'
];

function CreateCourse() {

    const navigate = useNavigate();
    const location = useLocation();
    const editMode = location.state?.editMode;
    const editCourse = location.state?.course;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [level, setLevel] = useState('');
    const [duration, setDuration] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', text: '' });



    /* preload form in edit mode */
    useEffect(() => {

        if (editMode && editCourse) {
            setTitle(editCourse.title || '');
            setDescription(editCourse.description || '');
            setCategory(editCourse.category || '');
            setLevel(editCourse.level || '');
            setDuration(editCourse.duration || '');
        }

    }, [
        editMode,
        editCourse
    ]);



    const user = JSON.parse(localStorage.getItem('user'));

    const handleBack = () => {

        if (window.history.length > 1) {
            navigate(-1);
            return;
        }

        if (user?.role === 'admin') {
            navigate('/manage-courses');
        }
        else {
            navigate('/trainer');
        }

    };




    const handleCreate = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setFeedback({type: 'error', text: 'Please enter a course title.'});
            return;
        }

        setIsSubmitting(true);

        setFeedback({
            type: '',
            text: ''
        });

        const payload = {
            title,
            description,
            category,
            level,
            duration
        };

        try {

            let response;

            // ✅ EDIT MODE (reliable check)
            if (editCourse?.id) {

                console.log("Updating course:", editCourse.id);

                response = await api.put(
                    `/api/edit-course/${editCourse.id}/`,
                    payload
                );

                setFeedback({
                    type: 'success',
                    text: response?.data?.message || 'Course updated successfully.'
                });

            }

            // ✅ CREATE MODE
            else {

                console.log("Creating course");

                response = await api.post(
                    '/api/create-course/',
                    payload
                );

                setFeedback({
                    type: 'success',
                    text: response?.data?.message || 'Course created successfully.'
                });

                // Reset form
                setTitle('');
                setDescription('');
                setCategory('');
                setLevel('');
                setDuration('');
            }

            // ✅ Navigate AFTER success
            setTimeout(() => {

                if (user?.role === 'admin') {
                    navigate('/manage-courses');
                } else {
                    navigate('/trainer');
                }

            }, 1200);

        } catch (error) {

            console.error("Course Error:", error?.response || error);

            setFeedback({
                type: 'error',
                text:
                    error?.response?.data?.error ||   // backend error
                    error?.response?.data?.message || // fallback
                    (editCourse?.id
                        ? 'Error updating course.'
                        : 'Error creating course.')
            });

        } finally {
            setIsSubmitting(false);
        }
    };




    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden">
            {/* Radial gradient background */}
            <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent opacity-30 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 px-6 md:px-8 py-12">
                {/* Back button */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="px-4 py-2 text-slate-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2"
                    >
                        ← Back
                    </button>
                </div>

                <div className="mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="inline-block mb-4">
                            <span className="px-3 py-1 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 border border-cyan-400/30 rounded-full text-xs uppercase font-semibold text-cyan-300">
                                Course Management
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-3">
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                                {editMode ? 'Edit Course' : 'Create New Course'}
                            </span>
                        </h1>
                        <p className="text-slate-400">
                            {editMode
                                ? 'Update your course information and details.'
                                : 'Create structured course content and manage your offerings.'}
                        </p>
                    </div>

                    {/* Form Card */}
                    <form
                        onSubmit={handleCreate}
                        className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 space-y-6 hover:border-cyan-400/20 transition-all duration-300"
                    >
                        {/* Title Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Course Title
                            </label>
                            <input
                                placeholder="Enter course title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none transition-all duration-300"
                            />
                        </div>

                        {/* Description Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Description
                            </label>
                            <textarea
                                placeholder="Enter course description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none transition-all duration-300 resize-none"
                            />
                        </div>

                        {/* Category Select */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:border-cyan-400/50 focus:outline-none transition-all duration-300"
                            >
                                <option value="">Select category</option>
                                {CATEGORY_OPTIONS.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Level Select */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Level
                            </label>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:border-cyan-400/50 focus:outline-none transition-all duration-300"
                            >
                                <option value="">Select level</option>
                                {LEVEL_OPTIONS.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Duration Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Duration
                            </label>
                            <input
                                placeholder="e.g., 4 weeks"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none transition-all duration-300"
                            />
                        </div>

                        {/* Feedback Message */}
                        {feedback.text && (
                            <div
                                className={`px-4 py-3 rounded-xl border ${feedback.type === 'success'
                                    ? 'bg-green-500/10 border-green-500/30 text-green-300'
                                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                                    }`}
                            >
                                {feedback.text}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting
                                ? editMode
                                    ? 'Updating...'
                                    : 'Creating...'
                                : editMode
                                    ? 'Update Course'
                                    : 'Publish Course'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateCourse;
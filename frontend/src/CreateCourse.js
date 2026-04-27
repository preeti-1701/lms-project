import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [level, setLevel] = useState('');
    const [duration, setDuration] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', text: '' });

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }

        navigate('/admin');
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setFeedback({
                type: 'error',
                text: 'Please enter a course title.'
            });
            return;
        }

        setIsSubmitting(true);
        setFeedback({ type: '', text: '' });

        try {
            const response = await api.post('/api/create-course/', {
                title,
                description,
                category,
                level,
                duration
            });

            setFeedback({
                type: 'success',
                text: response?.data?.message || 'Course created successfully.'
            });

            setTitle('');
            setDescription('');
            setCategory('');
            setLevel('');
            setDuration('');

        } catch (error) {
            setFeedback({
                type: 'error',
                text: error?.response?.data?.message || 'Error creating course.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(255,184,77,0.16)_0%,transparent_28%),radial-gradient(circle_at_90%_18%,rgba(13,142,123,0.14)_0%,transparent_30%),linear-gradient(155deg,#f7fbfa_0%,#eef4ff_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto mb-4 flex w-full max-w-6xl items-center justify-between px-1">
                <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                >
                    <span aria-hidden="true">←</span>
                    Back
                </button>
            </div>

            <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] shadow-[0_24px_60px_rgba(15,23,42,0.12)] lg:grid-cols-[0.85fr_1.15fr]">
                <aside className="flex flex-col gap-4 bg-[linear-gradient(160deg,#0f7f72,#0b6f88)] px-7 py-9 text-white sm:px-9 sm:py-11 lg:px-10">
                    <span className="w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur">
                        Trainer Workspace
                    </span>

                    <div className="space-y-3">
                        <h1 className="max-w-lg text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                            Manage Course Content
                        </h1>
                        <p className="max-w-lg text-sm leading-7 text-white/82 sm:text-base">
                            Create structured course content in a clean workspace designed for speed.
                        </p>
                    </div>
                </aside>

                <form className="flex flex-col gap-3 bg-white px-6 py-7 sm:px-8 sm:py-9 lg:px-10" onSubmit={handleCreate}>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Create New Course</h2>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="course-title" className="text-sm font-semibold text-slate-700">Course Title</label>
                        <input
                            id="course-title"
                            placeholder="Ex: Python for Data Analysis"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="course-description" className="text-sm font-semibold text-slate-700">Course Description</label>
                        <textarea
                            id="course-description"
                            placeholder="What will students build, practice, and achieve?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="min-h-[92px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <label htmlFor="course-category" className="text-sm font-semibold text-slate-700">Category</label>
                            <select
                                id="course-category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
                            >
                                <option value="">Select category</option>
                                {CATEGORY_OPTIONS.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="course-level" className="text-sm font-semibold text-slate-700">Level</label>
                            <select
                                id="course-level"
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
                            >
                                <option value="">Select level</option>
                                {LEVEL_OPTIONS.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="course-duration" className="text-sm font-semibold text-slate-700">Duration</label>
                        <input
                            id="course-duration"
                            placeholder="Ex: 8 weeks"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
                        />
                    </div>

                    {feedback.text && (
                        <div
                            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.type === 'success'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-rose-200 bg-rose-50 text-rose-700'
                                }`}
                        >
                            {feedback.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-1 inline-flex items-center justify-center rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(13,142,123,0.24)] transition hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-[0_20px_36px_rgba(13,142,123,0.3)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {isSubmitting ? 'Creating Course...' : 'Publish Course'}
                    </button>
                </form>
            </div>
        </section>
    );
}

export default CreateCourse;
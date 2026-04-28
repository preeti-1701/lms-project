import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';



function AdminDashboard() {

    // Navigation
    const navigate = useNavigate();

    // Navigation State
    const [collapsed, setCollapsed] = useState(false);

    // Stats State
    const [stats, setStats] = useState({
        users: 0,
        courses: 0,
        videos: 0,
        enrollments: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get(
                    '/api/admin-stats/'
                );
                setStats(
                    res.data
                );

            } catch (error) {
                console.error(error);
            }
        };
        fetchStats();

    }, []);

    // Logout
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };


    // UI
    return (

        <div className="flex min-h-screen bg-slate-900">

            {/* ======================Sidebar====================== */}
            <div className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-gradient-to-b from-slate-800 to-slate-900 text-white p-6 border-r border-slate-700`}>

                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition text-2xl"
                    >
                        {collapsed ? '▶' : '◀'}
                    </button>
                </div>

                {!collapsed && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Admin Portal</h2>
                        <div className="h-0.5 bg-gradient-to-r from-teal-400 to-blue-500 mt-2"></div>
                    </div>
                )}

                <nav className="space-y-2">
                    <SidebarButton icon="👤" label="Create User" onClick={() => navigate('/create-user')} collapsed={collapsed} />
                    <SidebarButton icon="📚" label="Create Course" onClick={() => navigate('/create-course')} collapsed={collapsed} />
                    <SidebarButton icon="🎥" label="Add Videos" onClick={() => navigate('/add-video')} collapsed={collapsed} />
                    <SidebarButton icon="🎓" label="Enroll Students" onClick={() => navigate('/enroll')} collapsed={collapsed} />
                    <SidebarButton icon="🚪" label="Logout" onClick={handleLogout} collapsed={collapsed} variant="danger" />
                </nav>

            </div>


            {/* ======================Main Content====================== */}
            <div className="flex-1 overflow-auto">
                <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(255,184,77,0.08)_0%,transparent_28%),radial-gradient(circle_at_90%_18%,rgba(13,142,123,0.1)_0%,transparent_30%),linear-gradient(155deg,#0f172a_0%,#1e293b_100%)]">

                    {/* Header */}
                    <div className="px-8 py-10 border-b border-slate-700 bg-slate-800/50 backdrop-blur">
                        <h1 className="text-4xl font-bold text-white mb-2">Welcome Admin</h1>
                        <p className="text-slate-400 text-lg">Manage your LMS platform with ease</p>
                    </div>

                    {/* Content */}
                    <div className="p-8">

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            <StatCard title="Users" value={stats.users} icon="👥" color="from-blue-500 to-blue-600" />
                            <StatCard title="Courses" value={stats.courses} icon="📚" color="from-purple-500 to-purple-600" />
                            <StatCard title="Videos" value={stats.videos} icon="🎬" color="from-pink-500 to-pink-600" />
                            <StatCard title="Enrollments" value={stats.enrollments} icon="🎓" color="from-green-500 to-green-600" />
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <QuickActionCard
                                    label="Create New User"
                                    icon="➕"
                                    description="Add a new user to the system"
                                    click={() => navigate('/create-user')}
                                    color="from-blue-500 to-blue-600"
                                />
                                <QuickActionCard
                                    label="Create Course"
                                    icon="➕"
                                    description="Set up a new course"
                                    click={() => navigate('/create-course')}
                                    color="from-purple-500 to-purple-600"
                                />
                                <QuickActionCard
                                    label="Enroll Student"
                                    icon="➕"
                                    description="Assign students to courses"
                                    click={() => navigate('/enroll')}
                                    color="from-green-500 to-green-600"
                                />
                            </div>
                        </div>

                    </div>

                </div>
            </div>

        </div>

    );

}



/* ==========================
   Sidebar Button Component
========================== */
function SidebarButton({ icon, label, onClick, collapsed, variant = 'default' }) {
    const variantClasses = {
        default: 'hover:bg-slate-700 hover:text-teal-400',
        danger: 'hover:bg-red-600/20 hover:text-red-400'
    };

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white transition ${variantClasses[variant]}`}
        >
            <span className="text-xl">{icon}</span>
            {!collapsed && <span className="font-medium">{label}</span>}
        </button>
    );
}



/* ==========================
   Stats Card Component
========================== */
function StatCard({ title, value, icon, color }) {
    return (
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition hover:shadow-xl hover:shadow-teal-500/10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{title}</h3>
                <span className="text-3xl">{icon}</span>
            </div>
            <div className={`text-4xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                {value}
            </div>
        </div>
    );
}



/* ==========================
   Quick Action Card Component
========================== */
function QuickActionCard({ label, icon, description, click, color }) {
    return (
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 hover:border-slate-600 transition hover:shadow-xl hover:shadow-teal-500/10 group cursor-pointer" onClick={click}>
            <div className={`inline-block text-5xl mb-4 p-3 rounded-xl bg-gradient-to-r ${color} bg-opacity-20`}>
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{label}</h3>
            <p className="text-slate-400 text-sm mb-6">{description}</p>
            <button
                className={`w-full px-4 py-2 bg-gradient-to-r ${color} text-white font-semibold rounded-lg hover:shadow-lg transition group-hover:shadow-lg`}
            >
                Open
            </button>
        </div>
    );
}


export default AdminDashboard;
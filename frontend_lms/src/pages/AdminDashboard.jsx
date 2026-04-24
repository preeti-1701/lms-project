import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const [usersResp, coursesResp, ticketsResp] = await Promise.all([
                    api.get('/users/'),
                    api.get('/courses/'),
                    api.get('/tickets/')
                ]);
                setUsers(usersResp.data);
                setCourses(coursesResp.data);
                setTickets(ticketsResp.data);
            } catch (err) {
                console.error("Failed to fetch admin data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleDeactivate = async (userId) => {
        if (!window.confirm("Are you sure you want to deactivate this user?")) return;
        try {
            await api.patch(`/users/${userId}/deactivate/`);
            setUsers(users.map(u => u.id === userId ? { ...u, status: 'INACTIVE', is_active: false } : u));
        } catch (err) {
            alert("Failed to deactivate user");
        }
    };

    const renderSidebar = () => (
        <div className="w-64 glass-panel p-6 flex flex-col h-[calc(100vh-4rem)] sticky top-8">
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-8">
                Enterprise LMS
            </h1>
            <nav className="flex-1 space-y-2">
                {['overview', 'users', 'courses', 'tickets'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                            activeTab === tab 
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </nav>
            <button onClick={logout} className="mt-auto btn-secondary text-red-600 hover:bg-red-50 hover:border-red-200">
                Sign Out
            </button>
        </div>
    );

    const renderOverview = () => (
        <div className="animate-fade-in-up grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 border-l-4 border-l-indigo-500">
                <h3 className="text-gray-500 font-medium text-sm">Total Active Users</h3>
                <p className="text-4xl font-bold text-gray-900 mt-2">{users.filter(u => u.is_active).length}</p>
            </div>
            <div className="glass-panel p-6 border-l-4 border-l-purple-500">
                <h3 className="text-gray-500 font-medium text-sm">Published Courses</h3>
                <p className="text-4xl font-bold text-gray-900 mt-2">{courses.length}</p>
            </div>
            <div className="glass-panel p-6 border-l-4 border-l-rose-500">
                <h3 className="text-gray-500 font-medium text-sm">Open Tickets</h3>
                <p className="text-4xl font-bold text-gray-900 mt-2">{tickets.filter(t => t.status === 'OPEN').length}</p>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="glass-panel animate-fade-in-up overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/40">
                <h2 className="text-xl font-bold text-gray-800">User Management</h2>
                <span className="badge badge-outline">Total: {users.length}</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider backdrop-blur-sm">
                        <tr>
                            <th className="px-6 py-4 font-medium">User</th>
                            <th className="px-6 py-4 font-medium">Role</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white/30">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-white/60 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                        {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`badge ${
                                        user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' :
                                        user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' :
                                        user.role === 'TRAINER' ? 'bg-sky-100 text-sky-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`badge ${user.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                        {user.status || (user.is_active ? 'ACTIVE' : 'INACTIVE')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {user.is_active && user.role !== 'SUPERADMIN' && (
                                        <button onClick={() => handleDeactivate(user.id)} className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors">
                                            Deactivate
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderCourses = () => (
        <div className="glass-panel animate-fade-in-up p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Course Directory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="border border-gray-200 rounded-xl p-5 bg-white/50 hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
                            <span className="badge badge-active">{course.status || 'PUBLISHED'}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description || "No description provided."}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                {course.assigned_users?.length || 0} / {course.max_capacity || '∞'} Students
                            </div>
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {course.videos?.length || 0} Videos
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTickets = () => (
        <div className="glass-panel animate-fade-in-up overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-white/40">
                <h2 className="text-xl font-bold text-gray-800">Support Desk</h2>
            </div>
            <div className="p-0">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase backdrop-blur-sm">
                        <tr>
                            <th className="px-6 py-4 font-medium">Subject</th>
                            <th className="px-6 py-4 font-medium">User</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white/30">
                        {tickets.map(ticket => (
                            <tr key={ticket.id} className="hover:bg-white/60 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-gray-900">{ticket.subject}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-xs">{ticket.description}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{ticket.user_email}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`badge ${ticket.status === 'OPEN' ? 'badge-warning' : ticket.status === 'RESOLVED' ? 'badge-active' : 'badge-outline'}`}>
                                        {ticket.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {tickets.length === 0 && (
                            <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No support tickets found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen py-8 px-4 sm:px-8 flex gap-8 max-w-[1600px] mx-auto">
            {renderSidebar()}
            <main className="flex-1">
                <header className="mb-8 pl-2">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {activeTab === 'overview' ? 'Dashboard Overview' : 
                         activeTab === 'users' ? 'User Directory' :
                         activeTab === 'courses' ? 'Course Management' : 'Support Tickets'}
                    </h2>
                    <p className="text-gray-500 mt-1">Manage your enterprise learning platform.</p>
                </header>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="transition-all duration-500">
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'users' && renderUsers()}
                        {activeTab === 'courses' && renderCourses()}
                        {activeTab === 'tickets' && renderTickets()}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;

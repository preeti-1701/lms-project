import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap,
  Shield, Video, LogOut, Menu, X
} from 'lucide-react';

const navConfig = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/admin/users',     label: 'Users',      Icon: Users },
    { to: '/admin/courses',   label: 'Courses',    Icon: BookOpen },
    { to: '/admin/students',  label: 'Students',   Icon: GraduationCap },
  ],
  trainer: [
    { to: '/trainer/dashboard', label: 'Dashboard',  Icon: LayoutDashboard },
    { to: '/trainer/courses',   label: 'My Courses',  Icon: BookOpen },
    { to: '/trainer/students',  label: 'Students',    Icon: GraduationCap },
  ],
  student: [
    { to: '/student/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/student/courses',   label: 'My Courses', Icon: GraduationCap },
    { to: '/student/browse',    label: 'Browse',     Icon: BookOpen },
  ],
};

const roleColors  = { admin: '#059669', trainer: '#0891b2', student: '#4f46e5' };
const roleLights  = { admin: '#d1fae5', trainer: '#e0f2fe', student: '#e0e7ff' };
const roleIcons   = { admin: Shield,    trainer: Video,     student: GraduationCap };

const TopNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links  = navConfig[user?.role] || [];
  const color  = roleColors[user?.role]  || '#4f46e5';
  const light  = roleLights[user?.role]  || '#e0e7ff';
  const RIcon  = roleIcons[user?.role]   || Shield;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U';

  const handleLogout = () => { logout(); navigate('/'); };

  const renderLink = (l, mobile = false) => (
    <NavLink key={l.to} to={l.to}
      className={({ isActive }) => mobile ? `mobile-link${isActive ? ' active' : ''}` : `topnav-link${isActive ? ' active' : ''}`}
      onClick={() => mobile && setOpen(false)}
    >
      <l.Icon size={mobile ? 18 : 16} />
      {l.label}
    </NavLink>
  );

  return (
    <>
      <nav className="topnav">
        <div className="topnav-logo" onClick={() => navigate('/')}>
          <span className="topnav-logo-icon">📚</span>
          <span className="topnav-logo-text">LearnHub</span>
        </div>
        <div className="topnav-links">{links.map(l => renderLink(l))}</div>
        <div className="topnav-user">
          <div className="topnav-avatar" style={{ background: light, color }}>
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
            <span className="topnav-name">{user?.name}</span>
            <span className="topnav-role" style={{ color }}>
              <RIcon size={10} style={{ marginRight: 3, display: 'inline' }} />{user?.role}
            </span>
          </div>
          <button className="topnav-logout" onClick={handleLogout}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
        <button className="topnav-hamburger" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {open && (
        <div className="mobile-menu">
          {links.map(l => renderLink(l, true))}
          <button
            className="mobile-link"
            style={{ border:'none', background:'none', color:'var(--danger)', cursor:'pointer', textAlign:'left', width:'100%' }}
            onClick={handleLogout}
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>
      )}
    </>
  );
};

export default TopNav;

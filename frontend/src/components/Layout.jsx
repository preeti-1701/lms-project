import { useState, useRef, useEffect } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { LayoutDashboard, BookOpen, BarChart3, Settings, Search, Bell, ChevronLeft, ChevronRight, Menu, X, LogOut, User, GraduationCap, Shield, MonitorPlay } from "lucide-react"

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Courses", icon: BookOpen, href: "/courses" },
  { label: "Analytics", icon: BarChart3, href: "#" },
  { label: "Settings", icon: Settings, href: "#" },
]

const ROLE_META = {
  student: { icon: GraduationCap, label: "Student", color: "text-emerald-600 bg-emerald-50" },
  trainer: { icon: MonitorPlay, label: "Trainer", color: "text-indigo-600 bg-indigo-50" },
  admin: { icon: Shield, label: "Admin", color: "text-rose-600 bg-rose-50" },
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const doLogout = () => { logout(); navigate("/login") }
  const doSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) { navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery("") }
  }

  const roleMeta = ROLE_META[user?.role] || ROLE_META.student
  const RoleIcon = roleMeta.icon

  const navLinkClass = (active) => active
    ? "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-light text-primary font-medium transition"
    : "flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-slate-100 hover:text-text transition"

  return (
    <div className="min-h-screen bg-bg flex text-text">
      {mobileOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-surface border-r border-border flex flex-col transition-all duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} ${collapsed ? "w-[72px]" : "w-64"}`}>
        <div className="h-16 flex items-center px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            {!collapsed && <span className="font-bold text-lg tracking-tight">LearnHub</span>}
          </Link>
          <button onClick={() => setMobileOpen(false)} className="md:hidden ml-auto p-1 rounded-md hover:bg-slate-100">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link key={item.label} to={item.href} onClick={() => setMobileOpen(false)} className={navLinkClass(isActive)} title={collapsed ? item.label : undefined}>
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                {!collapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={() => setCollapsed(!collapsed)} className="hidden md:flex w-full items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-text-muted hover:text-text hover:bg-slate-100 rounded-xl transition">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border">
          <div className="h-16 px-4 md:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-text-muted">
                <Menu className="w-5 h-5" />
              </button>
              <form onSubmit={doSearch} className="relative max-w-md w-full hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search courses, lessons..." className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
              </form>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button className="relative p-2 rounded-xl hover:bg-slate-100 text-text-muted transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>
              <div className="relative" ref={profileRef}>
                <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 md:gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {user?.first_name?.[0] || user?.username?.[0] || "U"}
                  </div>
                  <div className="hidden md:block text-left min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">{user?.first_name || user?.username}</p>
                    <p className="text-xs text-text-muted capitalize">{user?.role}</p>
                  </div>
                </button>
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-border overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-text">{user?.first_name || user?.username} {user?.last_name || ""}</p>
                      <p className="text-xs text-text-muted">{user?.email}</p>
                      <span className={`inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${roleMeta.color}`}>
                        <RoleIcon className="w-3 h-3" /> {roleMeta.label}
                      </span>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { setShowProfile(false); navigate("/") }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:bg-slate-50 hover:text-text transition">
                        <User className="w-4 h-4" /> Profile
                      </button>
                      <button onClick={doLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
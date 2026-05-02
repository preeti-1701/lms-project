import DashboardLayout from "./DashboardLayout";
 
const STUDENT_NAV = [
  { to: "/student/dashboard", icon: "⬛", label: "My Courses" },
  { to: "/student/progress",  icon: "◎",  label: "Progress"   },
];
 
export default function StudentLayout() {
  return (
    <DashboardLayout
      navItems={STUDENT_NAV}
      accent="#818cf8"
      accentBg="rgba(99,102,241,.12)"
    />
  );
}
 
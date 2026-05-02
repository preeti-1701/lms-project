import DashboardLayout from "./DashboardLayout";

const ADMIN_NAV = [
  { to: "/admin/dashboard", icon: "▣",  label: "Overview"        },
  { to: "/admin/users",     icon: "⊕",  label: "Users"           },
  { to: "/admin/courses",   icon: "◈",  label: "Courses"         },
];

export default function AdminLayout() {
  return (
    <DashboardLayout
      navItems={ADMIN_NAV}
      accent="#ecaf4f"
      accentBg="rgba(236,175,79,.1)"
    />
  );
}
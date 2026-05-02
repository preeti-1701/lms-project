import DashboardLayout from "./DashboardLayout";

const TRAINER_NAV = [
  { to: "/trainer/dashboard", icon: "◉", label: "My Courses" },
  { to: "/trainer/assign",    icon: "⊞", label: "Assign"     },
];

export default function TrainerLayout() {
  return (
    <DashboardLayout
      navItems={TRAINER_NAV}
      accent="#2dd4bf"
      accentBg="rgba(45,212,191,.1)"
    />
  );
}
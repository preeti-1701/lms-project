import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
        <GraduationCap className="h-5 w-5 text-primary-foreground" />
        <span className="absolute inset-0 rounded-xl bg-gradient-primary opacity-50 blur-md animate-glow" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-gradient">
        Lumen LMS
      </span>
    </Link>
  );
}

"use client";

import { BarChart3, Bookmark, BriefcaseBusiness, Building2, FileSearch2, Home, Target, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  ["Dashboard", "/", Home],
  ["Jobs", "/jobs", BriefcaseBusiness],
  ["Resume Match", "/resume", FileSearch2],
  ["Recommendations", "/recommendations", Target],
  ["Profile", "/profile", UserRound],
  ["Career Gap", "/career-gap", BarChart3],
  ["Saved", "/saved", Bookmark],
  ["Companies", "/companies", Building2]
] as const;

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="Primary navigation">
      {nav.map(([label, href, Icon]) => {
        const active = href === "/" ? pathname === href : pathname.startsWith(href);
        return (
          <Link href={href} key={href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
            <Icon size={18} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

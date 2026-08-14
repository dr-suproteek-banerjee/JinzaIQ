import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Bookmark, BriefcaseBusiness, Building2, GitCompare, Home, Search, Target, UserRound } from "lucide-react";

export const metadata: Metadata = {
  title: "JinzaIQ",
  description: "AI-powered intelligence for finding and preparing for tech careers in Japan."
};

const nav = [
  ["Dashboard", "/", Home],
  ["Jobs", "/jobs", BriefcaseBusiness],
  ["Search", "/search", Search],
  ["Recommendations", "/recommendations", Target],
  ["Profile", "/profile", UserRound],
  ["Career Gap", "/career-gap", BarChart3],
  ["Saved", "/saved", Bookmark],
  ["Compare", "/compare", GitCompare],
  ["Companies", "/companies", Building2]
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <div className="brand">JinzaIQ</div>
            <div className="tagline">AI-powered intelligence for finding and preparing for tech careers in Japan.</div>
            <nav className="nav">
              {nav.map(([label, href, Icon]) => (
                <Link href={href} key={href}>
                  <Icon size={18} aria-hidden />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}

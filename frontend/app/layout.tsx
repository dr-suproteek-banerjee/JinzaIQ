import "./globals.css";
import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: { default: "JinzaIQ", template: "%s | JinzaIQ" },
  description: "Explainable job matching, visa signals, and career-gap intelligence for technology careers in Japan.",
  applicationName: "JinzaIQ",
  keywords: ["Japan tech jobs", "software engineering", "visa sponsorship", "career intelligence"],
  openGraph: {
    title: "JinzaIQ — Japan Tech Career Intelligence",
    description: "Find the right Japan tech roles and understand exactly how to improve your match.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="shell">
          <aside className="sidebar">
            <div className="brand"><span className="brand-mark">人</span><span>JinzaIQ<small>人材 IQ</small></span></div>
            <div className="tagline">A sharper path into Japan&apos;s technology market.</div>
            <Navigation />
            <div className="sidebar-note"><span className="status-dot" /><strong>Live sourcing active</strong><span>Public feeds refresh every six hours. Visa signals are never guarantees.</span></div>
          </aside>
          <main className="main" id="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "CuriousMinds Lab",
  description: "Interactive STEM, Music, Art & CS learning for curious minds",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-slate-50 text-slate-900 min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

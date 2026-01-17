import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from 'sonner';
import AuthProvider from '@/components/AuthProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trend Pulse",
  description: "AI-powered Trend Analysis Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-zinc-100 selection:bg-purple-500/30`}
      >
        <AuthProvider>
            <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
            </div>
            <Toaster richColors position="bottom-left" theme="dark" />
        </AuthProvider>
      </body>
    </html>
  );
}

"use client"

import Link from "next/link";
import Footer from "../_components/landing/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal header with a Return to Home link */}
      <header className="py-4 px-6">
        <Link href="/" className="text-blue-500 hover:underline">
          Return Home
        </Link>
      </header>
      <main className="flex-1 p-6">{children}</main>
      <Footer />
    </div>
  );
}
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import AuthListener from "@/components/AuthListener";
import { Toaster } from "@/components/ui/toaster";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Kwill",
  description: "AI-powered query analysis",
  icons: [
    // { url: '/icon.png', sizes: '32x32' },
    // { url: '/public/images/logos/kwill-no-bg.png', sizes: '32x32' },
    // { rel: 'apple-touch-icon', url: '/images/logos/kwill.png' },
  ],
  other: {
    'darkreader-lock': '',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head><meta name="darkreader-lock"/></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            <NavbarWrapper session={!!session}/>
            <main className="flex-grow">
              {children}
              <Toaster />
            </main>
          </div>
        </ThemeProvider>
        <AuthListener initialSession={!!session} />
      </body>
    </html>
  );
}

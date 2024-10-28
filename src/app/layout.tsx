import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import AuthListener from "@/components/AuthListener";
import { Toaster } from "@/components/ui/toaster";

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
    // { url: '/favicon.ico', sizes: '32x32' },
    { url: '/public/images/logos/kwill.png', sizes: '32x32' },
    // { rel: 'apple-touch-icon', url: '/images/logos/kwill.png' },
  ]
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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

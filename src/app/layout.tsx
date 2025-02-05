import { Toaster } from "@/components/ui/toaster";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { Providers } from './providers';
import { ThemeProvider } from "@/components/ThemeProvider";
import { NavbarWrapper } from "@/components/nav/NavbarWrapper";
import AuthListener from "@/components/AuthListener";
import { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Inter } from 'next/font/google';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Kwill",
  description: "AI-powered query analysis",
  icons: [],
  other: {
    'darkreader-lock': '',
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head><meta name="darkreader-lock"/></head>
      <body className={`${geistSans.variable} font-sans antialiased ${inter.className}`}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="min-h-screen flex flex-col">
              <NavbarWrapper user={user}/>
              <main className="flex-grow">
                {children}
                <Toaster />
              </main>
            </div>
          </ThemeProvider>
        </Providers>
        <AuthListener initialUser={user} />
      </body>
    </html>
  );
}

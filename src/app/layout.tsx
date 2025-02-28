import "@/styles/globals.css";

import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Toaster } from "sonner";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Kwill",
  description: "Streamline your meetings into actionable data",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`dark ${GeistSans.variable}`}>
        <head>
          <meta name="darkreader-lock" />
        </head>
        <body className="bg-background">
          <Toaster />
          <TRPCReactProvider>
            <div className="min-h-screen flex flex-col">
              <div className="absolute top-4 right-4 z-50">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="rounded-lg px-4 py-2 font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
              {children}
            </div>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

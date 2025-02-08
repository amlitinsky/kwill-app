import { UserButton } from "@clerk/nextjs";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      {/* Minimal header */}
      <header className="border-b bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Kwill</h1>
          <UserButton afterSignOutUrl="/"/>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
} 
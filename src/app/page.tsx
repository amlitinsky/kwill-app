import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import LandingPage from "./_components/landing/LandingPage";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  const { userId } = await auth();
  
  // If authenticated, redirect to chat
  if (userId) {
    redirect("/chat");
  }

  // Otherwise show landing page
  return (
    <HydrateClient>
      <LandingPage />
    </HydrateClient>
  );
}

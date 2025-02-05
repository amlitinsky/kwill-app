import LandingPage from "@/components/landing/LandingPage";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // Await searchParams before using it
  const params = await searchParams;
  
  // If we're signing out, skip the auth check and show landing page
  if (params.signout === 'true') {
    return <LandingPage />;
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
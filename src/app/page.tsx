import LandingPage from "./public/landing/page";
import PrivateDashboard from "./private/dashboard/page";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <>
      {session ? <PrivateDashboard /> : <LandingPage />}
    </>
  );
}
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import LandingPage from "./public/landing/page";
import AuthDashboard from "./private/dashboard/page";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <>
      {session ? <AuthDashboard /> : <LandingPage />}
    </>
  );
}
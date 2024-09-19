import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import LandingPage from "./public/landing/page";
import PrivateDashboard from "./private/dashboard/page";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <>
      {session ? <PrivateDashboard /> : <LandingPage />}
    </>
  );
}
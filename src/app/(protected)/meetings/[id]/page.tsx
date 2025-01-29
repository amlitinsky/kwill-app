import { notFound } from "next/navigation"
import { createServerSupabaseClient} from "@/lib/supabase-server"
import { MeetingDetails } from "@/components/meetings/MeetingDetails"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MeetingPage({ params }: PageProps) {
  const supabase = await createServerSupabaseClient()
  const { id } = await params
  
  const { data: meeting, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !meeting) {
    notFound()
  }

  return <MeetingDetails meeting={meeting} />
} 
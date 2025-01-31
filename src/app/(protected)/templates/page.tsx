import { fetchTemplates } from '@/lib/supabase-server'
import TemplatesContent from '@/components/templates/TemplatesContent'

export default async function TemplatesPage() {
  const templates = await fetchTemplates()
  return <TemplatesContent initialTemplates={templates} />
}
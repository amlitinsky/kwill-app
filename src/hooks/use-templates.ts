import useSWR from 'swr'
import { useToast } from "@/hooks/use-toast"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.')
  }
  return res.json()
}

export function useTemplates() {
  const { toast } = useToast()
  const { data, error, mutate } = useSWR('/api/templates', fetcher, {
    onError: (err) => {
      toast({ title: "Error fetching templates", description: err.message, variant: "destructive" })
    }
  })

  return {
    templates: data,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}
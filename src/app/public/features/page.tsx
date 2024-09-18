import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FeaturesPage() {
  const features = [
    {
      title: "AI-Powered Analysis",
      description: "Leverage cutting-edge AI to analyze and extract insights from your meetings."
    },
    {
      title: "Seamless Integration",
      description: "Connect effortlessly with Zoom and Google Sheets for a smooth workflow."
    },
    {
      title: "Custom Instructions",
      description: "Tailor the analysis to your specific needs with custom instructions."
    },
    {
      title: "Real-time Transcription",
      description: "Get accurate, real-time transcriptions of your meetings."
    }
  ]

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Kwill Features</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
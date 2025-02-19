
import { type meetingInsightsSchema } from "@/server/api/routers/meeting";
import { type z } from "zod";

export const formattedMeetingInsights = (data: z.infer<typeof meetingInsightsSchema>) => ` 
  Meeting Analysis Summary:
  ${data.meetingAnalysis.summary}

  Action Items:
  ${data.meetingAnalysis.actionItems.map(item => `• ${item}`).join('\n')}

  Key Points:
  ${data.meetingAnalysis.keyPoints.map(point => `• ${point}`).join('\n')}

  Topic Distribution:
  ${Object.entries(data.meetingAnalysis.topicDistribution)
    .map(([topic, percentage]) => `• ${topic}: ${percentage}%`)
    .join('\n')}

  Speaker Insights:
  ${Object.entries(data.speakerInsights)
    .map(([speaker, insights]) => `
  ${speaker}:
  • Participation Rate: ${insights.participationRate}%
  • Average Speaking Pace: ${insights.averageSpeakingPace} words/min
  • Total Speaking Time: ${insights.totalSpeakingTime} minutes
  • Key Contributions:
  ${insights.keyContributions.map(contribution => `  - ${contribution}`).join('\n')}
  `).join('\n')}
  `;
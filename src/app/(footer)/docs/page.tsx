'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { BookOpen, Zap } from "lucide-react"

export default function Docs() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6">Kwill Documentation</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Learn how to use Kwill&apos;s chat-based interface to streamline your meeting analysis.
      </p>

      <Tabs defaultValue="quickstart" className="mb-12">
        <TabsList>
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="usage">Usage Guide</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        <TabsContent value="quickstart">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-4">
                <li>Start a new chat in Kwill</li>
                <li>Paste your Google Sheets link (one per chat)</li>
                <li>When you have a meeting, paste the meeting link (Zoom, Google Meet, or Microsoft Teams)</li>
                <li>Kwill will launch a meeting bot to handle the analysis</li>
                <li>View results in your linked spreadsheet after the meeting</li>
              </ol>
              <Button className="mt-6" variant="outline">
                <BookOpen className="mr-2 h-4 w-4" /> Read Full Guide
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>How to Use Kwill</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="setup-chat">
                  <AccordionTrigger>Setting Up a Chat</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Start a new chat from the main interface</li>
                      <li>Paste your Google Sheets link (this will be permanently linked to the chat)</li>
                      <li>You&apos;re ready to analyze meetings!</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="analyze-meeting">
                  <AccordionTrigger>Analyzing a Meeting</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Paste your meeting link (Zoom, Google Meet, or Microsoft Teams)</li>
                      <li>Kwill will confirm the bot is joining</li>
                      <li>The bot will automatically leave when the meeting ends</li>
                      <li>Results will appear in your linked spreadsheet</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="chat-features">
                  <AccordionTrigger>Chat Features</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Each chat is tied to one spreadsheet</li>
                      <li>You can analyze multiple meetings in the same chat</li>
                      <li>Chat history is preserved for reference</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="spreadsheet-link">
                  <AccordionTrigger>Can I change the linked spreadsheet?</AccordionTrigger>
                  <AccordionContent>
                    No, each chat is permanently linked to one spreadsheet. If you need to change the spreadsheet, start a new chat.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="meeting-types">
                  <AccordionTrigger>What meeting platforms are supported?</AccordionTrigger>
                  <AccordionContent>
                    We currently support Zoom, Google Meet, and Microsoft Teams.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="bot-joining">
                  <AccordionTrigger>How does the bot join meetings?</AccordionTrigger>
                  <AccordionContent>
                    The bot automatically joins when you paste a valid meeting link. It will appear as a participant in the meeting.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="data-security">
                  <AccordionTrigger>Is my meeting data secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes, we use end-to-end encryption and only retain data temporarily for processing.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Start a new chat</li>
              <li>Paste your Google Sheets link</li>
              <li>Paste meeting links when needed</li>
              <li>View results in your spreadsheet</li>
            </ol>
            <Button className="mt-6">
              <Zap className="mr-2 h-4 w-4" /> Start Chatting
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Use one chat per project or team</li>
              <li>Ensure your spreadsheet is properly formatted</li>
              <li>Paste meeting links at least 15 minutes before start time</li>
              <li>Use the chat history to track meeting analysis</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

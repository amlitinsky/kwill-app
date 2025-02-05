'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { BookOpen, HelpCircle, Zap } from "lucide-react"

export default function Docs() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6">Kwill Documentation</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Learn how to use Kwill to streamline your meeting analysis process.
      </p>

      <Tabs defaultValue="quickstart" className="mb-12">
        <TabsList>
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="usage">Usage Guide</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>
        <TabsContent value="quickstart">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-4">
                <li>Sign up for a Kwill account</li>
                <li>Connect your Zoom account in the Settings page</li>
                <li>Create a new meeting query with a Google Sheets link and Zoom link</li>
                <li>Add any custom instructions or speaker exclusions</li>
                <li>Submit your query and let Kwill handle the rest!</li>
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
                <AccordionItem value="create-meeting">
                  <AccordionTrigger>Creating a New Meeting Query</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Navigate to the &quot;New Meeting&quot; page</li>
                      <li>Enter a valid shareable Google Sheets link</li>
                      <li>Enter a valid Zoom link</li>
                      <li>Add any custom instructions or speaker exclusions</li>
                      <li>Click &quot;Submit&quot; to create your query</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="bot-joining">
                  <AccordionTrigger>How the Bot Joins Your Meeting</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Our AI bot automatically joins the Zoom call at the specified time. You don&apos;t need to do anything
                      else - the bot will join at the meeting time and leave once the call is finished.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="after-meeting">
                  <AccordionTrigger>After the Meeting</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Kwill will analyze the meeting and update your Google Sheet with the results. You&apos;ll also be able
                      to view deeper meeting insights once the meeting has fully processed.
                    </p>
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
                <AccordionItem value="meeting-limit">
                  <AccordionTrigger>How many meetings can I analyze?</AccordionTrigger>
                  <AccordionContent>
                    Our subscription plans offer 5, 10, or 20 hours of meeting analysis per month, priced at $20, $30,
                    and $40 respectively. If you exceed your plan's hours, you can purchase additional hours at $3.5 per
                    hour.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="data-security">
                  <AccordionTrigger>Is my meeting data secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes, we use end-to-end encryption for all data in transit and at rest. We only retain transcripts
                    momentarily for processing and delete them immediately after analysis.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="customization">
                  <AccordionTrigger>Can I customize the analysis?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you can provide custom instructions when creating a new query. This allows you to tailor the
                    analysis to your specific needs.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="payment-update">
                  <AccordionTrigger>How do I update my payment information?</AccordionTrigger>
                  <AccordionContent>
                    You can update your payment details in the Billing section of your account settings. We use Stripe
                    for secure payment processing.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="troubleshooting">
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting Common Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li>
                  <strong>Bot didn't join the meeting:</strong> Ensure your Zoom link is correct and the meeting is
                  scheduled for the future.
                </li>
                <li>
                  <strong>Google Sheets not updating:</strong> Check that your Google Sheets link is shareable and you
                  have the necessary permissions.
                </li>
                <li>
                  <strong>Analysis taking too long:</strong> Large meetings may take some time to process. If it's been
                  over 24 hours, please contact support.
                </li>
              </ul>
              <Button className="mt-6" variant="outline">
                <HelpCircle className="mr-2 h-4 w-4" /> Contact Support
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Installation Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Sign up for a Kwill account</li>
              <li>Log in and navigate to the Settings page</li>
              <li>Click on &quot;Connect Zoom Account&quot;</li>
              <li>Authorize Kwill on the Zoom permissions page</li>
              <li>You&apos;re all set to use Kwill!</li>
            </ol>
            <Button className="mt-6">
              <Zap className="mr-2 h-4 w-4" /> Get Started
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Uninstallation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">To remove Kwill&apos;s access to your Zoom account:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Log in to your Zoom Account</li>
              <li>Navigate to the Zoom App Marketplace</li>
              <li>Go to Manage &gt; Installed Apps</li>
              <li>Find and click on the Kwill app</li>
              <li>Click Uninstall</li>
            </ol>
            <p className="mt-4 text-sm text-muted-foreground">
              Note: This will only revoke Zoom access. To delete your Kwill account entirely, please contact our support
              team.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


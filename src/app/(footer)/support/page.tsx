
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Clock, Mail, MessageSquare, Phone } from "lucide-react"


export default function Support() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Send email to support
    const emailData = {
      to: "support@kwill.app",
      subject: "Support Request",
      body: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    // Use mailto link as fallback
    window.location.href = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    // Reset form fields
    setName("")
    setEmail("")
    setMessage("")
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6">Kwill Support</h1>
      <p className="text-xl text-muted-foreground mb-8">We&apos;re here to help you get the most out of Kwill.</p>

      <div className="grid gap-8 md:grid-cols-3 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2" />
              Email Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>For any inquiries, email us at:</p>
            <a href="mailto:support@kwill.app" className="text-primary hover:underline">
              support@kwill.app
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2" />
              Support Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Monday - Friday</p>
            <p>9:00 AM - 5:00 PM PT</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="mr-2" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>We aim to respond to all support requests within 24 hours during business days.</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contact" className="mb-12">
        <TabsList>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>Fill out the form below and we&apos;ll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">How do I connect my Zoom account?</h3>
                  <p>
                    Go to the Settings page and click on &quot;Connect Zoom Account&quot;. Follow the prompts to authorize Kwill.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">What if the bot doesn&apos;t join my meeting?</h3>
                  <p>
                    Ensure your Zoom link is correct and the meeting is scheduled for the future. If issues persist,
                    contact support.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">How long does it take to process a meeting?</h3>
                  <p>Most meetings are processed within 10 minutes. Larger meetings may take longer.</p>
                </div>
                <div>
                  <h3 className="font-semibold">Can I customize the analysis?</h3>
                  <p>Yes, you can provide custom instructions when creating a new meeting query.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>What to Expect</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Our dedicated support team is committed to providing you with the best possible assistance. We&apos;ll work
            diligently to address your concerns and ensure your experience with Kwill is smooth and productive.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-4">
            <Button variant="outline" className="flex items-center">
              <Phone className="mr-2 h-4 w-4" />
              Schedule a Call
            </Button>
            <Button variant="outline" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Live Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
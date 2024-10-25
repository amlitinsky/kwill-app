'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function Support() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = `mailto:support@kwill.app?subject=Support Request from ${name}&body=${message}`
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Support</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>We&apos;re here to help! Send us a message and we&apos;ll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="How can we help you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Send Message</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Support Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Email Support</h3>
              <p>For any inquiries, please email us at: <a href="mailto:support@kwill.app" className="text-blue-600 hover:underline">support@kwill.app</a></p>
            </div>
            <div>
              <h3 className="font-semibold">Support Hours</h3>
              <p>Our support team is available Monday through Friday, 9:00 AM to 5:00 PM Pacific Time.</p>
            </div>
            <div>
              <h3 className="font-semibold">Response Time</h3>
              <p>We strive to respond to all support requests within 24 hours during our business days.</p>
            </div>
            <div>
              <h3 className="font-semibold">What to Expect</h3>
              <p>Our dedicated support team is committed to providing you with the best possible assistance. We&apos;ll work diligently to address your concerns and ensure your experience with Kwill is smooth and productive.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
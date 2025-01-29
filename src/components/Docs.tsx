import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Docs() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Kwill Documentation</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">How to Use Kwill</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Log in to your Kwill account.</li>
            <li>Navigate to the &quot;New Meeting&quot; page.</li>
            <li>Enter a valid shareable Google Sheets link.</li>
            <li>Enter a valid Zoom link.</li>
            <li>Add any custom instructions or specify people to omit or include from the analysis.</li>
            <li>Click &quot;Submit&quot; to create your query.</li>
            <li>Our AI bot will join the Zoom call at the specified time.</li>
            <li>After the call, Kwill will analyze the meeting and update your Google Sheet with the results.</li>
          </ol>

          <h3 className="text-lg font-semibold mt-4 mb-2">Sending a Bot to a Zoom Call</h3>
          <p>When you provide a Zoom link in step 4, our system automatically schedules a bot to join the call. You don&apos;t need to do anything else - the bot will join at the meeting time and leave once the call is finished.</p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Installation</CardTitle>
        </CardHeader>
        <CardContent>
          <p>To start using Kwill with your Zoom account:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Sign up for a Kwill account at our sign up page.</li>
            <li>Once logged in, navigate to the Settings page.</li>
            <li>Click on &quot;Connect Zoom Account&quot;.</li>
            <li>You&apos;ll be redirected to Zoom to authorize Kwill. Follow the prompts to grant the necessary permissions.</li>
            <li>Once authorized, you&apos;ll be redirected back to Kwill, ready to use the service.</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Uninstallation</CardTitle>
        </CardHeader>
        <CardContent>
          <p>To remove Kwill&apos;s access to your Zoom account:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Log in to your Zoom Account and navigate to the Zoom App Marketplace.</li>
            <li>Click Manage &gt; Installed Apps, or search for the Kwill app.</li>
            <li>Click on the Kwill app.</li>
            <li>Click Uninstall.</li>
          </ol>
          <p className="mt-2">Note: This will only revoke Zoom access. To delete your Kwill account entirely, please contact our support team.</p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Common Issues</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Bot didn&apos;t join the meeting:</strong> Ensure your Zoom link is correct and the meeting is scheduled for the future.</li>
            <li><strong>Google Sheets not updating:</strong> Check that your Google Sheets link is shareable and you have the necessary permissions.</li>
            <li><strong>Analysis taking too long:</strong> Large meetings may take some time to process. If it&apos;s been over 24 hours, please contact support.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Frequently Asked Questions</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>How many meetings can I analyze?</strong> The free plan includes 4 meetings. After that, you&apos;ll need to upgrade to a paid plan.</li>
            <li><strong>Is my meeting data secure?</strong> Yes, we use encryption for all data in transit and at rest. We only retain transcripts only momentarily.</li>
            <li><strong>Can I customize the analysis?</strong> Yes, you can provide custom instructions when creating a new query.</li>
            <li><strong>How do I update my payment information?</strong> You can update your payment details in the Billing section of your account settings.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
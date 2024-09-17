RECALL DOCUMENTATION





RETRIEVE BOT:
const fetch = require('node-fetch');

const url = 'https://us-east-1.recall.ai/api/v1/bot/id/';
const options = {method: 'GET', headers: {accept: 'application/json'}};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));


BOT WEBHOOK DOCS:
Bot Status Changes
Recall uses bot status changes to capture the lifecycle of a bot.

These status changes are exposed through webhooks, which your application can use to create a real-time experience or react to asynchronous events outside of the API request cycle.

For example, you may want to update something on your end when a bot transitions its status from joining_call to in_call_recording. When these asynchronous events happen, we'll make a POST request to the address you give us and you can do whatever you need with it on your end.

After a webhook is configured for an environment, notifications will be sent for all events for that environment.

Important webhook handler considerations

2xx response: Your webhook handler should return a HTTP 2xx Code
Retries: If Recall doesn't receive a 2xx response from your server, we will continue to try the message for the next 24 hours, with an increasing delay between attempts.
Timeouts: Webhook events have a timeout of 15 seconds. If you plan to kick off longer running tasks upon receiving certain events, make sure to do this asynchronously so you respond to requests before they time out.
Events
This webhook is sent whenever the bot's status is changed and is delivered via Svix to the endpoints configured in your Recall dashboard.

JSON

{
  "event": "bot.status_change",
  "data": {
    "bot_id": string,
    "status": {
      "code": string,
      "created_at": string,
      "sub_code": string | null,
      "message": string | null,
      "recording_id": string | absent
    },
  }
}
The possible values for data.status.code are the following:

Status code	Description
ready	This is an internal status and should be ignored
joining_call	The bot has acknowledged the request to join the call, and is in the process of connecting.
in_waiting_room	The bot is in the "waiting room" of the meeting.
participant_in_waiting_room	A participant has joined the waiting room (The bot is in the call)
in_call_not_recording	The bot has joined the meeting, however is not recording yet. This could be because the bot is still setting up, does not have recording permissions, or the recording was paused.
recording_permission_allowed	The bot has joined the meeting and it's request to record the meeting has been allowed by the host. (only for Zoom bots with New SDK)
recording_permission_denied	The bot has joined the meeting and it's request to record the meeting has been denied. Refer to sub_code field for exact reason. (only for Zoom bots with New SDK)
in_call_recording	The bot is in the meeting, and is currently recording the audio and video.
call_ended	The bot has left the call, and the real-time transcription is complete.
The data.status.sub_code will contain machine readable code for why the call ended & data.status.message will contain human readable description for the same.
recording_done	The recording has completed.
done	The bot has shut down. If bot produced in_call_recording event, the video is uploaded and available for download.
fatal	The bot has encountered an error that prevented it from joining the call. The data.status.sub_code will contain machine readable code for why bot failed. data.status.message will contain human readable description for the same.
analysis_done	Any asynchronous intelligence job (like transcription or audio intelligence) has been completed.
analysis_failed	Any asynchronous intelligence job (like transcription or audio intelligence) has failed.
media_expired	The video, audio, metadata, debug data, and transcription have been deleted from Recall's servers.
We may add additional Status Change event codes

You should not treat the data.status.code as an enum, as we may add values in the future without prior notice. We will never remove values without notifying all our customers and a long depreciation period, as we consider removing values a breaking change.

The list of sub_code & corresponding message values that may be produced for call_ended/fatal status changes can be found here here.

Bot Status Transition Diagram
This diagram provides a detailed view of bot statuses:


Bot Logs
Bot webhooks also include events for bot logs, providing detailed information about certain failure modes.

Events
You should listen to these to detect errors that occur in your bots.

Status code	Description
bot.log	Detailed information about certain failure modes of the bot.
bot.output_log	Detailed information about certain failure modes of the bot, related to a specific output of the bot.
There are several warnings/errors that can trigger bot.log events:

Failure to send chat messages
There are several warnings/errors that can trigger bot.output_log events:

Real-time transcription errors
Zoom OAuth integration warnings
RTMP connection errors
The shape of the log payloads are as follows:

JSON

{
  "event": "bot.log"|"bot.output_log",
  "data": {
    "bot_id": string | absent, // Present for all but async transcription job logs
    "job_id": string | absent, // Present for async transcription job logs
    "log": {
      "level": string,
      "message": string,
      "output_id": string | null,
      "created_at": string
    }
  }
}
Real-time transcription errors
If you configure your bot for real-time transcription, and the bot receives a fatal error communicating with the transcription provider, Recall will emit a bot.output_log event for the bot with details about the error.

For example, if I provide an invalid API key for a transcription provider, I will receive a log event notifying me about this:


{
  "data": {
    "bot_id": "fc75fbf8-4a87-4438-bca8-83200962a1eb",
    "log": {
      "created_at": "2024-03-10T19:16:16+00:00",
      "level": "error",
      "message": "Failed to connect to transcription provider: Error connecting to transcription provider: Http(Response { status: 401, version: HTTP/1.1, headers: {\"content-type\": \"application/json\", \"dg-error\": \"Invalid credentials.\", \"content-length\": \"112\", \"access-control-allow-credentials\": \"true\"}",
      "output_id": "9aac7fc7-f4fc-4d70-8845-d9cc371cbe17"
    }
  },
  "event": "bot.output_log"
}


SETTING BOT WEBHOOK:
To set up a webhook endpoint in your NextJS 14 application with the App Router system for Recall.ai, you'll need to modify your existing code to include webhook verification and handle the bot status changes correctly. Here's how you can update your code:

First, install the necessary package:
npm install svix
Then, update your app/api/webhook/route.ts file:
typescript
import { NextResponse } from 'next/server';
import { Webhook } from "svix";

const secret = "whsec_yhVJ7lfTGMQDJY8YSq9aGcsw4I7/XJIz"; // Replace with your actual secret

// In a real application, you'd store this in a database
let latestBotStatus: { [botId: string]: string } = {};

export async function POST(req: Request) {
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  const wh = new Webhook(secret);
  let msg;
  try {
    msg = wh.verify(payload, headers);
  } catch (err) {
    return NextResponse.json({}, { status: 400 });
  }

  const { event, data } = msg;

  if (event === 'bot.status_change') {
    const { bot_id, status } = data;
    latestBotStatus[bot_id] = status.code;

    console.log(`Bot ${bot_id} status changed to ${status.code}`);

    // Here you could trigger server-side events, update a database, etc.
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const botId = searchParams.get('botId');

  if (!botId) {
    return NextResponse.json({ success: false, message: 'Missing botId' }, { status: 400 });
  }

  return NextResponse.json({ success: true, status: latestBotStatus[botId] || 'unknown' });
}
This updated code includes the following changes:

We've added webhook verification using the Svix library, which is what Recall.ai uses for sending webhooks. 1

The POST function now verifies the incoming webhook before processing it. If the verification fails, it returns a 400 status code.

After verification, we process the webhook payload. We're still updating the latestBotStatus object with the new status code for the bot. 2

The GET function remains unchanged, allowing you to retrieve the latest status for a specific bot.

Remember to replace the secret variable with the actual signing secret provided by Recall.ai when you set up your webhook in their dashboard. 1

To set up the webhook in Recall.ai:

Go to the Recall dashboard and navigate to the "Webhooks" tab.
Click "Add Endpoint" and enter the URL of your NextJS API route (e.g., https://your-app.com/api/webhook).
Save the signing secret provided by Recall.ai and use it in your code.
This setup will allow your NextJS 14 application with the App Router to securely receive and process webhook events from Recall.ai, including bot status changes. It maintains the functionality to store and retrieve the latest status for each bot, while adding the necessary security measures to verify incoming webhooks.


WEBHOOK STATUS:
When using webhooks with Next.js and TypeScript to determine if the bot is done and the analyze_media is complete, you'll need to set up an endpoint to receive webhook events from Recall.ai. Here's a general approach:

Set up a webhook endpoint in your Next.js application to receive events from Recall.ai.

Listen for the done status event to know when the bot has completed its task 1.

After receiving the done event, you can initiate the Analyze Bot Media process 2.

Then, wait for the analysis_done event, which indicates that the asynchronous intelligence job (like transcription) has been completed 1.

Here's a basic example of how you might set up a webhook endpoint in Next.js:

typescript
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const webhookData = req.body

    if (webhookData.event === 'bot.status_change') {
      if (webhookData.data.status.code === 'done') {
        // Bot is done, you can now initiate Analyze Bot Media
        // Call your function to initiate Analyze Bot Media here
      } else if (webhookData.data.status.code === 'analysis_done') {
        // Analysis is complete, you can now retrieve the transcript
        // Call your function to retrieve the transcript here
      }
    }

    res.status(200).json({ received: true })
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
This example sets up a basic webhook handler that checks for the bot.status_change event and looks for the done and analysis_done status codes. You would need to implement the actual logic for initiating the Analyze Bot Media process and retrieving the transcript.

Remember to set up proper error handling and verification for your webhook endpoint. Also, ensure that your webhook URL is correctly configured in the Recall.ai dashboard 3.


ENABLING ZOOM OAUTH WITH RECALL:
To integrate Zoom OAuth into your current system using Next.js 14, TypeScript, and Supabase, you'll need to make some additions to your database schema and create some new components and API routes. Let's go through this step-by-step:

1. Update the Database Schema:
First, we need to add a table to store Zoom OAuth credentials:



```sql
-- Create Zoom OAuth Credentials table
CREATE TABLE zoom_oauth_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  recall_credential_id UUID NOT NULL,
  zoom_account_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE zoom_oauth_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage their own Zoom OAuth credentials" ON zoom_oauth_credentials
  FOR ALL USING (auth.uid() = (SELECT auth_id FROM users WHERE id = zoom_oauth_credentials.user_id));

```

2. Create Zoom OAuth Flow Components:
Next, let's create React components to handle the Zoom OAuth flow:



```tsx
import React from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

export function ZoomConnectButton() {
  const router = useRouter()

  const handleConnect = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please sign in first')
      return
    }

    const redirectUri = `${window.location.origin}/api/zoom-oauth-callback`
    const zoomAppClientId = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID
    const authUrl = generateAuthUrl(redirectUri, zoomAppClientId)
    
    router.push(authUrl)
  }

  return (
    <button onClick={handleConnect}>Connect Zoom</button>
  )
}

function generateAuthUrl(redirectUri: string, zoomAppClientId: string): string {
  const baseUrl = "https://zoom.us/oauth/authorize"
  const queryParams = {
    "response_type": "code",
    "redirect_uri": redirectUri,
    "client_id": zoomAppClientId,
  }
  const queryString = new URLSearchParams(queryParams).toString()
  return `${baseUrl}?${queryString}`
}

```

3. Create API Routes:
Now, let's create API routes to handle the OAuth callback and create Zoom OAuth credentials:



```typescript
// pages/api/zoom-oauth-callback.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid OAuth code' })
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Call Recall API to create Zoom OAuth Credential
    const recallResponse = await fetch('https://us-east-1.recall.ai/api/v2/zoom-oauth-credentials/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RECALL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oauth_app: process.env.RECALL_ZOOM_OAUTH_APP_ID,
        authorization_code: {
          code: code,
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/zoom-oauth-callback`,
        },
      }),
    })

    if (!recallResponse.ok) {
      const errorData = await recallResponse.json()
      if (errorData.conflicting_zoom_account_id) {
        // Handle re-authorization
        // Delete existing credentials and try again
        // This is a simplified example and should be expanded in a real application
        return res.status(400).json({ error: 'Zoom account already connected. Please disconnect and try again.' })
      }
      throw new Error('Failed to create Zoom OAuth Credential')
    }

    const recallData = await recallResponse.json()

    // Store the credential in your database
    const { data, error } = await supabase
      .from('zoom_oauth_credentials')
      .insert({
        user_id: session.user.id,
        recall_credential_id: recallData.id,
        zoom_account_id: recallData.account_id,
      })

    if (error) throw error

    res.redirect('/dashboard?zoom_connected=true')
  } catch (error) {
    console.error('Error in Zoom OAuth callback:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

```

4. Update your environment variables:
Make sure to add the following environment variables:

```
NEXT_PUBLIC_ZOOM_CLIENT_ID=your_zoom_client_id
RECALL_API_KEY=your_recall_api_key
RECALL_ZOOM_OAUTH_APP_ID=your_recall_zoom_oauth_app_id
NEXT_PUBLIC_BASE_URL=your_app_base_url
```

5. Integrate into your application:
You can now use the `ZoomConnectButton` component in your application where you want users to connect their Zoom account. For example, in a settings or integration page:

```tsx
import { ZoomConnectButton } from '@/components/ZoomOAuth'

export default function IntegrationsPage() {
  return (
    <div>
      <h1>Integrations</h1>
      <ZoomConnectButton />
    </div>
  )
}
```

This setup allows your users to connect their Zoom account, which will enable the Recall-managed bot to join and record meetings automatically. The Zoom OAuth credentials are stored securely in your Supabase database, linked to the user's account.

Remember to handle error cases, such as when a user revokes access or when the OAuth token needs to be refreshed. You may need to implement additional endpoints and logic to handle these scenarios.

Also, ensure that your application complies with Zoom's terms of service and any applicable data protection regulations when implementing automatic recording features.
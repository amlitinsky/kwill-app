
interface CalendlyTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number
  created_at: number;
}

interface CalendlyUserInfo {
  uri: string;
  email: string;
  name: string;
  scheduling_url: string;
  timezone: string;
  current_organization: string;
}

// Generate the Calendly OAuth URL for user authorization
export function getCalendlyAuthUrl(source?: string) {
  const clientId = process.env.NEXT_PUBLIC_CALENDLY_API_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/calendly-oauth-callback`;
  
  const params = new URLSearchParams({
    client_id: clientId!,
    response_type: 'code',
    redirect_uri: redirectUri,
    ...(source && { state: source })
  });

  return `https://auth.calendly.com/oauth/authorize?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function getCalendlyTokens(code: string): Promise<CalendlyTokens> {
  const response = await fetch('https://auth.calendly.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.NEXT_PUBLIC_CALENDLY_API_CLIENT_ID!,
      client_secret: process.env.CALENDLY_API_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calendly-oauth-callback`
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get Calendly tokens');
  }

  const tokens = await response.json();
  return {
    ...tokens,
    expiry_date: Date.now() + (tokens.expires_in * 1000) // Convert seconds to milliseconds

  };
}

// Refresh access token using refresh token
export async function refreshCalendlyToken(refreshToken: string): Promise<CalendlyTokens> {
  const response = await fetch('https://auth.calendly.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.NEXT_PUBLIC_CALENDLY_API_CLIENT_ID!,
      client_secret: process.env.CALENDLY_API_CLIENT_SECRET!
    })
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Calendly token');
  }

  const tokens = await response.json();
  return {
    ...tokens,
    expiry_date: Date.now() + (tokens.expires_in * 1000)
  };
}

// Check if token is valid
export async function checkCalendlyTokenValidity(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
}

// Get Calendly user information
export async function getCalendlyUserInfo(accessToken: string): Promise<CalendlyUserInfo> {
  const response = await fetch('https://api.calendly.com/users/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Calendly user info');
  }

  const data = await response.json();
  return data.resource;
}

// Get user's event types
export async function getCalendlyEventTypes(accessToken: string) {
  const response = await fetch('https://api.calendly.com/event_types?user=me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Calendly event types');
  }

  const data = await response.json();
  return data.collection;
}

export async function updateEventTypeQuestions(accessToken: string, eventTypeUri: string) {
  return fetch(`https://api.calendly.com/event_types/${eventTypeUri}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      custom_questions: [
        {
          name: 'Would you like to use the Kwill Assistant for this meeting?',
          type: 'radio',
          required: true,
          position: 0,
          answer_choices: ['Yes', 'No']
        },
        {
          name: 'Spreadsheet URL (Required for Kwill Assistant)',
          type: 'text',
          required: true,
          position: 1,
          include_if_answer_equals: {
            question: 'Would you like to use the Kwill Assistant for this meeting?',
            answer: 'Yes'
          }
        },
        {
          name: 'Custom prompt for Kwill Assistant',
          type: 'text',
          required: false,
          position: 2,
          include_if_answer_equals: {
            question: 'Would you like to use the Kwill Assistant for this meeting?',
            answer: 'Yes'
          }
        }
      ]
    })
  });
}

export async function subscribeToCalendlyWebhooks(accessToken: string, userUri: string, organization: string) {
  console.log("url: ", `${process.env.NEXT_PUBLIC_BASE_URL}/api/calendly-webhook`)
  const response = await fetch('https://api.calendly.com/webhook_subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calendly-webhook`,
      events: [
        'invitee.created',
      ],
      user: userUri,
      organization: organization,
      scope: 'user'
    })
  });

  //   signing_key: process.env.CALENDLY_WEBHOOK_SECRET,
  // TODOFUTURE user scope for now
  // 'meeting.started',
  // 'event_type.created'
  return response.json();
}
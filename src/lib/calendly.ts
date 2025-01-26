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
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback/calendly`;
  
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
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback/calendly`
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
// TODO  have to test this and confirm with docs
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
export async function getCalendlyEventTypes(accessToken: string, userUri: string) {
  const response = await fetch(`https://api.calendly.com/event_types?user=${userUri}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw data;
  }

  return data.collection;
}

export async function subscribeToCalendlyWebhooks(accessToken: string, userUri: string, organization: string) {
  const response = await fetch('https://api.calendly.com/webhook_subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: `${process.env.NEXT_PUBLIC_NGROK_URL}/api/webhook/calendly`,
      events: ['invitee.created', 'invitee.canceled'],
      user: userUri,
      organization: organization,
      scope: 'user',
      signing_key: process.env.CALENDLY_WEBHOOK_SECRET
    })
  });

  const result = await response.json();
  return result;
}

export async function getEventTypeDetails(accessToken: string, eventTypeUri: string) {
    const response = await fetch(`${eventTypeUri}`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${accessToken}`
    }
    });

    if (!response.ok) {
    throw new Error('Failed to fetch event type details');
    }

    return response.json();
}
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_API_CLIENT_ID,
  process.env.GOOGLE_API_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/google-oauth-callback`
);

// Generates the Google OAuth URL for user authorization
export function getGoogleAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// Exchanges the authorization code for tokens
export async function getGoogleTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Appends a new row to a Google Spreadsheet
export async function appendToGoogleSheet(spreadsheetId: string, range: string, values: string[][], accessToken: string) {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    return response.data;
  } catch (error) {
    console.error('Error appending to Google Sheet:', error);
    throw error;
  }
}

export async function validateSpreadsheet(spreadsheetId: string, accessToken: string) {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    await sheets.spreadsheets.get({ spreadsheetId });
    return true;
  } catch (error) {
    console.error('Error validating spreadsheet:', error);
    throw new Error('Invalid or inaccessible spreadsheet');
  }
}

export async function refreshAccessToken(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}
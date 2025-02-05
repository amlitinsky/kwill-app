import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server')
}

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_API_CLIENT_ID,
  process.env.GOOGLE_API_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback/google`
);

// Generates the Google OAuth URL for user authorization

export function getGoogleAuthUrl(state: string) {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets'],
    prompt: 'consent',
    state: state
  });
}


// TODO maybe include state validation in the future

// Exchanges the authorization code for tokens
export async function getGoogleTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Appends a new row to a Google Spreadsheet
export async function findNextEmptyRow(accessToken: string, spreadsheetId: string, sheetName: string): Promise<number> {

  oauth2Client.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  if (!sheetName) {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    sheetName = spreadsheet.data.sheets?.[0].properties?.title || 'Sheet1';
  }

  const range = `${sheetName}!A:A`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const values = response.data.values;
  if (!values || values.length === 0) {
    return 1;
  }
  return values.length + 1;
}

export async function mapHeadersAndAppendData(
  spreadsheetId: string, 
  sheetName: string | null, 
  dataDict: Record<string, string>, 
  accessToken: string,
  rowNumber?: number,
  overWrite?: boolean // Optional row number for overwriting
) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  // If no sheet name is provided, get the first sheet's name
  if (!sheetName) {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    sheetName = spreadsheet.data.sheets?.[0].properties?.title || 'Sheet1';
  }

  // Get headers using the getColumnHeaders function
  const headers = await getColumnHeaders(accessToken, spreadsheetId);

  if (headers.length === 0) {
    throw new Error('No headers found in the spreadsheet');
  }

  const rowData = headers.map(header => dataDict[header] || null);

  if (overWrite) {
    // Update existing row
    const updateRange = `${sheetName}!A${rowNumber}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });
    return { rowNumber: null };
  } else {
    // Find next empty row and append
    const nextEmptyRow = await findNextEmptyRow(accessToken, spreadsheetId, sheetName);
    const appendRange = `${sheetName}!A${nextEmptyRow}`;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: appendRange,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData],
      },
    });

    return { rowNumber: nextEmptyRow };
  }
}

export async function validateSpreadsheet(spreadsheetId: string, accessToken: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  
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


export async function checkTokenValidity(access_token: string) {
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${access_token}`);
    const data = await response.json();
    return data.error ? true : false;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
}

export async function getColumnHeaders(accessToken: string, spreadsheetId: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetName = spreadsheet.data.sheets?.[0].properties?.title || 'Sheet1';
    const headerRange = `${sheetName}!1:1`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: headerRange,
    });

    return response.data.values?.[0] || [];
  } catch (error) {
    console.error('Error getting column headers:', error);
    throw new Error('Failed to retrieve column headers');
  }
}

export async function getGoogleUserInfo(accessToken: string) {
  try {
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info from Google');
    }

    const googleUserInfo = await userInfoResponse.json();

    return {
      firstName: googleUserInfo.given_name || '',
      lastName: googleUserInfo.family_name || '',
      picture: googleUserInfo.picture || '',
    };
  } catch (error) {
    console.error('Error fetching Google user info:', error);
    throw error;
  }
}
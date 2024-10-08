import {google } from 'googleapis'

export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

// Function to validate spreadsheet and get column headers
export async function validateSpreadsheetAndGetHeaders(spreadsheetId: string) {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // Attempt to read the first row of the first sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A1:ZZ1', // This will get the first row, up to column ZZ
    });

    if (!response.data.values || response.data.values.length === 0) {
      throw new Error('No data found in the spreadsheet');
    }

    // The first (and only) row contains our headers
    const headers = response.data.values[0];

    return headers;
  } catch (error) {
    console.error('Error validating spreadsheet:', error);
    throw new Error('Invalid or inaccessible spreadsheet');
  }
}
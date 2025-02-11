import { google } from 'googleapis';

export function extractSpreadsheetId(url: string): string | null {
  const pattern = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = pattern.exec(url);
  return match?.[1] ?? null;
}

export async function getColumnHeaders(accessToken: string, spreadsheetId: string): Promise<string[]> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const sheets = google.sheets({ 
    version: 'v4', 
    auth: auth // Just pass the access token directly
  });

  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetName = spreadsheet.data.sheets?.[0]?.properties?.title ?? 'Sheet1';
    const headerRange = `${sheetName}!1:1`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: headerRange,
    });

    return (response.data.values?.[0] ?? []) as string[];
  } catch (error) {
    console.error('Error getting column headers:', error);
    throw new Error('Failed to retrieve column headers');
  }
}

export async function appendRowToSheet(
  accessToken: string,
  spreadsheetId: string,
  data: Record<string, string | number | boolean>,
  headers?: string[]
): Promise<number> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const sheets = google.sheets({ 
    version: 'v4', 
    auth: auth
  });

  try {
    // If headers weren't provided, fetch them
    const columnHeaders = headers ?? await getColumnHeaders(accessToken, spreadsheetId);
    
    // Map data to array based on headers
    const rowData = columnHeaders.map(header => {
      const value = data[header];
      // Convert booleans and numbers to strings
      return value?.toString() ?? '';
    });

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetName = spreadsheet.data.sheets?.[0]?.properties?.title ?? 'Sheet1';

    // Find the next empty row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });
    const nextRow = (response.data.values?.length ?? 0) + 1;

    // Append the row
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A${nextRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    return nextRow;
  } catch (error) {
    console.error('Error appending row to sheet:', error);
    throw new Error('Failed to append row to sheet');
  }
}

export async function updateSheetRow(
  accessToken: string,
  spreadsheetId: string,
  rowNumber: number,
  data: Record<string, string | number | boolean>,
  headers?: string[]
): Promise<void> {

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ 
    version: 'v4', 
    auth: auth
  });

  try {
    // If headers weren't provided, fetch them
    const columnHeaders = headers ?? await getColumnHeaders(accessToken, spreadsheetId);
    
    // Map data to array based on headers
    const rowData = columnHeaders.map(header => {
      const value = data[header];
      // Convert booleans and numbers to strings
      return value?.toString() ?? '';
    });

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetName = spreadsheet.data.sheets?.[0]?.properties?.title ?? 'Sheet1';

    // Update the row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });
  } catch (error) {
    console.error('Error updating sheet row:', error);
    throw new Error('Failed to update sheet row');
  }
} 
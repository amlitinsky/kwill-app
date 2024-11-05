import { NextResponse } from 'next/server';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate, getGoogleCreds } from '@/lib/supabase-server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { processRawTranscript } from '@/lib/transcript-utils';
import { processTranscriptWithClaude } from '@/lib/anthropic';
import { getColumnHeaders, mapHeadersAndAppendData } from '@/lib/google-auth';

export async function GET() {
  const supabase =  await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const templates = await fetchTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase =  await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, spreadsheetId, customInstructions, transcript } = await request.json();
    const newTemplate = await createTemplate(name, spreadsheetId, customInstructions, transcript);

    // Get Google credentials
    const google_creds = await getGoogleCreds(user.id);

    const headers = await getColumnHeaders(google_creds.access_token, spreadsheetId)

    const processedTranscript = processRawTranscript([{
      speaker: "Sample Speaker", 
      words: [{text: transcript as string}]
    }]);
    const processed_data = await processTranscriptWithClaude(
      processedTranscript,
      headers,
      customInstructions
    );

    // Append to Google Sheets
    await mapHeadersAndAppendData(
      spreadsheetId,
      "",
      processed_data,
      google_creds.access_token
    );
    return NextResponse.json(newTemplate);
  } catch (error) {
    console.error('Error in template creation:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase =  await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, name, spreadsheetLink, customInstructions } = await request.json();
    const updatedTemplate = await updateTemplate(id, name, spreadsheetLink, customInstructions);
    return NextResponse.json(updatedTemplate);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase =  await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    await deleteTemplate(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
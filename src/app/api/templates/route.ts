import { NextResponse } from 'next/server';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/lib/supabase-server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getColumnHeaders } from '@/lib/google-auth';
import { getValidGoogleToken } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache'

interface Template {
  id: string;
  name: string;
  spreadsheet_id: string;
  prompt: string | null;
  meeting_link: string | null;
  column_headers: string[] | null;
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await fetchTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, spreadsheetId, prompt, meetingLink } = await request.json();

    if (!name || !spreadsheetId) {
      return NextResponse.json(
        { error: 'Name and spreadsheet ID are required' }, 
        { status: 400 }
      );
    }

    const accessToken = await getValidGoogleToken(user.id);
    const columnHeaders = await getColumnHeaders(accessToken, spreadsheetId);
    
    const template = await createTemplate(
      name, 
      spreadsheetId, 
      prompt || null, 
      meetingLink || null, 
      columnHeaders
    );

    revalidatePath('/templates');
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, spreadsheetId, prompt, meetingLink } = await request.json();

    if (!id || !name || !spreadsheetId) {
      return NextResponse.json(
        { error: 'ID, name, and spreadsheet ID are required' }, 
        { status: 400 }
      );
    }

    const template = await updateTemplate(
      id, 
      name, 
      spreadsheetId, 
      prompt || null, 
      meetingLink || null
    );

    revalidatePath('/templates');
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' }, 
        { status: 400 }
      );
    }

    await deleteTemplate(id);
    revalidatePath('/templates');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    );
  }
}
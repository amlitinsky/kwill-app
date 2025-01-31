import { NextResponse } from 'next/server';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/lib/supabase-server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

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
    const { name, spreadsheetId, prompt, transcript } = await request.json();
    const newTemplate = await createTemplate(name, spreadsheetId, prompt, transcript);

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
    const { id, name, spreadsheetLink, prompt } = await request.json();
    const updatedTemplate = await updateTemplate(id, name, spreadsheetLink, prompt);
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
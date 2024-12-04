import { NextResponse } from 'next/server';
import { createCalendlyMeeting } from '@/lib/supabase-server';
import { extractSpreadsheetId } from '@/lib/google-auth';

export async function POST(request: Request) {
  const payload = await request.json();

  try {
    switch (payload.event) {
      case 'invitee.created': {
        const eventData = payload.payload;
        const zoomData = eventData.location;
        
        const questions = eventData.questions_and_answers;
        const useKwill = questions.find(
          (qa: { question: string; }) => 
            qa.question === 'Would you like to use the Kwill Assistant for this meeting?'
        )?.answer === 'Yes';


        if (useKwill) {
          const spreadsheet_url = questions.find((qa: { question: string; }) => qa.question === 'Spreadsheet URL (Required for Kwill Assistant)')?.answer

          const spreadsheetId = extractSpreadsheetId(spreadsheet_url)
          // dealing with that null case for whatever reason but can be fixed fyi (rn its kinda poor practice)

          await createCalendlyMeeting(
            eventData.user_id,
            eventData.event.name,
            zoomData.join_url,
            spreadsheetId!,
            questions.find((qa: { question: string; }) => qa.question === 'Custom prompt for Kwill Assistant')?.answer,
            eventData.event.uuid
          );
        }
        break;
      }
      case 'invitee.cancelled': {

      }

    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
OBJECTIVES OF THE BACKEND:
- On the platform, the user should be able to upload a zoom link and a spreadsheet link and column headers and a custom promopt (all this is a row in a Meeting Table)
- Create a recall AI bot that can transcribe a zoom meeting 
- Once the meeting has concluded, the bot uploads the transcript to the backend which should be stored in another table
- After having the transcript, we inject it into an LLM prompt (perhaps custom) that produces a hashmap of column headers to values
- After we've obtained the dictionary of the column headers mapped to the values, we use the Google Sheets API and upload those values into the shared spreadsheet that the user originally provided
- The user should be able to view the transcript, modify it accordingly, and resend it to the backend and add it to the google sheet 
- The user should be able to view the history of all the meetings they've conducted and view the transcripts, and be able to resend the new transcript or column headers to the backend and add it to the google sheet 
- The user should also be able to select a payment plan (free, pro, enterprise) via the Stripe API and have the ability to change their plan


APIs USED:
- Zoom API (Zoom Meetings)
- Recall API (Transcribe Zoom Meetings)
- Gladia API ( Speech Processing)
- Google API (Google Sheets)
- Claude API (LLM)
- Stripe API (payment processing)
- NextJS (Framework)
- Supabase API (Database)


UPDATES:
09/11/2024:
- Set up routes for Recall API and tested out transcription

CONCERNS:
- We also need to figure out how to configure Zoom Oauth so that the bot can automatically start recordings
- We also need to figure out setting up Google Auth for Supabase


TODOS:
- Set up routes for Supabase API (top priority)
- Set up routes for Google API and Sheets API
- Set up routes for Stripe API
- Set up routes for Claude API



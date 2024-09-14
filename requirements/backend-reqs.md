OBJECTIVES OF THE BACKEND:
- On the platform, the user should be able to upload a zoom link and a spreadsheet link and column headers and a custom prompt (all this is a row in a Meeting Table)
- Create a recall AI bot that can transcribe a zoom meeting 
- Once the meeting has concluded, the bot uploads the transcript to the backend which should be stored in another table
- After having the transcript, we inject it into an LLM prompt (perhaps custom) that produces a hashmap of column headers to values
- After we've obtained the dictionary of the column headers mapped to the values, we use the Google Sheets API and upload those values into the shared spreadsheet that the user originally provided
- The user should be able to view the transcript, modify it accordingly, and resend it to the backend and add it to the google sheet 
- The user should be able to view the history of all the meetings they've conducted and view the transcripts, and be able to resend the new transcript or column headers to the backend and add it to the google sheet 
- The user should also be able to select a payment plan (free, pro, enterprise) via the Stripe API and have the ability to change their plan
- The user should be able to select a payment plan (free, pro, enterprise) via the Stripe API and have the ability to change their plan
- The Stripe API should handle the billing and subscription management for each month
- The user and meeting tables should be connected via a foreign key relationship
- The user should also be able to modify the column headers of a meeting (after the meeting has ended and we have a transcript if the user want's to process new column headers)
- The user has to either upload a transcript or a zoom link (for the recall bot to process)
- there obviouisly should be some sort of uuid to identify each meeting and user
<!-- - The user should have an option to either to use a zoom link or upload a recording of the meeting  -->


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

TABLES:

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

USER TABLE:
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  payment_plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

MEETING TABLE:
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  zoom_link TEXT,
  spreadsheet_link TEXT NOT NULL,
  column_headers text[],
  custom_prompt TEXT,
  status TEXT DEFAULT 'pending',
  transcript TEXT,
  processed_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ZOOM OAUTH CREDENTIALS TABLE:
    CREATE TABLE zoom_oauth_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    recall_credential_id TEXT NOT NULL, -- Changed from UUID to TEXT
    zoom_account_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

POLICIES AND SECURITIES:
-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoom_oauth_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view and update their own data" ON users
  FOR ALL USING (auth_id = auth.uid());

CREATE POLICY "Users can manage their own meetings" ON meetings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own Zoom OAuth credentials" ON zoom_oauth_credentials
  FOR ALL USING (user_id = auth.uid());
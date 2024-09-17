SUMMARY OF BACKEND PRODUCT EXPERIENCE:
- User creates a new query
- User is asked to upload a valid shareable google spreadsheets link, we validate on our end if it's shareable (we collect all the column headers on our end)
- User is then asked whether they want to upload a prexisting transcript (for demo) or a zoom link
- User is then asked for custom instructions, people they want to omit (like themselves) or specific fields
- We finally hit submit, where our bot (using Recall.ai) is created and joins the zoom call (fallback, what should we do if the zoom call is back)
- Zoom calls occurs, bot creates data, as soon as we have a webhook (also from recall.ai) saying that the meeting is over, we analyze bot media, once the bot has analyed media we store the transcript
- Using an LLM API and the custom instructions, and column headers, we inject it all into an LLM prompt, then, the LLM prompt processes the information
- The LLM produces a dictionary or JSON file that maps columns headers to the new values
- As soon as we acquire this JSONB file of the appropiate column headers to values, we append those values to the next avalable row in that google spreadsheets link
- all of the above is good enough for our MVP

OTHER USEFUL PRODUCT EXPERIENCE:
- User should see all of the meetings they have conducted


STRIPE PAYMENT EXPERIENCE:
- The Stripe API should handle the billing and subscription management for each month
- The user should also be able to select a payment plan (free, pro, enterprise) via the Stripe API and have the ability to change their plan
- The user should be able to select a payment plan (free, pro, enterprise) via the Stripe API and have the ability to change their plan

FUTURES:
- Templates? Instead of reusing same spreadsheet link and and instructions, we just reuse one of the templates
-  Be able to click previous meetings, modify the produced transcript and reupload it to google sheets
- Store the next available row of that company and maybe specify if we want to use new row or that row for that company


APIs USED:
- Zoom API (Zoom Meetings)
- Recall API (Transcribe Zoom Meetings)
- Gladia API (Speech Processing)
- Google API (Google Sheets)
- Claude API (LLM)
- Stripe API (payment processing)
- NextJS (Framework)
- Supabase API (BaaS)



CONCERNS:
- We also need to figure out how to configure Zoom Oauth so that the bot can automatically start recordings
- We also need to figure out setting up Google Auth for Supabase


TODOS (in order):
- Set up routes for Supabase API (top priority)
- Set up routes for Claude API
- Set up routes for Google API and Sheets API
- Set up routes for Stripe API

TABLES FOR BACKEND:

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
  spreadsheet_id TEXT NOT NULL,
  column_headers text[],
  custom_instructions TEXT,
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

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    spreadsheet_id TEXT NOT NULL,
    column_headers TEXT[],
    custom_instructions TEXT,
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
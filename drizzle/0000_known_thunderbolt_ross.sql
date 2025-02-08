CREATE TABLE IF NOT EXISTS "kwill-app_chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"meeting_id" integer,
	"role" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kwill-app_meetings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"spreadsheet_id" integer,
	"bot_id" varchar(255),
	"llm_extracted_data" jsonb,
	"processing_status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kwill-app_spreadsheets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"google_sheet_id" varchar(255) NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kwill-app_chat_messages" ADD CONSTRAINT "kwill-app_chat_messages_meeting_id_kwill-app_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."kwill-app_meetings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kwill-app_meetings" ADD CONSTRAINT "kwill-app_meetings_spreadsheet_id_kwill-app_spreadsheets_id_fk" FOREIGN KEY ("spreadsheet_id") REFERENCES "public"."kwill-app_spreadsheets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

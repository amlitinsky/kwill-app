ALTER TABLE "kwill-app_spreadsheets" RENAME TO "kwill-app_conversations";--> statement-breakpoint
ALTER TABLE "kwill-app_chat_messages" RENAME COLUMN "meeting_id" TO "conversation_id";--> statement-breakpoint
ALTER TABLE "kwill-app_meetings" RENAME COLUMN "spreadsheet_id" TO "conversation_id";--> statement-breakpoint
ALTER TABLE "kwill-app_chat_messages" DROP CONSTRAINT "kwill-app_chat_messages_meeting_id_kwill-app_meetings_id_fk";
--> statement-breakpoint
ALTER TABLE "kwill-app_meetings" DROP CONSTRAINT "kwill-app_meetings_spreadsheet_id_kwill-app_spreadsheets_id_fk";
--> statement-breakpoint
ALTER TABLE "kwill-app_chat_messages" ALTER COLUMN "conversation_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "kwill-app_meetings" ALTER COLUMN "conversation_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "kwill-app_conversations" ALTER COLUMN "google_sheet_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "kwill-app_chat_messages" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "kwill-app_meetings" ADD COLUMN "zoom_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "kwill-app_conversations" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kwill-app_chat_messages" ADD CONSTRAINT "kwill-app_chat_messages_conversation_id_kwill-app_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."kwill-app_conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kwill-app_meetings" ADD CONSTRAINT "kwill-app_meetings_conversation_id_kwill-app_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."kwill-app_conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

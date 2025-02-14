ALTER TABLE "kwill-app_conversations" ADD COLUMN "analysis_prompt" text;--> statement-breakpoint
ALTER TABLE "kwill-app_meetings" DROP COLUMN IF EXISTS "zoom_url";
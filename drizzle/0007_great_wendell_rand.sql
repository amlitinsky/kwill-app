ALTER TABLE "kwill-app_chats" ALTER COLUMN "google_sheet_id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "kwill-app_meetings" ALTER COLUMN "id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "kwill-app_meetings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
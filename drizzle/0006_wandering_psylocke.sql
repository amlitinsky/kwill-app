ALTER TABLE "kwill-app_chats" ALTER COLUMN "id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "kwill-app_chats" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "kwill-app_meetings" ALTER COLUMN "chat_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "kwill-app_messages" ALTER COLUMN "chat_id" SET DATA TYPE varchar(36);

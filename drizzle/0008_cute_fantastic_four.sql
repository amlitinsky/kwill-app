ALTER TABLE "kwill-app_meetings" DROP CONSTRAINT "kwill-app_meetings_chat_id_kwill-app_chats_id_fk";
--> statement-breakpoint
ALTER TABLE "kwill-app_messages" DROP CONSTRAINT "kwill-app_messages_chat_id_kwill-app_chats_id_fk";
--> statement-breakpoint
ALTER TABLE "kwill-app_meetings" ALTER COLUMN "chat_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "kwill-app_messages" ALTER COLUMN "chat_id" DROP NOT NULL;
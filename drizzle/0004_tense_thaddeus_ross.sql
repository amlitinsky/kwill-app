ALTER TABLE "kwill-app_conversations" RENAME TO "kwill-app_chats";--> statement-breakpoint
ALTER TABLE "kwill-app_chat_messages" RENAME TO "kwill-app_messages";--> statement-breakpoint
ALTER TABLE "kwill-app_messages" RENAME COLUMN "conversation_id" TO "chat_id";--> statement-breakpoint
ALTER TABLE "kwill-app_meetings" RENAME COLUMN "conversation_id" TO "chat_id";--> statement-breakpoint
ALTER TABLE "kwill-app_messages" DROP CONSTRAINT "kwill-app_chat_messages_conversation_id_kwill-app_conversations_id_fk";
--> statement-breakpoint
ALTER TABLE "kwill-app_meetings" DROP CONSTRAINT "kwill-app_meetings_conversation_id_kwill-app_conversations_id_fk";
--> statement-breakpoint
ALTER TABLE "kwill-app_messages" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "kwill-app_messages" ALTER COLUMN "role" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "kwill-app_messages" ALTER COLUMN "metadata" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "kwill-app_messages" ALTER COLUMN "metadata" SET DEFAULT '{}'::json;--> statement-breakpoint
ALTER TABLE "kwill-app_messages" ADD COLUMN "parts" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "kwill-app_messages" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kwill-app_messages" ADD CONSTRAINT "kwill-app_messages_chat_id_kwill-app_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."kwill-app_chats"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kwill-app_meetings" ADD CONSTRAINT "kwill-app_meetings_chat_id_kwill-app_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."kwill-app_chats"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

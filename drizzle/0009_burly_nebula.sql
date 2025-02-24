ALTER TABLE "kwill-app_meetings" ALTER COLUMN "chat_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "kwill-app_messages" ALTER COLUMN "chat_id" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kwill-app_meetings" ADD CONSTRAINT "kwill-app_meetings_chat_id_kwill-app_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."kwill-app_chats"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kwill-app_messages" ADD CONSTRAINT "kwill-app_messages_chat_id_kwill-app_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."kwill-app_chats"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

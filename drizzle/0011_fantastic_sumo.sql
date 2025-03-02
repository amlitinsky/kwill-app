ALTER TABLE "kwill-app_subscriptions" RENAME COLUMN "hours" TO "minutes";--> statement-breakpoint
ALTER TABLE "kwill-app_subscriptions" ALTER COLUMN "minutes" SET DEFAULT 120;
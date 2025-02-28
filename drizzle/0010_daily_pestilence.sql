CREATE TABLE IF NOT EXISTS "kwill-app_subscriptions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"status" varchar(50) DEFAULT 'none' NOT NULL,
	"price_id" varchar(255),
	"hours" integer DEFAULT 2 NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"payment_method" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kwill-app_subscriptions_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "kwill-app_subscriptions_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "kwill-app_subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);

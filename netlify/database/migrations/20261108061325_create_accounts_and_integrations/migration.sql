CREATE TABLE "ai_usage" (
	"user_id" text,
	"day" text,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "ai_usage_pkey" PRIMARY KEY("user_id","day")
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"user_id" text,
	"gig_id" text,
	"gig" jsonb NOT NULL,
	CONSTRAINT "bookmarks_pkey" PRIMARY KEY("user_id","gig_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY,
	"name" text DEFAULT '' NOT NULL,
	"role_title" text DEFAULT '' NOT NULL,
	"portfolio_url" text DEFAULT '' NOT NULL,
	"trial_ends_at" timestamp with time zone,
	"stripe_customer_id" text UNIQUE,
	"stripe_subscription_id" text UNIQUE
);
--> statement-breakpoint
CREATE TABLE "service_state" (
	"key" text PRIMARY KEY,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_deliveries" (
	"user_id" text,
	"gig_id" text,
	CONSTRAINT "telegram_deliveries_pkey" PRIMARY KEY("user_id","gig_id")
);
--> statement-breakpoint
CREATE TABLE "telegram_links" (
	"user_id" text PRIMARY KEY,
	"token_hash" text UNIQUE,
	"token_expires_at" timestamp with time zone,
	"chat_id" text UNIQUE,
	"category" text DEFAULT 'all' NOT NULL,
	"min_budget" integer DEFAULT 0 NOT NULL,
	"linked_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "telegram_deliveries" ADD CONSTRAINT "telegram_deliveries_user_id_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "telegram_links" ADD CONSTRAINT "telegram_links_user_id_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE;
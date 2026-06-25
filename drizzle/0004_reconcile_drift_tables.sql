CREATE TYPE "public"."lead_event_type" AS ENUM('email_opened', 'email_clicked', 'calendar_viewed', 'calendar_booked', 'page_visited', 'funnel_revisited');--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"team_id" uuid,
	"name" text NOT NULL,
	"key_prefix" text NOT NULL,
	"key_hash" text NOT NULL,
	"scopes" jsonb DEFAULT '["read","write"]'::jsonb NOT NULL,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "funnel_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"funnel_id" uuid NOT NULL,
	"config_hash" text NOT NULL,
	"time_range" text NOT NULL,
	"payload" jsonb NOT NULL,
	"inputs_snapshot" jsonb NOT NULL,
	"model" text NOT NULL,
	"prompt_tokens" integer NOT NULL,
	"completion_tokens" integer NOT NULL,
	"cost_usd_millicents" integer,
	"generation_ms" integer NOT NULL,
	"session_count_at_generation" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ghl_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"team_id" uuid,
	"location_id" text NOT NULL,
	"company_id" text,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"token_expires_at" timestamp NOT NULL,
	"scopes" text,
	"connected_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ghl_connections_location_id_unique" UNIQUE("location_id")
);
--> statement-breakpoint
CREATE TABLE "lead_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"funnel_id" uuid,
	"event_type" "lead_event_type" NOT NULL,
	"metadata" jsonb,
	"occurred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shopify_installations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"team_id" uuid,
	"shop_domain" text NOT NULL,
	"access_token" text NOT NULL,
	"scopes" text NOT NULL,
	"installed_at" timestamp DEFAULT now() NOT NULL,
	"uninstalled_at" timestamp,
	CONSTRAINT "shopify_installations_shop_domain_unique" UNIQUE("shop_domain")
);
--> statement-breakpoint
ALTER TABLE "funnel_sessions" ADD COLUMN "booking_confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "funnels" ADD COLUMN "team_id" uuid;--> statement-breakpoint
ALTER TABLE "funnels" ADD COLUMN "client_id" uuid;--> statement-breakpoint
ALTER TABLE "funnels" ADD COLUMN "creation_source" text;--> statement-breakpoint
ALTER TABLE "popup_campaigns" ADD COLUMN "team_id" uuid;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "plan" "plan" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "branding" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "custom_dashboard_domain" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "had_trial" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "trial_ends_at" timestamp;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funnel_insights" ADD CONSTRAINT "funnel_insights_funnel_id_funnels_id_fk" FOREIGN KEY ("funnel_id") REFERENCES "public"."funnels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ghl_connections" ADD CONSTRAINT "ghl_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ghl_connections" ADD CONSTRAINT "ghl_connections_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_funnel_id_funnels_id_fk" FOREIGN KEY ("funnel_id") REFERENCES "public"."funnels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopify_installations" ADD CONSTRAINT "shopify_installations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopify_installations" ADD CONSTRAINT "shopify_installations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_keys_user_id_idx" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_keys_key_hash_idx" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "audit_logs_team_id_idx" ON "audit_logs" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "audit_logs_team_id_created_at_idx" ON "audit_logs" USING btree ("team_id","created_at");--> statement-breakpoint
CREATE INDEX "clients_team_id_idx" ON "clients" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "clients_email_idx" ON "clients" USING btree ("email");--> statement-breakpoint
CREATE INDEX "funnel_insights_funnel_id_idx" ON "funnel_insights" USING btree ("funnel_id");--> statement-breakpoint
CREATE INDEX "funnel_insights_funnel_id_expires_at_idx" ON "funnel_insights" USING btree ("funnel_id","expires_at");--> statement-breakpoint
CREATE INDEX "ghl_connections_user_id_idx" ON "ghl_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ghl_connections_location_id_idx" ON "ghl_connections" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "lead_events_lead_id_idx" ON "lead_events" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_events_funnel_id_event_type_idx" ON "lead_events" USING btree ("funnel_id","event_type");--> statement-breakpoint
CREATE INDEX "lead_events_occurred_at_idx" ON "lead_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "shopify_installations_user_id_idx" ON "shopify_installations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "shopify_installations_shop_domain_idx" ON "shopify_installations" USING btree ("shop_domain");--> statement-breakpoint
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popup_campaigns" ADD CONSTRAINT "popup_campaigns_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "funnels_team_id_idx" ON "funnels" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "funnels_client_id_idx" ON "funnels" USING btree ("client_id");--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_custom_dashboard_domain_unique" UNIQUE("custom_dashboard_domain");
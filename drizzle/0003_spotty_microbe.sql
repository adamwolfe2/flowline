CREATE TYPE "public"."popup_display_mode" AS ENUM('modal', 'slide_in', 'full_screen');--> statement-breakpoint
CREATE TYPE "public"."popup_impression_action" AS ENUM('triggered', 'shown', 'dismissed', 'engaged', 'converted');--> statement-breakpoint
CREATE TYPE "public"."popup_position" AS ENUM('center', 'bottom_left', 'bottom_right');--> statement-breakpoint
CREATE TYPE "public"."popup_status" AS ENUM('draft', 'active', 'paused');--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'email_captured';--> statement-breakpoint
CREATE TABLE "popup_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"funnel_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"status" "popup_status" DEFAULT 'draft' NOT NULL,
	"display_mode" "popup_display_mode" DEFAULT 'modal' NOT NULL,
	"position" "popup_position" DEFAULT 'center' NOT NULL,
	"triggers" jsonb DEFAULT '{"exitIntent": true, "timeDelay": null, "scrollDepth": null, "idleTime": null}'::jsonb NOT NULL,
	"targeting" jsonb DEFAULT '{"pageUrls": [], "utmSources": [], "deviceTypes": [], "newVisitorsOnly": false}'::jsonb NOT NULL,
	"suppression" jsonb DEFAULT '{"dismissCookieDays": 30, "convertedCookieDays": 365}'::jsonb NOT NULL,
	"style_overrides" jsonb DEFAULT '{"overlayOpacity": 0.5, "borderRadius": 16, "animation": "slide_up", "maxWidth": 480}'::jsonb NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "popup_impressions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"visitor_id" text NOT NULL,
	"action" "popup_impression_action" NOT NULL,
	"trigger_type" text,
	"page_url" text,
	"referrer" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sequence_enrollments" ALTER COLUMN "lead_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "email_sequences" ADD COLUMN "trigger_type" text DEFAULT 'lead_created' NOT NULL;--> statement-breakpoint
ALTER TABLE "funnel_sessions" ADD COLUMN "partial_email" text;--> statement-breakpoint
ALTER TABLE "funnels" ADD COLUMN "share_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "funnels" ADD COLUMN "share_client_email" text;--> statement-breakpoint
ALTER TABLE "funnels" ADD COLUMN "share_daily_digest" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "sequence_enrollments" ADD COLUMN "session_id" uuid;--> statement-breakpoint
ALTER TABLE "sequence_enrollments" ADD COLUMN "recipient_email" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notification_preferences" jsonb DEFAULT '{"leadAlerts": true, "weeklyDigest": true}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "popup_campaigns" ADD CONSTRAINT "popup_campaigns_funnel_id_funnels_id_fk" FOREIGN KEY ("funnel_id") REFERENCES "public"."funnels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popup_campaigns" ADD CONSTRAINT "popup_campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popup_impressions" ADD CONSTRAINT "popup_impressions_campaign_id_popup_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."popup_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "popup_campaigns_user_id_idx" ON "popup_campaigns" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "popup_campaigns_funnel_id_idx" ON "popup_campaigns" USING btree ("funnel_id");--> statement-breakpoint
CREATE INDEX "popup_campaigns_status_idx" ON "popup_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "popup_impressions_campaign_id_idx" ON "popup_impressions" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "popup_impressions_campaign_id_created_at_idx" ON "popup_impressions" USING btree ("campaign_id","created_at");--> statement-breakpoint
ALTER TABLE "sequence_enrollments" ADD CONSTRAINT "sequence_enrollments_session_id_funnel_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."funnel_sessions"("id") ON DELETE cascade ON UPDATE no action;
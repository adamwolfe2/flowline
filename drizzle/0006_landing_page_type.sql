CREATE TYPE "public"."funnel_type" AS ENUM('quiz', 'landing');--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'video_played';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'booking_submitted';--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "score" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "calendar_tier" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "funnels" ADD COLUMN "type" "funnel_type" DEFAULT 'quiz' NOT NULL;
CREATE INDEX "events_funnel_id_idx" ON "events" USING btree ("funnel_id");--> statement-breakpoint
CREATE INDEX "events_session_id_idx" ON "events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "funnel_sessions_funnel_id_idx" ON "funnel_sessions" USING btree ("funnel_id");--> statement-breakpoint
CREATE INDEX "funnel_sessions_funnel_id_started_at_idx" ON "funnel_sessions" USING btree ("funnel_id","started_at");--> statement-breakpoint
CREATE INDEX "funnels_user_id_idx" ON "funnels" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "leads_funnel_id_idx" ON "leads" USING btree ("funnel_id");--> statement-breakpoint
CREATE INDEX "leads_funnel_id_created_at_idx" ON "leads" USING btree ("funnel_id","created_at");--> statement-breakpoint
CREATE INDEX "sequence_enrollments_status_next_send_at_idx" ON "sequence_enrollments" USING btree ("status","next_send_at");--> statement-breakpoint
CREATE INDEX "variant_assignments_variant_id_idx" ON "variant_assignments" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "variant_assignments_funnel_id_idx" ON "variant_assignments" USING btree ("funnel_id");
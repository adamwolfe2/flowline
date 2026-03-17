-- Performance indexes for Qualifi
-- Run in Neon SQL console after db:push

-- Funnels
CREATE INDEX IF NOT EXISTS idx_funnels_user_id ON funnels(user_id);
CREATE INDEX IF NOT EXISTS idx_funnels_slug ON funnels(slug);
CREATE INDEX IF NOT EXISTS idx_funnels_custom_domain ON funnels(custom_domain);

-- Leads
CREATE INDEX IF NOT EXISTS idx_leads_funnel_id ON leads(funnel_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_funnel_created ON leads(funnel_id, created_at DESC);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_funnel_id ON events(funnel_id);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_funnel_type ON events(funnel_id, event_type);
CREATE INDEX IF NOT EXISTS idx_events_funnel_created ON events(funnel_id, created_at DESC);

-- Sessions
CREATE INDEX IF NOT EXISTS idx_sessions_funnel_id ON funnel_sessions(funnel_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON funnel_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_funnel_started ON funnel_sessions(funnel_id, started_at DESC);

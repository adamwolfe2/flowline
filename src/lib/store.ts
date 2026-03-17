import { Funnel, Lead, FunnelSession, FunnelStats } from "@/types";
import { DEFAULT_FUNNEL_CONFIG } from "./default-config";
import { generateId } from "./utils";

// In-memory store — replace with Supabase queries when ready
// This allows the full product to work without any DB setup

const DEMO_USER_ID = "demo-user-001";

const funnels: Map<string, Funnel> = new Map();
const leads: Map<string, Lead[]> = new Map();
const sessions: Map<string, FunnelSession[]> = new Map();

// Seed with demo data
function seed() {
  if (funnels.size > 0) return;

  const demoFunnel: Funnel = {
    id: "demo-funnel-001",
    user_id: DEMO_USER_ID,
    slug: "demo",
    custom_domain: null,
    config: {
      ...DEFAULT_FUNNEL_CONFIG,
      brand: {
        ...DEFAULT_FUNNEL_CONFIG.brand,
        name: "Growth Accelerator",
        primaryColor: "#7C3AED",
        primaryColorLight: "#F5F3FF",
        primaryColorDark: "#6D28D9",
      },
      quiz: {
        ...DEFAULT_FUNNEL_CONFIG.quiz,
        headline: "See If You Qualify for 3x Revenue Growth",
        subheadline: "Answer 3 questions. Get a custom strategy session.",
      },
      meta: {
        title: "Apply | Growth Accelerator",
        description: "See if you qualify for our growth program.",
      },
    },
    published: true,
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  funnels.set(demoFunnel.id, demoFunnel);

  // Seed demo leads
  const demoLeads: Lead[] = Array.from({ length: 23 }, (_, i) => ({
    id: generateId(),
    funnel_id: demoFunnel.id,
    email: `lead${i + 1}@example.com`,
    answers: {
      q1: ["a", "b", "c", "d"][Math.floor(Math.random() * 4)],
      q2: ["a", "b", "c", "d"][Math.floor(Math.random() * 4)],
      q3: ["a", "b", "c", "d"][Math.floor(Math.random() * 4)],
    },
    score: Math.floor(Math.random() * 10),
    calendar_tier: (["high", "mid", "low"] as const)[Math.floor(Math.random() * 3)],
    created_at: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString(),
  }));
  leads.set(demoFunnel.id, demoLeads);

  // Seed demo sessions
  const demoSessions: FunnelSession[] = Array.from({ length: 67 }, () => ({
    id: generateId(),
    funnel_id: demoFunnel.id,
    started_at: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString(),
    completed: Math.random() > 0.35,
    converted: Math.random() > 0.55,
  }));
  sessions.set(demoFunnel.id, demoSessions);
}

seed();

export const store = {
  // Funnels
  getFunnels(userId: string): Funnel[] {
    return Array.from(funnels.values()).filter(f => f.user_id === userId);
  },
  getFunnel(id: string): Funnel | null {
    return funnels.get(id) || null;
  },
  getFunnelBySlug(slug: string): Funnel | null {
    return Array.from(funnels.values()).find(f => f.slug === slug && f.published) || null;
  },
  getFunnelByDomain(domain: string): Funnel | null {
    return Array.from(funnels.values()).find(f => f.custom_domain === domain && f.published) || null;
  },
  createFunnel(userId: string, config: Funnel["config"], slug: string): Funnel {
    const funnel: Funnel = {
      id: generateId(),
      user_id: userId,
      slug,
      custom_domain: null,
      config,
      published: false,
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    funnels.set(funnel.id, funnel);
    leads.set(funnel.id, []);
    sessions.set(funnel.id, []);
    return funnel;
  },
  updateFunnel(id: string, updates: Partial<Funnel>): Funnel | null {
    const funnel = funnels.get(id);
    if (!funnel) return null;
    const updated = { ...funnel, ...updates, updated_at: new Date().toISOString() };
    funnels.set(id, updated);
    return updated;
  },
  deleteFunnel(id: string): boolean {
    leads.delete(id);
    sessions.delete(id);
    return funnels.delete(id);
  },
  isSlugAvailable(slug: string): boolean {
    return !Array.from(funnels.values()).some(f => f.slug === slug);
  },

  // Leads
  getLeads(funnelId: string): Lead[] {
    return leads.get(funnelId) || [];
  },
  addLead(lead: Lead): void {
    const existing = leads.get(lead.funnel_id) || [];
    existing.push(lead);
    leads.set(lead.funnel_id, existing);
  },

  // Sessions
  getSessions(funnelId: string): FunnelSession[] {
    return sessions.get(funnelId) || [];
  },
  addSession(session: FunnelSession): void {
    const existing = sessions.get(session.funnel_id) || [];
    existing.push(session);
    sessions.set(session.funnel_id, existing);
  },

  // Stats
  getStats(funnelId: string): FunnelStats {
    const funnelSessions = sessions.get(funnelId) || [];
    const funnelLeads = leads.get(funnelId) || [];
    const total = funnelSessions.length;
    const completed = funnelSessions.filter(s => s.completed).length;
    const converted = funnelSessions.filter(s => s.converted).length;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      totalSessions: total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
      leadsThisWeek: funnelLeads.filter(l => new Date(l.created_at) >= weekAgo).length,
      leadsThisMonth: funnelLeads.filter(l => new Date(l.created_at) >= monthAgo).length,
      tierBreakdown: {
        high: funnelLeads.filter(l => l.calendar_tier === 'high').length,
        mid: funnelLeads.filter(l => l.calendar_tier === 'mid').length,
        low: funnelLeads.filter(l => l.calendar_tier === 'low').length,
      },
    };
  },

  DEMO_USER_ID,
};

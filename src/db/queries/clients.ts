import { db } from "@/db";
import { clients, funnels, leads, funnelSessions } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * Get all clients for a team with funnel and lead counts.
 */
export async function getClientsByTeam(teamId: string) {
  const teamClients = await db
    .select()
    .from(clients)
    .where(eq(clients.teamId, teamId))
    .orderBy(desc(clients.createdAt));

  if (teamClients.length === 0) return [];

  const clientIds = teamClients.map((c) => c.id);

  // Batch: funnel counts per client
  const funnelCounts = await db
    .select({
      clientId: funnels.clientId,
      count: sql<number>`count(*)::int`,
    })
    .from(funnels)
    .where(sql`${funnels.clientId} IN ${clientIds}`)
    .groupBy(funnels.clientId);

  // Batch: lead counts per client (through funnels)
  const leadCounts = await db
    .select({
      clientId: funnels.clientId,
      count: sql<number>`count(${leads.id})::int`,
    })
    .from(funnels)
    .leftJoin(leads, eq(leads.funnelId, funnels.id))
    .where(sql`${funnels.clientId} IN ${clientIds}`)
    .groupBy(funnels.clientId);

  const funnelMap = new Map(funnelCounts.map((f) => [f.clientId, Number(f.count)]));
  const leadMap = new Map(leadCounts.map((l) => [l.clientId, Number(l.count)]));

  return teamClients.map((client) => ({
    ...client,
    funnelCount: funnelMap.get(client.id) ?? 0,
    leadCount: leadMap.get(client.id) ?? 0,
  }));
}

/**
 * Get a single client by ID within a team.
 */
export async function getClientById(clientId: string, teamId: string) {
  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.teamId, teamId)));

  return client ?? null;
}

/**
 * Get a client with all assigned funnels and per-funnel lead counts.
 */
export async function getClientWithFunnels(clientId: string, teamId: string) {
  const client = await getClientById(clientId, teamId);
  if (!client) return null;

  const clientFunnels = await db
    .select({
      id: funnels.id,
      slug: funnels.slug,
      published: funnels.published,
      createdAt: funnels.createdAt,
      updatedAt: funnels.updatedAt,
      config: funnels.config,
    })
    .from(funnels)
    .where(eq(funnels.clientId, clientId));

  // Get lead counts per funnel
  const funnelIds = clientFunnels.map((f) => f.id);
  const leadCountRows =
    funnelIds.length > 0
      ? await db
          .select({
            funnelId: leads.funnelId,
            count: sql<number>`count(*)::int`,
          })
          .from(leads)
          .where(sql`${leads.funnelId} IN ${funnelIds}`)
          .groupBy(leads.funnelId)
      : [];

  const leadMap = new Map(leadCountRows.map((l) => [l.funnelId, Number(l.count)]));

  return {
    client,
    funnels: clientFunnels.map((funnel) => ({
      ...funnel,
      leadCount: leadMap.get(funnel.id) ?? 0,
    })),
  };
}

/**
 * Get aggregate stats for a client across all their funnels.
 */
export async function getClientStats(clientId: string) {
  const clientFunnels = await db
    .select({ id: funnels.id })
    .from(funnels)
    .where(eq(funnels.clientId, clientId));

  if (clientFunnels.length === 0) {
    return { totalFunnels: 0, totalLeads: 0, totalSessions: 0, conversionRate: 0 };
  }

  const funnelIds = clientFunnels.map((f) => f.id);

  const [leadResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(leads)
    .where(sql`${leads.funnelId} IN ${funnelIds}`);

  const [sessionResult] = await db
    .select({
      total: sql<number>`count(*)::int`,
      converted: sql<number>`coalesce(sum(case when ${funnelSessions.converted} then 1 else 0 end), 0)::int`,
    })
    .from(funnelSessions)
    .where(sql`${funnelSessions.funnelId} IN ${funnelIds}`);

  const totalSessions = Number(sessionResult?.total ?? 0);
  const converted = Number(sessionResult?.converted ?? 0);

  return {
    totalFunnels: clientFunnels.length,
    totalLeads: Number(leadResult?.count ?? 0),
    totalSessions,
    conversionRate: totalSessions > 0 ? Math.round((converted / totalSessions) * 100) : 0,
  };
}

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Avoid pulling in the real Neon client or Sentry at import time.
vi.mock("@/db", () => ({ db: { insert: vi.fn(), execute: vi.fn() } }));
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { isSafeWebhookUrl, webhookEnabledFor, formatForGHL, fireWebhook } from "@/lib/webhook";

describe("isSafeWebhookUrl (SSRF guard)", () => {
  it("allows normal public https URLs", () => {
    expect(isSafeWebhookUrl("https://hooks.example.com/abc")).toBe(true);
    expect(isSafeWebhookUrl("http://api.partner.io/webhook")).toBe(true);
  });

  it("rejects non-http(s) schemes", () => {
    expect(isSafeWebhookUrl("file:///etc/passwd")).toBe(false);
    expect(isSafeWebhookUrl("ftp://example.com")).toBe(false);
    expect(isSafeWebhookUrl("gopher://example.com")).toBe(false);
  });

  it("rejects malformed URLs", () => {
    expect(isSafeWebhookUrl("not a url")).toBe(false);
    expect(isSafeWebhookUrl("")).toBe(false);
  });

  it("rejects loopback and unspecified hosts", () => {
    expect(isSafeWebhookUrl("http://localhost/x")).toBe(false);
    expect(isSafeWebhookUrl("http://127.0.0.1/x")).toBe(false);
    expect(isSafeWebhookUrl("http://0.0.0.0/x")).toBe(false);
    expect(isSafeWebhookUrl("http://[::1]/x")).toBe(false);
  });

  it("rejects private IPv4 ranges", () => {
    expect(isSafeWebhookUrl("http://10.0.0.5/x")).toBe(false);
    expect(isSafeWebhookUrl("http://172.16.4.4/x")).toBe(false);
    expect(isSafeWebhookUrl("http://172.31.255.1/x")).toBe(false);
    expect(isSafeWebhookUrl("http://192.168.1.1/x")).toBe(false);
  });

  it("rejects cloud metadata and link-local addresses", () => {
    expect(isSafeWebhookUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
    expect(isSafeWebhookUrl("http://metadata.google.internal/x")).toBe(false);
  });

  it("rejects internal/local TLDs", () => {
    expect(isSafeWebhookUrl("http://service.internal/x")).toBe(false);
    expect(isSafeWebhookUrl("http://printer.local/x")).toBe(false);
  });

  it("rejects IPv4-mapped IPv6 loopback (normalization bypass)", () => {
    expect(isSafeWebhookUrl("http://[::ffff:127.0.0.1]/x")).toBe(false);
  });

  it("does not reject public IPs in the 172 range outside 16-31", () => {
    expect(isSafeWebhookUrl("http://172.15.0.1/x")).toBe(true);
    expect(isSafeWebhookUrl("http://172.32.0.1/x")).toBe(true);
  });
});

describe("webhookEnabledFor", () => {
  it("returns false when there is no webhook url", () => {
    expect(webhookEnabledFor(undefined, "lead")).toBe(false);
    expect(webhookEnabledFor({ url: "" }, "lead")).toBe(false);
  });

  it("defaults to enabled when events config is absent (back-compat)", () => {
    const wh = { url: "https://x.com" };
    expect(webhookEnabledFor(wh, "lead")).toBe(true);
    expect(webhookEnabledFor(wh, "completed")).toBe(true);
    expect(webhookEnabledFor(wh, "booking")).toBe(true);
  });

  it("honors explicit per-event flags", () => {
    const wh = { url: "https://x.com", events: { lead: true, completed: false, booking: false } };
    expect(webhookEnabledFor(wh, "lead")).toBe(true);
    expect(webhookEnabledFor(wh, "completed")).toBe(false);
    expect(webhookEnabledFor(wh, "booking")).toBe(false);
  });
});

describe("formatForGHL", () => {
  it("maps quiz payload into GHL contact shape with segmentation tags", () => {
    const out = formatForGHL({
      email: "a@b.com",
      score: 42,
      calendar_tier: "high",
      funnel_slug: "demo",
      quiz_answers_formatted: "Q1: A",
      source: "My Funnel",
      funnel_url: "https://getmyvsl.com/f/demo",
    });
    expect(out.email).toBe("a@b.com");
    expect(out.tags).toEqual(["myvsl-lead", "score-high", "funnel-demo"]);
    const cf = out.customField as Record<string, string>;
    expect(cf.quiz_score).toBe("42");
    expect(cf.quiz_tier).toBe("high");
    expect(out.source).toBe("MyVSL Quiz Funnel");
  });

  it("handles missing fields without throwing", () => {
    const out = formatForGHL({});
    expect(out.email).toBe("");
    expect(out.tags).toEqual(["myvsl-lead"]);
  });
});

describe("fireWebhook", () => {
  const realFetch = global.fetch;

  beforeEach(() => {
    delete process.env.WEBHOOK_SIGNING_SECRET;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    global.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it("blocks unsafe targets without ever calling fetch", async () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;
    const ok = await fireWebhook("http://169.254.169.254/x", { a: 1 });
    expect(ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns true and posts JSON on a 2xx response", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, status: 200, statusText: "OK" });
    global.fetch = fetchSpy as unknown as typeof fetch;
    const ok = await fireWebhook("https://hooks.example.com/x", { event: "lead" });
    expect(ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ event: "lead" });
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("adds HMAC signature headers when WEBHOOK_SIGNING_SECRET is set", async () => {
    process.env.WEBHOOK_SIGNING_SECRET = "topsecret";
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, status: 200, statusText: "OK" });
    global.fetch = fetchSpy as unknown as typeof fetch;
    await fireWebhook("https://hooks.example.com/x", { event: "lead" });
    const [, init] = fetchSpy.mock.calls[0];
    expect(init.headers["X-Webhook-Signature"]).toMatch(/^[0-9a-f]{64}$/);
    expect(init.headers["X-Webhook-Timestamp"]).toMatch(/^\d+$/);
  });

  it("applies the GHL transform when format is ghl", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, status: 200, statusText: "OK" });
    global.fetch = fetchSpy as unknown as typeof fetch;
    await fireWebhook("https://hooks.example.com/x", { email: "a@b.com", calendar_tier: "mid" }, undefined, 3, "ghl");
    const [, init] = fetchSpy.mock.calls[0];
    const sent = JSON.parse(init.body);
    expect(sent.source).toBe("MyVSL Quiz Funnel");
    expect(sent.tags).toContain("score-mid");
  });
});

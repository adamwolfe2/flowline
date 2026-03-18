export async function fireWebhook(url: string, payload: Record<string, unknown>, retries = 3): Promise<boolean> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) return true;

      console.error(`[webhook] attempt ${attempt + 1}/${retries} failed`, { url, status: res.status, statusText: res.statusText });
    } catch (err) {
      console.error(`[webhook] attempt ${attempt + 1}/${retries} error`, { url, error: err instanceof Error ? err.message : "unknown" });
    }

    // Exponential backoff: 1s, 2s, 4s
    if (attempt < retries - 1) {
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }

  console.error(`[webhook] all ${retries} attempts failed`, { url });
  return false;
}

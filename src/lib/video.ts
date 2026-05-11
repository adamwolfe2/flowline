/**
 * Convert a video URL into an embeddable iframe src.
 * Supports: YouTube (watch / youtu.be / embed / shorts / live / m.youtube),
 * Vimeo (with or without privacy hash), Loom (share or embed), and Wistia.
 * Returns null when the URL can't be embedded.
 */
export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // YouTube — matches watch, youtu.be, embed, shorts, live across www / m / no-subdomain
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?(?:[^&\s]*&)*v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&playsinline=1`;
  }

  // Vimeo — supports vimeo.com/<id>, vimeo.com/<id>/<hash>, player.vimeo.com/video/<id>
  const vimeoMatch = trimmed.match(
    /vimeo\.com\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/
  );
  if (vimeoMatch) {
    const id = vimeoMatch[1];
    const hash = vimeoMatch[2];
    const base = `https://player.vimeo.com/video/${id}`;
    return hash ? `${base}?h=${hash}&autoplay=1` : `${base}?autoplay=1`;
  }

  // Loom — supports loom.com/share/<id> and loom.com/embed/<id>
  const loomMatch = trimmed.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (loomMatch) {
    return `https://www.loom.com/embed/${loomMatch[1]}?autoplay=1`;
  }

  // Wistia — fast.wistia.com / company.wistia.com /medias/<id> or /embed/iframe/<id>
  const wistiaMatch = trimmed.match(
    /wistia\.(?:com|net)\/(?:medias|embed\/iframe)\/([a-zA-Z0-9]+)/
  );
  if (wistiaMatch) {
    return `https://fast.wistia.net/embed/iframe/${wistiaMatch[1]}?autoPlay=true`;
  }

  // Direct video file URLs — surface as-is so callers can fall back to <video>.
  if (/\.(mp4|webm|m4v|mov)(\?.*)?$/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

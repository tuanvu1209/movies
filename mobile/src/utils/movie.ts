export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80";

export function normalizeImageUrl(url?: string): string {
  if (!url) {
    return FALLBACK_IMAGE;
  }
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  if (url.startsWith("/")) {
    return FALLBACK_IMAGE;
  }
  return url;
}

export function parseViewCount(viewCount?: string): number {
  if (!viewCount) {
    return 0;
  }
  const normalized = viewCount.trim().toUpperCase();
  if (normalized.endsWith("K")) {
    const n = Number.parseFloat(normalized.replace("K", ""));
    return Number.isNaN(n) ? 0 : Math.round(n * 1000);
  }
  const n = Number.parseFloat(normalized.replace(/[^0-9.]/g, ""));
  return Number.isNaN(n) ? 0 : Math.round(n);
}

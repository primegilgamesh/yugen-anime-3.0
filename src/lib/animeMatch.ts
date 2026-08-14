import { AnimeEntry } from "@/data/animeData";

/** Shared fuzzy title matching so schedule entries, search and cards resolve to the right anime. */

const ROMAN: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10 };

const NOISE = new Set([
  "the", "a", "an", "of", "and", "wo", "no", "ga", "wa", "ni", "de",
  "tv", "anime", "donghua", "arc", "final", "part", "cour", "series",
]);

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const clean = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

/** Extract a season number from a title (defaults to 1). */
export function seasonOf(raw: string): number {
  const s = clean(raw);
  let m = s.match(/season\s*(\d+)/) || s.match(/(\d+)(?:st|nd|rd|th)\s*season/) || s.match(/\bs(\d+)\b/);
  if (m) return parseInt(m[1], 10);
  m = s.match(/\bseason\s+(i{1,3}|iv|vi{0,3}|ix|x)\b/);
  if (m) return ROMAN[m[1]] ?? 1;
  // trailing roman numeral, e.g. "Overlord IV"
  m = s.match(/\s(i{2,3}|iv|vi{0,3}|ix|x)$/);
  if (m) return ROMAN[m[1]] ?? 1;
  return 1;
}

const isMovie = (s: string) => /\b(movie|film|gekijouban)\b/.test(clean(s));

/** Title reduced to meaningful tokens with season/format markers removed. */
function tokens(raw: string): string[] {
  let s = clean(raw)
    .replace(/season\s*\d+/g, " ")
    .replace(/\d+(?:st|nd|rd|th)\s*season/g, " ")
    .replace(/\bs\d+\b/g, " ")
    .replace(/\bseason\b/g, " ")
    .replace(/\b(movie|film|gekijouban|ova|ona|special)\b/g, " ")
    .replace(/\s(i{2,3}|iv|vi{0,3}|ix|x)$/g, " ");
  return s.split(/\s+/).filter((t) => t && !NOISE.has(t));
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

const ratio = (a: string, b: string) => {
  const max = Math.max(a.length, b.length);
  return max ? 1 - levenshtein(a, b) / max : 0;
};

/** 0..1 similarity between two anime titles, season-aware. */
export function titleSimilarity(a: string, b: string): number {
  if (seasonOf(a) !== seasonOf(b)) return 0;
  if (isMovie(a) !== isMovie(b)) return 0;

  const ta = tokens(a), tb = tokens(b);
  if (!ta.length || !tb.length) return 0;
  const ja = ta.join(""), jb = tb.join("");
  if (ja === jb) return 1;

  const setA = new Set(ta), setB = new Set(tb);
  let inter = 0;
  setA.forEach((t) => { if (setB.has(t)) inter++; });
  const jaccard = inter / (setA.size + setB.size - inter);
  const lev = ratio(ja, jb);

  // Containment only counts when the shorter title is substantial.
  const contained =
    (ja.length >= 6 && jb.includes(ja)) || (jb.length >= 6 && ja.includes(jb))
      ? Math.min(ja.length, jb.length) / Math.max(ja.length, jb.length)
      : 0;

  return Math.max(jaccard * 0.9 + lev * 0.1, lev, contained);
}

const titlesOf = (a: AnimeEntry) =>
  [a.title, a.titleRomaji, a.titleEnglish, a.synonyms].filter(Boolean) as string[];

/** Best matching anime for a free-text title, or null when nothing is confident enough. */
export function findAnime(query: string, list: AnimeEntry[], threshold = 0.72): AnimeEntry | null {
  const target = slugify(query);
  const bySlug = list.find((a) => a.slug === target);
  if (bySlug) return bySlug;

  let best: AnimeEntry | null = null;
  let bestScore = 0;
  for (const a of list) {
    let score = titleSimilarity(query, a.slug.replace(/-/g, " "));
    for (const t of titlesOf(a)) score = Math.max(score, titleSimilarity(query, t));
    if (score > bestScore) { bestScore = score; best = a; }
  }
  return bestScore >= threshold ? best : null;
}

/** Fuzzy search used by search bars: token prefix matching plus typo tolerance. */
export function searchAnime(query: string, list: AnimeEntry[], limit = 50): AnimeEntry[] {
  const q = clean(query);
  if (!q) return [];
  const qTokens = q.split(" ").filter(Boolean);

  const scored = list.map((a) => {
    const fields = titlesOf(a).map(clean);
    const hay = fields.join(" ");
    let score = 0;

    if (fields.some((f) => f === q)) score = 3;
    else if (hay.includes(q)) score = 2 + Math.min(q.length, 20) / 100;
    else {
      const hayTokens = hay.split(" ").filter(Boolean);
      const matched = qTokens.filter((qt) =>
        hayTokens.some((ht) => ht.startsWith(qt) || (qt.length >= 4 && ratio(qt, ht) >= 0.75))
      );
      if (matched.length === qTokens.length) score = 1 + matched.length / (qTokens.length + 1);
      else if (matched.length) score = matched.length / qTokens.length * 0.8;
    }
    return { a, score };
  });

  return scored.filter((s) => s.score >= 0.6)
    .sort((x, y) => y.score - x.score || x.a.title.localeCompare(y.a.title))
    .slice(0, limit)
    .map((s) => s.a);
}

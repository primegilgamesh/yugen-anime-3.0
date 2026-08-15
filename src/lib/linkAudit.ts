import { allAnime, slugAliases, resolveSlug, AnimeEntry } from "@/data/animeData";
import { weeklySchedule } from "@/data/scheduleData";
import { recentEpisodes } from "@/data/recentEpisodes";
import { findAnime, titleSimilarity } from "@/lib/animeMatch";

export type LinkStatus = "ok" | "alias" | "mismatch" | "missing";

export interface LinkAuditRow {
  source: "Schedule" | "Cards" | "Slideshow";
  label: string;
  linkedSlug: string;
  resolvedSlug: string | null;
  resolvedTitle: string | null;
  status: LinkStatus;
  suggestedSlug?: string;
  suggestedTitle?: string;
}

const HOME_OVERRIDES_KEY = "yugen_home_overrides";

const loadHomeOverrides = (): Record<string, string[]> => {
  try {
    return JSON.parse(localStorage.getItem(HOME_OVERRIDES_KEY) || "{}") || {};
  } catch {
    return {};
  }
};

/** Check one link: does `slug` exist, and does the resolved entry actually match `label`? */
export function auditLink(source: LinkAuditRow["source"], label: string, linkedSlug: string): LinkAuditRow {
  const entry: AnimeEntry | undefined = resolveSlug(linkedSlug);
  const base: LinkAuditRow = {
    source,
    label,
    linkedSlug,
    resolvedSlug: entry?.slug ?? null,
    resolvedTitle: entry?.title ?? null,
    status: "ok",
  };

  const suggestion = findAnime(label, allAnime);
  if (suggestion) {
    base.suggestedSlug = suggestion.slug;
    base.suggestedTitle = suggestion.title;
  }

  if (!entry) return { ...base, status: "missing" };

  const titles = [entry.title, entry.titleRomaji, entry.titleEnglish, entry.synonyms, entry.slug.replace(/-/g, " ")]
    .filter(Boolean) as string[];
  const best = Math.max(...titles.map((t) => titleSimilarity(label, t)));
  if (best < 0.6 && suggestion && suggestion.slug !== entry.slug) {
    return { ...base, status: "mismatch" };
  }
  if (slugAliases[linkedSlug]) return { ...base, status: "alias" };
  return base;
}

/** Audit every schedule, card and slideshow link against the catalog. */
export function runLinkAudit(): LinkAuditRow[] {
  const rows: LinkAuditRow[] = [];

  for (const day of weeklySchedule) {
    for (const e of day.entries) rows.push(auditLink("Schedule", e.title, e.slug));
  }

  for (const ep of recentEpisodes.slice(0, 200)) {
    rows.push(auditLink("Cards", ep.title, ep.slug));
  }

  const overrides = loadHomeOverrides();
  for (const [section, slugs] of Object.entries(overrides)) {
    if (!Array.isArray(slugs)) continue;
    for (const slug of slugs) {
      const entry = resolveSlug(slug);
      rows.push(auditLink("Slideshow", entry?.title ?? slug.replace(/-/g, " "), slug));
    }
  }

  return rows;
}

export const auditSummary = (rows: LinkAuditRow[]) => ({
  total: rows.length,
  ok: rows.filter((r) => r.status === "ok").length,
  alias: rows.filter((r) => r.status === "alias").length,
  mismatch: rows.filter((r) => r.status === "mismatch").length,
  missing: rows.filter((r) => r.status === "missing").length,
});

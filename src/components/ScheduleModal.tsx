import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { allAnime } from "@/data/animeData";

const dayOrder = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

interface LiveEntry {
  airingAt: number; // unix seconds
  episode: number;
  title: string;
  romaji: string;
  country: string;
  id: number;
}

function resolveAnime(entry: LiveEntry): AnimeEntry | null {
  const candidates = [entry.romaji, entry.title].filter(Boolean) as string[];
  for (const cand of candidates) {
    const hit = findAnime(cand, allAnime);
    if (hit) return hit;
  }
  return null;
}


// Fetch the current week's airing schedule from AniList. Public GraphQL, no auth.
async function fetchWeekSchedule(): Promise<LiveEntry[]> {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay()); // Sunday
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const startSec = Math.floor(start.getTime() / 1000);
  const endSec = Math.floor(end.getTime() / 1000);

  const query = `
    query ($start: Int, $end: Int, $page: Int) {
      Page(page: $page, perPage: 50) {
        pageInfo { hasNextPage }
        airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
          airingAt
          episode
          media {
            id
            countryOfOrigin
            title { romaji english }
          }
        }
      }
    }`;

  const entries: LiveEntry[] = [];
  for (let page = 1; page <= 6; page++) {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables: { start: startSec, end: endSec, page } }),
    });
    if (!res.ok) throw new Error(`AniList ${res.status}`);
    const json = await res.json();
    const list = json?.data?.Page?.airingSchedules ?? [];
    for (const a of list) {
      entries.push({
        airingAt: a.airingAt,
        episode: a.episode,
        title: a.media?.title?.english || a.media?.title?.romaji || "Unknown",
        romaji: a.media?.title?.romaji || "",
        country: a.media?.countryOfOrigin || "JP",
        id: a.media?.id,
      });
    }
    if (!json?.data?.Page?.pageInfo?.hasNextPage) break;
  }
  return entries;
}

const ScheduleModal = () => {
  const [now, setNow] = useState(new Date());
  const [entries, setEntries] = useState<LiveEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchWeekSchedule()
      .then((d) => { if (!cancelled) setEntries(d); })
      .catch((e) => { if (!cancelled) setError(e.message || "Failed to load schedule"); });
    return () => { cancelled = true; };
  }, []);

  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const todayKey = dayOrder[now.getDay()];
  const todayLabel = now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

  // Group by local day, ordered from today forward
  const grouped = useMemo(() => {
    const buckets: Record<typeof dayOrder[number], LiveEntry[]> = {
      SUN: [], MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [],
    };
    (entries ?? []).forEach((e) => {
      const d = new Date(e.airingAt * 1000);
      buckets[dayOrder[d.getDay()]].push(e);
    });
    (Object.keys(buckets) as (keyof typeof buckets)[]).forEach((k) =>
      buckets[k].sort((a, b) => a.airingAt - b.airingAt)
    );
    return dayOrder
      .map((day) => ({ day, list: buckets[day] }))
      .sort((a, b) => {
        const ai = (dayOrder.indexOf(a.day) - dayOrder.indexOf(todayKey) + 7) % 7;
        const bi = (dayOrder.indexOf(b.day) - dayOrder.indexOf(todayKey) + 7) % 7;
        return ai - bi;
      });
  }, [entries, todayKey]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-foreground font-display font-bold text-2xl">
          {timeStr} <span className="text-muted-foreground text-sm font-normal">Local time</span>
        </p>
        <p className="text-muted-foreground text-sm">
          {todayLabel} · Live from AniList & MyAnimeList
        </p>
      </div>

      {!entries && !error && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 size={14} className="animate-spin" /> Loading live schedule…
        </div>
      )}
      {error && (
        <p className="text-destructive text-sm">Couldn't load live schedule: {error}</p>
      )}

      {entries && grouped.map(({ day, list }) => (
        <div key={day}>
          <h3 className={`font-bold text-sm mb-2 ${day === todayKey ? "text-primary" : "text-foreground"}`}>
            {day}{day === todayKey ? " · Today" : ""}
            <span className="text-muted-foreground text-[11px] font-normal ml-2">{list.length} releases</span>
          </h3>
          {list.length === 0 ? (
            <p className="text-muted-foreground text-xs">No releases.</p>
          ) : (
            <div className="space-y-1">
              {list.map((entry) => {
                const d = new Date(entry.airingAt * 1000);
                const t = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
                const passed = entry.airingAt * 1000 < now.getTime();
                return (
                  <div key={`${entry.id}-${entry.episode}`} className="flex gap-3 py-1">
                    <span className={`text-sm font-medium w-14 flex-shrink-0 ${passed ? "text-muted-foreground/60" : "text-primary"}`}>{t}</span>
                    <Link
                      to={`/anime/${findAnimeSlug(entry)}`}
                      className="text-muted-foreground text-sm hover:text-primary transition-colors flex-1 truncate"
                    >
                      {entry.title}
                      <span className="text-[11px] text-muted-foreground/70 ml-2">EP {entry.episode}</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ScheduleModal;

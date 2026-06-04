import { allAnime } from "./animeData";
import "./customAnimeLoader"; // ensure admin-added animes are merged
import { weeklySchedule } from "./scheduleData";

export interface RecentEpisode {
  slug: string;
  title: string;
  episode: number;
  views: string;
  timeAgo: string;
  duration: string;
  gradient: number;
  language: "sub" | "chinese";
}

const TIME_LABELS = [
  "about 2 hours ago", "about 5 hours ago", "about 6 hours ago", "about 8 hours ago",
  "about 9 hours ago", "about 10 hours ago", "about 11 hours ago", "about 12 hours ago",
  "about 22 hours ago", "about 23 hours ago", "a day ago", "2 days ago",
];

// Build the list dynamically — start with today's schedule airings (live releases),
// then append any other anime episodes from the catalog.
const DAY_KEYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
const todayKey = DAY_KEYS[new Date().getDay()];
const todaySchedule = weeklySchedule.find((d) => d.day === todayKey)?.entries ?? [];

const scheduled: RecentEpisode[] = todaySchedule.map((e, i) => {
  const a = allAnime.find((x) => x.slug === e.slug);
  const chineseHint = a?.format?.toLowerCase().includes("chinese") || a?.title?.toLowerCase().includes("donghua");
  return {
    slug: e.slug,
    title: e.title,
    episode: e.episode,
    views: `${Math.floor(Math.random() * 9000) + 800} views`,
    timeAgo: "just released",
    duration: a?.duration?.replace(" per ep", "") || "24:00",
    gradient: i,
    language: chineseHint ? "chinese" : "sub",
  };
});

const fromCatalog: RecentEpisode[] = allAnime
  .filter((a) => a.episodes && a.episodes > 0 && !scheduled.find((s) => s.slug === a.slug))
  .map((anime, i) => ({
    slug: anime.slug,
    title: anime.title,
    episode: anime.episodes || 1,
    views: anime.views || `${Math.floor(Math.random() * 5000) + 50} views`,
    timeAgo: anime.timeAgo || TIME_LABELS[i % TIME_LABELS.length],
    duration: anime.duration?.replace(" per ep", "") || "24:00",
    gradient: i,
    language: i % 5 === 0 && i > 0 ? "chinese" : "sub",
  }));

export const recentEpisodes: RecentEpisode[] = [...scheduled, ...fromCatalog];

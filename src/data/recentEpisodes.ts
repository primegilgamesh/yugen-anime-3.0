import { allAnime } from "./animeData";

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

export const recentEpisodes: RecentEpisode[] = allAnime
  .filter((a) => a.episodes && a.episodes > 0)
  .map((anime, i) => ({
    slug: anime.slug,
    title: anime.title,
    episode: anime.episodes || 1,
    views: anime.views || `${Math.floor(Math.random() * 5000) + 50} views`,
    timeAgo: anime.timeAgo || TIME_LABELS[i % TIME_LABELS.length],
    duration: anime.duration?.replace(" per ep", "") || "24:00",
    gradient: i,
    // Light heuristic: mark every 5th entry as a Chinese donghua release
    language: i % 5 === 0 && i > 0 ? "chinese" : "sub",
  }));

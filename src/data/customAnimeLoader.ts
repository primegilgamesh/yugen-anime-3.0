import { allAnime, AnimeEntry } from "./animeData";

// Load custom animes added via the Admin panel and merge them into the global list
// so they have full pages, appear in search, and show up in recently-released feeds.
const gradientPool = [
  "from-blue-600 to-purple-700",
  "from-rose-600 to-orange-500",
  "from-emerald-600 to-teal-500",
  "from-amber-500 to-red-600",
  "from-indigo-600 to-blue-500",
  "from-pink-500 to-violet-600",
  "from-cyan-500 to-blue-600",
];

if (typeof window !== "undefined") {
  try {
    const customs: any[] = JSON.parse(localStorage.getItem("yugen_custom_animes") || "[]");
    customs.forEach((c, i) => {
      if (!c?.slug) return;
      if (allAnime.find((a) => a.slug === c.slug)) return;
      const stub: AnimeEntry = {
        slug: c.slug,
        title: c.title,
        titleEnglish: c.title,
        season: "New Release",
        score: 0,
        cover: gradientPool[i % gradientPool.length],
        episodes: c.episodes || 12,
        dubbed: false,
        format: "TV",
        status: "Currently Airing",
        genres: c.genres,
        synopsis: c.synopsis || `${c.title} has just been added to YugenAnime.`,
      };
      allAnime.push(stub);
    });
  } catch {}
}
import { allAnime, AnimeEntry } from "./animeData";

// Load custom animes + admin overrides and apply them to the global list so they
// have full pages, appear in search, and show up in recently-released feeds.
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

  // Apply admin overrides (title/synopsis/genres/episodes) to every section/page.
  try {
    const overrides: Record<string, Partial<AnimeEntry>> =
      JSON.parse(localStorage.getItem("yugen_anime_overrides") || "{}");
    for (const slug of Object.keys(overrides)) {
      const o = overrides[slug] || {};
      const target = allAnime.find((a) => a.slug === slug);
      if (!target) continue;
      if (o.title) { target.title = o.title; target.titleEnglish = o.title; }
      if (o.synopsis !== undefined) target.synopsis = o.synopsis;
      if (o.genres !== undefined) target.genres = o.genres;
      if (o.episodes !== undefined) target.episodes = o.episodes;
    }
  } catch {}
}
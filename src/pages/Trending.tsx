import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { trendingAiring, recentlyReleased, getGradient } from "@/data/animeData";
import AnimeArtwork from "@/components/AnimeArtwork";

const trendingSeries = [
  { ...trendingAiring.find((a) => a.slug === "one-piece")!, nativeTitle: "ワンピース" },
  { ...trendingAiring.find((a) => a.slug === "kusuriya-no-hitorigoto")!, nativeTitle: "薬屋のひとりごと" },
  { ...trendingAiring.find((a) => a.slug === "boku-no-kokoro-no-yabai-yatsu")!, nativeTitle: "僕の心のヤバいやつ" },
  { ...trendingAiring.find((a) => a.slug === "kingdom-5th-season")!, nativeTitle: "キングダム" },
  { ...trendingAiring.find((a) => a.slug === "frieren")!, nativeTitle: "葬送のフリーレン" },
  { ...trendingAiring.find((a) => a.slug === "ninja-kamui")!, nativeTitle: "ニンジャカムイ" },
].filter((a) => a.slug);

const trendingEpisodes = recentlyReleased.slice(0, 10);

const Trending = () => (
  <div className="min-h-screen bg-background pb-14 md:pb-0">
    <Sidebar />
    <BottomNav />
    <div className="md:ml-[70px]">
      <TopBar />
      <div className="px-4 md:px-6 py-6 space-y-8">
        <div>
          <h1 className="text-foreground font-display font-bold text-xl mb-1">Trending Series</h1>
          <p className="text-muted-foreground text-sm mb-6">Discover new and trending series this week.</p>
          <div className="space-y-6">
            {trendingSeries.map((anime, i) => (
              <Link to={`/anime/${anime.slug}`} key={anime.slug} className="flex gap-4 group">
                <AnimeArtwork cover={anime.cover || getGradient(i)} className="w-24 h-32 md:w-28 md:h-36 rounded-md overflow-hidden flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-muted-foreground text-[10px] uppercase">{anime.nativeTitle}</p>
                  <h3 className="text-foreground font-display font-bold text-base group-hover:text-primary transition-colors">{anime.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span>Type: <span className="text-foreground">{anime.format || "TV"}</span></span>
                    <span>MyAnimeList: <span className="text-foreground">{anime.score?.toFixed(2)}</span></span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Release Date: <span className="text-foreground">{anime.season}</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-2 line-clamp-2 hidden md:block">{anime.synopsis}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-foreground font-display font-bold text-lg mb-1">Trending Episodes</h2>
          <p className="text-muted-foreground text-sm mb-4">Trending episodes this week.</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {trendingEpisodes.map((ep, i) => (
              <Link to={`/anime/${ep.slug}`} key={ep.slug + i} className="group block">
                <div className={`relative rounded-md overflow-hidden bg-gradient-to-br ${getGradient(i)} aspect-video`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-1 right-1 bg-background/80 text-foreground text-[9px] px-1 py-0.5 rounded">24:00</div>
                </div>
                <div className="mt-1.5">
                  <p className="text-foreground text-[11px] font-medium leading-tight group-hover:text-primary transition-colors truncate">{ep.episodes} · {ep.title}</p>
                  <p className="text-primary text-[9px]">{ep.title}</p>
                  <p className="text-muted-foreground text-[9px]">{ep.views} · {ep.timeAgo}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Trending;

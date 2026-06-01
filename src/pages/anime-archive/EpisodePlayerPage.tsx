import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Rewind, FastForward, Settings, Maximize, ChevronLeft, ChevronRight, LayoutGrid, Lightbulb, Camera, RotateCw, Download, Repeat } from "lucide-react";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import MobileDescription from "@/components/MobileDescription";
import { allAnime } from "@/data/animeData";
import { useAuth } from "@/contexts/AuthContext";
import { useList } from "@/contexts/ListContext";
import ListControls from "@/components/ListControls";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

const EpisodePlayerPage = () => {
  const { slug, episode } = useParams<{ slug: string; episode: string }>();
  const epNum = parseInt(episode || "1");
  const { isLoggedIn } = useAuth();
  const { recordWatch } = useList();
  const [autoNext, setAutoNext] = useState(true);
  const [audioMode, setAudioMode] = useState<"sub" | "dub">("sub");
  const [subtitle, setSubtitle] = useState("English");
  const [resolution, setResolution] = useState("Auto");
  const playerRef = useRef<HTMLDivElement>(null);

  const anime = allAnime.find((a) => a.slug === slug);

  useEffect(() => {
    if (anime && isLoggedIn) {
      const epTitle = anime.episodeList?.find((e) => e.num === epNum)?.title;
      recordWatch(anime.slug, anime.title, anime.cover, epNum, epTitle);
    }
  }, [anime, epNum, isLoggedIn, recordWatch]);

  if (!anime) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground text-lg">Anime not found</p>
      </div>
    );
  }

  const totalEps = anime.episodes || 12;
  const episodeList = anime.episodeList || Array.from({ length: totalEps }, (_, i) => ({
    num: i + 1,
    title: `Episode ${i + 1}`,
    views: `${Math.floor(Math.random() * 40 + 10)}K`,
    timeAgo: `${Math.floor(Math.random() * 7 + 1)} months ago`,
  }));

  const currentEp = episodeList.find((e) => e.num === epNum) || episodeList[0];

  const toggleFullscreen = () => {
    const el = playerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => toast("Fullscreen not supported", { position: "top-right" }));
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      <Sidebar />
      <BottomNav />
      <div className="md:ml-[70px]">
        <TopBar />

        {/* Video Player */}
        <div ref={playerRef} className="relative w-full aspect-video bg-black max-h-[70vh]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-muted-foreground text-sm">Video Player · {audioMode.toUpperCase()} · {resolution} · Subs: {subtitle}</div>
          </div>
          {/* Player Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 md:p-4">
            <div className="flex items-center gap-3 text-white">
              <button className="hover:text-primary transition"><Rewind size={18} /></button>
              <button className="hover:text-primary transition"><Play size={20} /></button>
              <button className="hover:text-primary transition"><FastForward size={18} /></button>
              <div className="flex-1 h-1 bg-white/20 rounded-full mx-2 relative">
                <div className="absolute left-0 top-0 h-full w-0 bg-primary rounded-full" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full" />
              </div>
              <span className="text-xs">00:00 / 23:15</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:text-primary transition" aria-label="Settings"><Settings size={16} /></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-3 bg-card border-border">
                  <div className="space-y-3">
                    <div>
                      <label className="text-foreground text-xs font-semibold block mb-1">Subtitles</label>
                      <select value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full bg-secondary text-foreground text-xs rounded px-2 py-1.5 border border-border focus:outline-none focus:border-primary cursor-pointer">
                        {["Off", "English", "Spanish", "Japanese", "French", "German"].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-foreground text-xs font-semibold block mb-1">Resolution</label>
                      <select value={resolution} onChange={(e) => setResolution(e.target.value)} className="w-full bg-secondary text-foreground text-xs rounded px-2 py-1.5 border border-border focus:outline-none focus:border-primary cursor-pointer">
                        {["Auto", "1080p", "720p", "480p", "360p"].map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <button onClick={toggleFullscreen} className="hover:text-primary transition" aria-label="Fullscreen"><Maximize size={16} /></button>
            </div>
          </div>
        </div>

        {/* Episode Nav Bar */}
        <div className="flex items-center justify-between bg-card border-b border-border px-3 py-2">
          {epNum > 1 ? (
            <Link to={`/anime/${slug}/watch/${epNum - 1}`} className="text-muted-foreground hover:text-foreground transition">
              <ChevronLeft size={20} />
            </Link>
          ) : <div className="w-5" />}
          <div className="flex items-center gap-3 text-muted-foreground">
            <button className="hover:text-foreground transition" aria-label="Grid"><LayoutGrid size={14} /></button>
            <button className="hover:text-foreground transition" aria-label="Lights"><Lightbulb size={14} /></button>
            <button className="hover:text-foreground transition" aria-label="Screenshot"><Camera size={14} /></button>
            <button className="hover:text-foreground transition" aria-label="Reload"><RotateCw size={14} /></button>
            <button className="hover:text-foreground transition" aria-label="Download"><Download size={14} /></button>
          </div>
          {epNum < totalEps ? (
            <Link to={`/anime/${slug}/watch/${epNum + 1}`} className="text-muted-foreground hover:text-foreground transition">
              <ChevronRight size={20} />
            </Link>
          ) : <div className="w-5" />}
        </div>

        {/* Episode Info */}
        <div className="px-4 md:px-6 py-4 space-y-4">
          <div>
            <h1 className="text-foreground font-display font-bold text-lg md:text-xl">
              {anime.title} - Episode {epNum}
            </h1>
            <p className="text-muted-foreground text-xs mt-1">
              {currentEp.views || "0"} views • {currentEp.timeAgo || "recently"}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Link to={`/anime/${slug}`} className="text-primary text-sm font-medium hover:underline">
                {anime.title}
              </Link>
              <p className="text-muted-foreground text-xs">{anime.studios}</p>
            </div>
            <div className="flex items-center gap-2">
              {anime.dubbed && (
                <button
                  onClick={() => setAudioMode((m) => (m === "sub" ? "dub" : "sub"))}
                  className="bg-primary text-primary-foreground font-semibold text-xs px-4 py-2 rounded-md hover:opacity-90 transition flex items-center gap-1.5"
                  aria-label="Toggle sub/dub"
                >
                  <Repeat size={12} /> {audioMode === "sub" ? "SUB" : "DUB"}
                </button>
              )}
              <ListControls anime={anime} size="sm" />
            </div>
          </div>

          {/* Synopsis */}
          <div className="md:hidden">
            <MobileDescription synopsis={anime.synopsis || ""} />
          </div>
          <div className="hidden md:block space-y-2">
            <h3 className="text-foreground font-display font-semibold text-base">Synopsis</h3>
            <p className="text-secondary-foreground text-sm leading-relaxed">
              {anime.synopsis}
            </p>
          </div>

          {/* Genres */}
          {anime.genres && (
            <div className="space-y-1">
              <h3 className="text-foreground font-display font-semibold text-sm">Genres</h3>
              <div className="flex flex-wrap gap-1.5">
                {anime.genres.split(", ").map((g) => (
                  <span key={g} className="bg-secondary text-foreground text-[11px] px-2.5 py-1 rounded-md">{g}</span>
                ))}
              </div>
            </div>
          )}

          {/* External Links */}
          <div className="space-y-1">
            <h3 className="text-foreground font-display font-semibold text-sm">External Links</h3>
            <div className="flex flex-wrap gap-1.5">
              <span className="bg-secondary text-muted-foreground text-[11px] px-2.5 py-1 rounded-md">MyAnimeList</span>
              <span className="bg-secondary text-muted-foreground text-[11px] px-2.5 py-1 rounded-md">AniList</span>
              <span className="bg-secondary text-muted-foreground text-[11px] px-2.5 py-1 rounded-md">SIMKL</span>
            </div>
          </div>

          {/* Episode List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground font-display font-semibold text-base">Episodes</h3>
              <div className="flex items-center gap-2">
                <span className="text-primary text-xs">Auto Next</span>
                <button
                  onClick={() => setAutoNext(!autoNext)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${autoNext ? "bg-primary" : "bg-muted"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${autoNext ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {episodeList.map((ep) => (
                <Link
                  key={ep.num}
                  to={`/anime/${slug}/watch/${ep.num}`}
                  className={`flex items-start gap-3 p-2 rounded-md transition-colors ${ep.num === epNum ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary"}`}
                >
                  <div className="w-20 h-14 md:w-24 md:h-16 bg-secondary rounded-md overflow-hidden flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-muted/30 flex items-center justify-center">
                      <span className="text-muted-foreground text-lg font-display font-bold opacity-30">{ep.num}</span>
                    </div>
                    <div className="absolute bottom-0.5 right-0.5 bg-background/80 text-foreground text-[8px] px-1 py-0.5 rounded">24:00</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-medium">{ep.num} : {ep.title}</p>
                    <p className="text-primary text-[11px]">{anime.title}</p>
                    <p className="text-muted-foreground text-[10px]">{ep.views || "0"} views • {ep.timeAgo || "recently"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodePlayerPage;

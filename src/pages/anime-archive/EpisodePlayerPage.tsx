import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Settings, Maximize, ChevronLeft, ChevronRight, LayoutGrid, Lightbulb, Camera, RotateCw, Download, Repeat } from "lucide-react";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import MobileDescription from "@/components/MobileDescription";
import ErrorScreen from "@/components/ErrorScreen";
import { allAnime } from "@/data/animeData";
import { useAuth } from "@/contexts/AuthContext";
import { useList } from "@/contexts/ListContext";
import ListControls from "@/components/ListControls";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const SAMPLE_VIDEO_SRC =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const EpisodePlayerPage = () => {
  const { slug, episode } = useParams<{ slug: string; episode: string }>();
  const epNum = parseInt(episode || "1");
  const { isLoggedIn } = useAuth();
  const { recordWatch } = useList();
  const navigate = useNavigate();
  const [autoNext, setAutoNext] = useState(true);
  const [audioMode, setAudioMode] = useState<"sub" | "dub">("sub");
  const [subtitle, setSubtitle] = useState("English");
  const [resolution, setResolution] = useState("Auto");
  const [dimmed, setDimmed] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const anime = resolveSlug(slug);
  const maxEps = anime?.episodes || anime?.episodeList?.length || 12;
  const episodeMissing = !!anime && (isNaN(epNum) || epNum < 1 || epNum > maxEps);

  useEffect(() => {
    if (anime && !episodeMissing && isLoggedIn) {
      const epTitle = anime.episodeList?.find((e) => e.num === epNum)?.title;
      recordWatch(anime.slug, anime.title, anime.cover, epNum, epTitle);
    }
  }, [anime, epNum, isLoggedIn, recordWatch, episodeMissing]);

  if (!anime) {
    return (
      <ErrorScreen
        code="404"
        title="Anime not found"
        message={`We couldn't find any series matching "${slug}". It may have been removed or the link is broken.`}
        onRetry={() => navigate("/discover")}
      />
    );
  }

  if (episodeMissing) {
    return (
      <ErrorScreen
        code="404"
        title="Episode not found"
        message={`Episode ${episode} of "${anime.title}" doesn't exist. This series has ${maxEps} episode${maxEps === 1 ? "" : "s"}.`}
        onRetry={() => navigate(`/anime/${anime.slug}`)}
      />
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

  const toggleFullscreen = async () => {
    const el = playerRef.current;
    if (!el) return;
    const screenOrient = screen.orientation as (ScreenOrientation & { lock?: (o: string) => Promise<void>; unlock?: () => void }) | undefined;
    if (!document.fullscreenElement) {
      try {
        await el.requestFullscreen?.();
        // On mobile, lock to landscape for a proper video viewing experience
        if (window.matchMedia("(max-width: 768px)").matches) {
          try { await screenOrient?.lock?.("landscape"); } catch { /* not supported */ }
        }
      } catch {
        toast("Fullscreen not supported", { position: "top-right" });
      }
    } else {
      try { screenOrient?.unlock?.(); } catch { /* ignore */ }
      document.exitFullscreen?.();
    }
  };

  const handleSnapshot = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (!v.videoWidth || !v.videoHeight) {
      toast("Start the video first to capture a frame", { position: "top-right" });
      return;
    }
    try {
      const canvas = document.createElement("canvas");
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no ctx");
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${anime.slug}-ep${epNum}-snapshot.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Snapshot saved");
      }, "image/png");
    } catch {
      toast.error("Couldn't capture frame (CORS restricted)");
    }
  };

  const handleReload = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    v.load();
    v.play().catch(() => {});
    toast("Video reloaded", { position: "top-right" });
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = SAMPLE_VIDEO_SRC;
    a.download = `${anime.slug}-ep${epNum}.mp4`;
    a.target = "_blank";
    a.rel = "noopener";
    a.click();
    toast.success("Download started");
  };

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      {/* Page dim overlay (Lightbulb). Player sits above it via z-index. */}
      {dimmed && (
        <div
          className="fixed inset-0 z-40 bg-black/85 pointer-events-none transition-opacity"
          aria-hidden="true"
        />
      )}
      <Sidebar />
      <BottomNav />
      <div className="md:ml-[70px]">
        <TopBar />

        {/* Video Player */}
        <div
          ref={playerRef}
          className={`relative w-full aspect-video bg-black max-h-[70vh] ${dimmed ? "z-50" : ""}`}
          style={dimmed ? { boxShadow: "0 0 60px 8px hsl(var(--primary) / 0.35)" } : undefined}
        >
          <video
            ref={videoRef}
            src={SAMPLE_VIDEO_SRC}
            crossOrigin="anonymous"
            controls
            playsInline
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
          <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded pointer-events-none">
            {audioMode.toUpperCase()} · {resolution} · Subs: {subtitle}
          </div>
          {/* Settings + Fullscreen overlay (top-right) */}
          <div className="absolute top-2 right-2 flex items-center gap-2 text-white">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="bg-black/50 hover:bg-black/70 p-1.5 rounded transition" aria-label="Settings"><Settings size={14} /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-card border-border">
                <DropdownMenuLabel className="text-foreground text-xs">Subtitles</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={subtitle} onValueChange={setSubtitle}>
                  {["Off", "English", "Spanish", "Japanese", "French", "German"].map((s) => (
                    <DropdownMenuRadioItem key={s} value={s} className="text-xs">{s}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-foreground text-xs">Resolution</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={resolution} onValueChange={setResolution}>
                  {["Auto", "1080p", "720p", "480p", "360p"].map((r) => (
                    <DropdownMenuRadioItem key={r} value={r} className="text-xs">{r}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <button onClick={toggleFullscreen} className="bg-black/50 hover:bg-black/70 p-1.5 rounded transition" aria-label="Fullscreen"><Maximize size={14} /></button>
          </div>
        </div>

        {/* Episode Nav Bar */}
        <div className={`flex items-center justify-between bg-card border-b border-border px-3 py-2 ${dimmed ? "relative z-50" : ""}`}>
          {epNum > 1 ? (
            <Link to={`/anime/${slug}/watch/${epNum - 1}`} className="text-muted-foreground hover:text-foreground transition">
              <ChevronLeft size={20} />
            </Link>
          ) : <div className="w-5" />}
          <div className="flex items-center gap-3 text-muted-foreground">
            <button className="hover:text-foreground transition" aria-label="Grid"><LayoutGrid size={14} /></button>
            <button
              onClick={() => setDimmed((d) => !d)}
              className={`transition ${dimmed ? "text-amber-400" : "hover:text-foreground"}`}
              aria-label="Lights"
              title={dimmed ? "Lights on" : "Lights off"}
            >
              <Lightbulb size={14} fill={dimmed ? "currentColor" : "none"} />
            </button>
            <button onClick={handleSnapshot} className="hover:text-foreground transition" aria-label="Screenshot" title="Capture frame"><Camera size={14} /></button>
            <button onClick={handleReload} className="hover:text-foreground transition" aria-label="Reload" title="Reload video"><RotateCw size={14} /></button>
            <button onClick={handleDownload} className="hover:text-foreground transition" aria-label="Download" title="Download video"><Download size={14} /></button>
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

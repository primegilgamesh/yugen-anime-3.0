import { Link, useNavigate } from "react-router-dom";
import { History as HistoryIcon, Trash2, ArrowLeft, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { useAuth } from "@/contexts/AuthContext";
import { useList } from "@/contexts/ListContext";
import historyBg from "@/assets/history-bg.jpg";
import AnimeArtwork from "@/components/AnimeArtwork";
import { resolveSlug } from "@/data/animeData";

const formatDate = (ts: number) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
};

const History = () => {
  const { isLoggedIn } = useAuth();
  const { history, clearHistory, removeHistoryItem } = useList();
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background pb-14 md:pb-0">
        <Sidebar />
        <BottomNav />
        <div className="md:ml-[70px]">
          <TopBar />
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <HistoryIcon size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-display font-bold text-lg mb-2">Sign in to view your history</p>
              <Link to="/signin" className="bg-primary text-primary-foreground text-sm font-semibold px-5 py-2 rounded-md hover:opacity-90 transition inline-block">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      <Sidebar />
      <BottomNav />
      <div className="md:ml-[70px] relative">
        <TopBar />
        <div
          className="absolute inset-0 top-12 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `linear-gradient(to bottom, hsl(var(--background) / 0.85), hsl(var(--background) / 0.95)), url(${historyBg})` }}
        />
        <div className="relative px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(-1)} className="text-foreground hover:text-primary p-1 -ml-1" aria-label="Back">
                <ArrowLeft size={18} />
              </button>
              <HistoryIcon size={18} className="text-primary" />
              <h1 className="text-foreground font-display font-bold text-lg">Watch History</h1>
              <span className="text-muted-foreground text-sm">({history.length})</span>
            </div>
            {history.length > 0 && (
              <button onClick={clearHistory} className="flex items-center gap-1 text-destructive text-xs hover:underline">
                <Trash2 size={12} /> Clear all
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-sm">No watch history yet. Start watching some episodes!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...history].sort((a, b) => b.watchedAt - a.watchedAt).map((h, i) => (
                <div key={`${h.slug}-${h.episode}-${i}`} className="group relative bg-card/60 backdrop-blur-sm rounded-md overflow-hidden border border-border hover:border-primary/50 transition-colors">
                  <Link to={`/anime/${h.slug}/watch/${h.episode}`} className="block">
                    <AnimeArtwork cover={resolveSlug(h.slug)?.cover || h.cover} className="relative aspect-video">
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                        EP {h.episode}
                      </div>
                      <div className="absolute bottom-1 right-1 bg-background/80 text-foreground text-[9px] px-1 py-0.5 rounded">24:00</div>
                    </AnimeArtwork>
                    <div className="p-2">
                      <p className="text-foreground text-[11px] font-medium leading-tight truncate group-hover:text-primary transition-colors">
                        {h.episode} : {h.episodeTitle || `Episode ${h.episode}`}
                      </p>
                      <Link to={`/anime/${h.slug}`} onClick={(e) => e.stopPropagation()} className="text-primary text-[10px] hover:underline truncate block">
                        {h.title}
                      </Link>
                      <p className="text-muted-foreground text-[9px] mt-0.5">Watched {formatDate(h.watchedAt)}</p>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeHistoryItem(h.slug, h.episode); }}
                    className="absolute top-1.5 right-1.5 bg-background/80 hover:bg-destructive text-foreground hover:text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    aria-label="Remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;

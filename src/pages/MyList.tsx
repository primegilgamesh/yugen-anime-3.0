import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { List, Heart, Eye, Clock, CheckCircle, XCircle, Star, ArrowLeft, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { useAuth } from "@/contexts/AuthContext";
import { useList, ListCategory } from "@/contexts/ListContext";
import { getGradient, allAnime } from "@/data/animeData";
import listBg from "@/assets/list-bg.jpg";
import AnimeArtwork from "@/components/AnimeArtwork";

const tabs = [
  { id: "favorites" as const, label: "Favorites", icon: Heart },
  { id: "plan-to-watch" as ListCategory, label: "Plan to Watch", icon: Clock },
  { id: "watching" as ListCategory, label: "Watching", icon: Eye },
  { id: "completed" as ListCategory, label: "Completed", icon: CheckCircle },
  { id: "dropped" as ListCategory, label: "Dropped", icon: XCircle },
];

const MyList = () => {
  const { isLoggedIn } = useAuth();
  const { listItems, favorites, removeFromList, toggleFavorite } = useList();
  const [activeTab, setActiveTab] = useState<string>("favorites");
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
              <List size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-display font-bold text-lg mb-2">Sign in to view your list</p>
              <Link to="/signin" className="bg-primary text-primary-foreground text-sm font-semibold px-5 py-2 rounded-md hover:opacity-90 transition inline-block">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentItems = activeTab === "favorites"
    ? [...favorites].sort((a, b) => b.addedAt - a.addedAt).map((f) => ({ slug: f.slug, title: f.title, cover: f.cover, episodesWatched: 0 }))
    : [...listItems].filter((i) => i.category === activeTab).sort((a, b) => b.addedAt - a.addedAt).map((i) => ({ slug: i.slug, title: i.title, cover: i.cover, episodesWatched: i.episodesWatched || 0 }));

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0 relative">
      <Sidebar />
      <BottomNav />
      <div className="md:ml-[70px] relative">
        <TopBar />
        {/* Picture background */}
        <div
          className="absolute inset-0 top-12 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `linear-gradient(to bottom, hsl(var(--background) / 0.85), hsl(var(--background) / 0.95)), url(${listBg})` }}
        />
        <div className="relative px-4 md:px-6 py-4">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => navigate(-1)} className="text-foreground hover:text-primary p-1 -ml-1" aria-label="Back">
              <ArrowLeft size={18} />
            </button>
            <List size={18} className="text-primary" />
            <h1 className="text-foreground font-display font-bold text-lg">My List</h1>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const count = tab.id === "favorites" ? favorites.length : listItems.filter((i) => i.category === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon size={14} />
                  {tab.label}
                  <span className="bg-background/30 px-1.5 py-0.5 rounded text-[10px]">{count}</span>
                </button>
              );
            })}
          </div>

          {currentItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-sm">No anime in this list yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
              {currentItems.map((item, i) => {
                const anime = allAnime.find((a) => a.slug === item.slug);
                const total = anime?.episodes || 0;
                return (
                  <div key={item.slug} className="group block relative">
                    <Link to={`/anime/${item.slug}`}>
                      <AnimeArtwork cover={anime?.cover || item.cover || getGradient(i)} className="relative rounded-md overflow-hidden aspect-[3/4]">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                        {item.episodesWatched > 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {item.episodesWatched}{total ? `/${total}` : ""} watched
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                          <p className="text-foreground text-xs font-semibold leading-tight truncate">{item.title}</p>
                        </div>
                      </AnimeArtwork>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (activeTab === "favorites") {
                          toggleFavorite(item.slug, item.title, item.cover);
                        } else {
                          removeFromList(item.slug);
                        }
                      }}
                      className="absolute top-1.5 right-1.5 bg-background/80 hover:bg-destructive text-foreground hover:text-destructive-foreground p-1 rounded-full transition-opacity z-10"
                      aria-label="Remove"
                    >
                      <X size={12} />
                    </button>
                    <div className="mt-1.5">
                      <p className="text-foreground text-xs font-medium truncate group-hover:text-primary transition-colors">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {anime?.score && (
                          <span className="flex items-center gap-0.5 text-score-star text-[10px]">
                            <Star size={9} fill="currentColor" /> {anime.score.toFixed(2)}
                          </span>
                        )}
                        {item.episodesWatched > 0 && total > 0 && (
                          <span className="text-muted-foreground text-[10px]">EP {item.episodesWatched}/{total}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyList;

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { getGradient } from "@/data/animeData";
import { recentEpisodes } from "@/data/recentEpisodes";

const ITEMS_PER_PAGE = 25;

const Recents = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "sub" | "chinese">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return recentEpisodes;
    return recentEpisodes.filter((e) => e.language === filter);
  }, [filter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEpisodes = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-1 mt-8">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="text-muted-foreground hover:text-foreground text-xs px-2 py-1.5 disabled:opacity-40"
        >
          Previous
        </button>
        {pages.map((page, i) =>
          typeof page === "string" ? (
            <span key={`ellipsis-${i}`} className="text-muted-foreground text-xs px-1">
              {page}
            </span>
          ) : (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`text-xs min-w-[28px] h-7 rounded transition-colors ${
                page === currentPage
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="text-muted-foreground hover:text-foreground text-xs px-2 py-1.5 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      <Sidebar />
      <BottomNav />
      <div className="md:ml-[70px]">
        <TopBar />
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              <h1 className="text-foreground font-display font-bold text-lg">Recently Released</h1>
            </div>
            <div className="flex items-center gap-1 bg-card border border-border rounded-md p-0.5">
              {(["all", "sub", "chinese"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setCurrentPage(1); }}
                  className={`text-[11px] font-semibold px-3 py-1 rounded transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {f === "all" ? "All" : f === "sub" ? "Sub" : "Chinese"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {pageEpisodes.map((ep, i) => (
              <Link
                to={`/anime/${ep.slug}/watch/${ep.episode}`}
                key={`${ep.slug}-${i}`}
                className="group block"
              >
                <div
                  className={`relative rounded-md overflow-hidden bg-gradient-to-br ${getGradient(ep.gradient)} aspect-video`}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                    EP {ep.episode}
                  </div>
                  <div className="absolute bottom-1 right-1 bg-background/80 text-foreground text-[9px] px-1 py-0.5 rounded">
                    {ep.duration}
                  </div>
                </div>
                <div className="mt-1.5">
                  <p className="text-foreground text-[11px] font-medium leading-tight truncate group-hover:text-primary transition-colors">
                    {ep.episode} : {ep.title}
                  </p>
                  <Link
                    to={`/anime/${ep.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary text-[10px] hover:underline truncate block"
                  >
                    {ep.title}
                  </Link>
                  <p className="text-muted-foreground text-[9px]">
                    {ep.views} · {ep.timeAgo}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default Recents;

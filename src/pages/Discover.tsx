import { useState, useEffect } from "react";
import { Compass, Search, ChevronDown, ChevronUp, Star, Headphones, ArrowRight, X, SlidersHorizontal } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { allAnime, getGradient } from "@/data/animeData";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 42;

const ALL_GENRES = [
  "Action","Adventure","Avant Garde","Boys Love","Cars","Comedy","Dementia","Demons","Drama",
  "Ecchi","Fantasy","Game","Girls Love","Gourmet","Harem","Hentai","Historical","Horror",
  "Isekai","Iyashikei","Josei","Kids","Magic","Martial Arts","Mecha","Military","Music","Mystery",
  "Parody","Police","Psychological","Reverse Harem","Romance","Samurai","School","Sci-Fi","Seinen",
  "Shoujo","Shoujo Ai","Shounen","Shounen Ai","Slice of Life","Space","Sports","Suspense",
  "Super Power","Supernatural","Survival","Thriller","Time Travel","Vampire","Workplace",
  "Yaoi","Yuri","Mahou Shoujo","Post-Apocalyptic","Cyberpunk","Detective","Tragedy",
];

const SEASONS = ["Any","Winter","Spring","Summer","Fall"];
const STATUSES = ["Any","Currently Airing","Finished Airing","Not Yet Aired"];
const SORTS = ["Ascending","Descending","Score ↓","Score ↑"];
const LANGUAGES = ["Both","Sub Only","Dub Available"];

const Discover = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [season, setSeason] = useState("Any");
  const [status, setStatus] = useState("Any");
  const [sort, setSort] = useState("Ascending");
  const [language, setLanguage] = useState("Both");
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const s = searchParams.get("search");
    if (s) { setSearch(s); }
  }, [searchParams]);

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
    setCurrentPage(1);
  };

  const filteredAnime = allAnime.filter((a) => {
    if (search) {
      const q = search.toLowerCase();
      if (!a.title.toLowerCase().includes(q) && !a.titleEnglish?.toLowerCase().includes(q) && !a.titleRomaji?.toLowerCase().includes(q)) return false;
    }
    if (selectedGenres.length > 0 && !selectedGenres.some((g) => a.genres?.includes(g))) return false;
    if (season !== "Any" && !a.season?.startsWith(season)) return false;
    if (status !== "Any" && a.status !== status) return false;
    if (language === "Sub Only" && a.dubbed) return false;
    if (language === "Dub Available" && !a.dubbed) return false;
    return true;
  });

  const sortedAnime = [...filteredAnime].sort((a, b) => {
    if (sort === "Ascending") return a.title.localeCompare(b.title);
    if (sort === "Descending") return b.title.localeCompare(a.title);
    if (sort === "Score ↓") return (b.score || 0) - (a.score || 0);
    if (sort === "Score ↑") return (a.score || 0) - (b.score || 0);
    return 0;
  });

  const totalPages = Math.ceil(sortedAnime.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageAnime = sortedAnime.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const visibleGenres = showAllGenres ? ALL_GENRES : ALL_GENRES.slice(0, 15);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages: (number | string)[] = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return (
      <div className="flex items-center justify-center gap-1 mt-8">
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="text-muted-foreground hover:text-foreground text-xs px-2 py-1.5 disabled:opacity-40">Previous</button>
        {pages.map((page, i) =>
          typeof page === "string" ? <span key={`e-${i}`} className="text-muted-foreground text-xs px-1">{page}</span> : (
            <button key={page} onClick={() => setCurrentPage(page)} className={`text-xs min-w-[28px] h-7 rounded transition-colors ${page === currentPage ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>{page}</button>
          )
        )}
        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="text-muted-foreground hover:text-foreground text-xs px-2 py-1.5 disabled:opacity-40">Next</button>
      </div>
    );
  };

  const SelectDropdown = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
    <div>
      <p className="text-foreground font-semibold text-sm mb-1">{label}</p>
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full bg-secondary text-foreground text-sm rounded-md px-3 py-2 border-none outline-none cursor-pointer flex items-center justify-between hover:bg-secondary/80 transition-colors">
          <span>{value}</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] bg-card border-border z-[110]">
          {options.map((o) => (
            <DropdownMenuItem
              key={o}
              onClick={() => { onChange(o); setCurrentPage(1); }}
              className={`text-sm cursor-pointer ${value === o ? "text-primary font-medium" : "text-foreground"}`}
            >
              {o}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const filterContent = (
    <div className="space-y-4">
      <h2 className="text-foreground font-display font-bold text-lg">Filtering</h2>
      <div className="relative">
        <div className="flex items-center bg-secondary rounded-md px-3 py-2 gap-2">
          <Search size={14} className="text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search discover" className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
        </div>
      </div>
      <SelectDropdown label="Season" value={season} options={SEASONS} onChange={setSeason} />
      <div>
        <p className="text-foreground font-semibold text-sm mb-2">Genres</p>
        <div className="flex flex-wrap gap-1.5">
          {visibleGenres.map((g) => (
            <button key={g} onClick={() => toggleGenre(g)} className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${selectedGenres.includes(g) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:text-foreground"}`}>{g}</button>
          ))}
        </div>
        <button onClick={() => setShowAllGenres((v) => !v)} className="text-primary text-xs mt-2 flex items-center gap-1">
          {showAllGenres ? <><ChevronUp size={12} /> View Less</> : <><ChevronDown size={12} /> View More</>}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SelectDropdown label="Sort" value={sort} options={SORTS} onChange={setSort} />
        <SelectDropdown label="Status" value={status} options={STATUSES} onChange={setStatus} />
      </div>
      <SelectDropdown label="Language" value={language} options={LANGUAGES} onChange={setLanguage} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      <Sidebar />
      <BottomNav />
      <div className="md:ml-[70px]">
        <TopBar />
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-primary" />
              <h1 className="text-foreground font-display font-bold text-lg">
                Discover <span className="text-muted-foreground font-normal text-sm">({sortedAnime.length})</span>
              </h1>
            </div>
            <button onClick={() => setFilterOpen((v) => !v)} className="flex items-center gap-1.5 text-primary text-sm font-medium bg-card border border-border px-3 py-1.5 rounded-md hover:bg-secondary transition-colors">
              <SlidersHorizontal size={14} /> Filtering
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {pageAnime.map((anime, i) => (
              <Link to={`/anime/${anime.slug}`} key={anime.slug} className="group block">
                <div className={`relative rounded-md overflow-hidden bg-gradient-to-br ${getGradient(startIdx + i)} aspect-[3/4]`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  {anime.dubbed && (
                    <div className="absolute bottom-8 left-1.5 bg-card/80 text-foreground text-[9px] flex items-center gap-0.5 px-1.5 py-0.5 rounded">
                      <Headphones size={10} /> Available in Dub
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-foreground text-xs font-semibold leading-tight truncate">{anime.title}</p>
                  </div>
                </div>
                <div className="mt-1.5">
                  <p className="text-foreground text-xs font-medium truncate group-hover:text-primary transition-colors">{anime.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {anime.season && <span className="text-muted-foreground text-[10px]">{anime.season}</span>}
                    {anime.score && <span className="flex items-center gap-0.5 text-score-star text-[10px]"><Star size={9} fill="currentColor" /> {anime.score.toFixed(2)}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {pageAnime.length === 0 && <p className="text-muted-foreground text-sm text-center py-16">No anime found matching your filters.</p>}
          {renderPagination()}
        </div>

        {/* Slide-out filter panel - desktop (next to sidebar) */}
        {filterOpen && (
          <>
            <div className="fixed inset-0 z-[45] hidden md:block" onClick={() => setFilterOpen(false)} />
            <div className="fixed left-[70px] top-0 h-full w-80 z-[55] bg-card border-r border-border shadow-xl overflow-y-auto hidden md:block">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-foreground font-display font-bold text-lg">Filtering</h2>
                  <button onClick={() => setFilterOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                </div>
                {filterContent}
              </div>
            </div>
          </>
        )}

        {/* Mobile filter overlay */}
        {filterOpen && (
          <div className="fixed inset-0 z-[100] bg-background md:hidden overflow-y-auto">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-foreground font-display font-bold text-lg">Filtering</h2>
                <button onClick={() => setFilterOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
              </div>
              {filterContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;

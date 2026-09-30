import { useState, useEffect, useRef, TouchEvent, useMemo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Sparkles, HeartHandshake, Plus, Flame, MessageSquareText, Star, Play, ChevronLeft, ChevronRight, Headphones, ThumbsUp, Clock } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import SectionHeader from "@/components/SectionHeader";
import {
  heroPicks,
  trendingAiring,
  editorsPick,
  underratedSeries,
  newOnYugen,
  mostPopular,
  getGradient,
  allAnime,
} from "@/data/animeData";
import { recentEpisodes } from "@/data/recentEpisodes";
import { useReviewLikes } from "@/contexts/ReviewLikesContext";

const HOME_OVERRIDES_KEY = "yugen_home_overrides";
const useHomeOverrides = () => {
  const [overrides, setOverrides] = useState<Record<string, string[]>>(() => {
    try { return JSON.parse(localStorage.getItem(HOME_OVERRIDES_KEY) || "{}"); } catch { return {}; }
  });
  useEffect(() => {
    const handler = () => {
      try { setOverrides(JSON.parse(localStorage.getItem(HOME_OVERRIDES_KEY) || "{}")); } catch { setOverrides({}); }
    };
    window.addEventListener("yugen-home-overrides-update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("yugen-home-overrides-update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return overrides;
};

const resolveSlugs = (slugs: string[] | undefined, fallback: any[]): any[] => {
  if (!slugs || slugs.length === 0) return fallback;
  return slugs.map((s) => allAnime.find((a) => a.slug === s)).filter(Boolean) as any[];
};


const reviews = [
  { id: "home-rev-1", anime: "I've Got a Million Skill Points!", slug: "million-skill-points", user: "MadSlime", quote: "when will this be out i kinda want to watch it so bad its hurting my last brain cell, c'mon guys release it already, i cannnot", time: "about 6 hours ago", likes: 0, gradient: 2 },
  { id: "home-rev-2", anime: "Plastic Memories", slug: "plastic-memories", user: "TimmyFlame", quote: "Heartfelt story with interesting takeaways", time: "about 14 hours ago", likes: 0, gradient: 5 },
  { id: "home-rev-3", anime: "Kusuriya no Hitorigoto", slug: "kusuriya-no-hitorigoto", user: "Maya_cato78", quote: "TALENTED SHIKISO LMFAOOOOOOO", time: "a day ago", likes: 7, gradient: 1 },
  { id: "home-rev-4", anime: "Youkoso Jitsuryoku Shijou Shugi no Classroom e 3rd Season", slug: "youkoso-jitsuryoku", user: "Treyennes", quote: "School anime at it's best", time: "a day ago", likes: 3, gradient: 8 },
  { id: "home-rev-5", anime: "Sousou no Frieren", slug: "frieren", user: "AniChiwa", quote: "Best anime in this genre!", time: "a day ago", likes: 0, gradient: 0 },
  { id: "home-rev-6", anime: "I've Got a Million Skill Points!", slug: "million-skill-points", user: "NightShade587", quote: "Some descriptions, I should be clear, the anime is alright because it currently has no description.", time: "2 days ago", likes: 1, gradient: 3 },
];

// Default 5 hero slides; admins can override via the Admin Home Layout tab.
const defaultHeroSlides = [
  ...heroPicks,
  ...allAnime.filter((a) => !heroPicks.find((h) => h.slug === a.slug)).slice(0, 5),
].slice(0, 5);

const Home = () => {
  const { isLiked, toggleLike, getCount } = useReviewLikes();
  const overrides = useHomeOverrides();
  const heroSlides = useMemo(() => {
    const custom = resolveSlugs(overrides.heroSlides, []);
    return custom.length > 0 ? custom.slice(0, 8) : defaultHeroSlides;
  }, [overrides]);
  const trendingList = useMemo(() => resolveSlugs(overrides.trendingAiring, trendingAiring), [overrides]);
  const editorsList = useMemo(() => resolveSlugs(overrides.editorsPick, editorsPick), [overrides]);
  const underratedList = useMemo(() => resolveSlugs(overrides.underratedSeries, underratedSeries), [overrides]);
  const newList = useMemo(() => resolveSlugs(overrides.newOnYugen, newOnYugen), [overrides]);
  const popularList = useMemo(() => resolveSlugs(overrides.mostPopular, mostPopular), [overrides]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const SLIDE_DURATION = 5 * 1000;

  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, SLIDE_DURATION);
    return () => clearTimeout(t);
  }, [currentSlide]);

  const handleTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      setCurrentSlide((p) => diff > 0 ? (p + 1) % heroSlides.length : (p - 1 + heroSlides.length) % heroSlides.length);
    }
  };

  const AnimePortraitCard = ({ anime, i }: { anime: typeof trendingAiring[0]; i: number }) => (
    <Link to={`/anime/${anime.slug}`} key={anime.slug} className="group block">
      <div className={`relative rounded-md overflow-hidden bg-gradient-to-br ${getGradient(i)} aspect-[3/4]`}>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        {anime.dubbed && <div className="absolute bottom-8 left-1.5 bg-card/80 text-foreground text-[9px] flex items-center gap-0.5 px-1.5 py-0.5 rounded"><Headphones size={10} /> Available in Dub</div>}
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
  );

  const RecentlyReleasedSection = () => {
    const [filter, setFilter] = useState<"all" | "sub" | "chinese">("all");
    const items = useMemo(() => {
      const list = filter === "all" ? recentEpisodes : recentEpisodes.filter((e) => e.language === filter);
      return list.slice(0, 10);
    }, [filter]);
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader icon={Clock} title="Recently Released" iconColor="text-primary" href="/recents" />
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-md p-0.5 w-fit mb-3 -mt-1">
          {(["all", "sub", "chinese"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] font-semibold px-3 py-1 rounded transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f === "all" ? "All" : f === "sub" ? "Sub" : "Chinese"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {items.map((ep, i) => (
            <Link to={`/anime/${ep.slug}/watch/${ep.episode}`} key={`${ep.slug}-${i}`} className="group block">
              <div className={`relative rounded-md overflow-hidden bg-gradient-to-br ${getGradient(ep.gradient)} aspect-video`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">EP {ep.episode}</div>
                <div className="absolute bottom-1 right-1 bg-background/80 text-foreground text-[9px] px-1 py-0.5 rounded">{ep.duration}</div>
              </div>
              <div className="mt-1.5">
                <p className="text-foreground text-[11px] font-medium leading-tight truncate group-hover:text-primary transition-colors">{ep.episode} : {ep.title}</p>
                <p className="text-status-watching text-[10px] truncate">{ep.title}</p>
                <p className="text-muted-foreground text-[9px]">{ep.views} · {ep.timeAgo}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      <Sidebar />
      <BottomNav />
      <div className="md:ml-[70px]">
        <TopBar />

        {/* Hero Slideshow — matches original YugenAnime spotlight */}
        <div className="px-4 md:px-6 pt-4">
        <div
          className="relative w-full h-[220px] md:h-[395px] overflow-hidden rounded-md bg-card"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {heroSlides.map((pick, i) => (
            <div
              key={pick.slug + i}
              className={`absolute inset-0 transition-opacity duration-700 ${i === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
            >
              {/* Blurred banner background */}
              <Link to={`/anime/${pick.slug}`} className="absolute inset-0 overflow-hidden">
                <div className={`absolute -inset-6 bg-gradient-to-br ${pick.cover} blur-xl scale-110 opacity-70`} />
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/20" />
              </Link>

              {/* Slanted poster with white edges */}
              <Link
                to={`/anime/${pick.slug}`}
                className="absolute top-0 bottom-0 right-[6%] w-[42%] md:w-[36%] hidden sm:block"
                style={{ clipPath: "polygon(24% 0, 100% 0, 76% 100%, 0 100%)" }}
              >
                <div className="absolute inset-0 bg-foreground" />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${pick.cover}`}
                  style={{ clipPath: "polygon(calc(24% + 16px) 0, calc(100% - 16px) 0, calc(76% - 16px) 100%, 16px 100%)" }}
                />
              </Link>

              {/* Text content */}
              <div className="absolute inset-y-0 left-5 right-5 sm:right-[45%] md:left-[60px] flex flex-col justify-center">
                <span className="text-primary text-xs md:text-sm font-semibold">#{i + 1} Spotlight</span>
                <Link to={`/anime/${pick.slug}`}>
                  <h2 className="font-display text-xl md:text-[34px] md:leading-[1] font-bold text-foreground mt-2 line-clamp-2">{pick.title}</h2>
                </Link>
                <p className="text-foreground/90 text-[13px] mt-3 max-w-[520px] leading-snug line-clamp-3 hidden md:block">
                  {pick.synopsis?.slice(0, 180)}...
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <Link to={`/anime/${pick.slug}/watch/1`} className="bg-primary text-primary-foreground text-xs font-medium px-4 py-3 rounded-sm flex items-center gap-1.5 hover:opacity-90">
                    <Play size={14} fill="currentColor" /> Watch Now
                  </Link>
                  <Link to={`/anime/${pick.slug}`} className="text-foreground text-xs font-medium flex items-center gap-1.5 hover:text-primary">
                    <Play size={14} /> View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] z-20">
            <div
              key={currentSlide}
              className="h-full bg-primary"
              style={{ animation: `hero-progress ${SLIDE_DURATION}ms linear forwards` }}
            />
          </div>
          <style>{`@keyframes hero-progress{from{width:0}to{width:100%}}`}</style>
        </div>
        </div>

        <div className="px-4 md:px-6 py-4 space-y-8">
          {/* Recently Released - moved above Trending; shares data with /recents */}
          <RecentlyReleasedSection />

          {/* Trending Airing - 6 per row */}
          <section>
            <SectionHeader icon={TrendingUp} title="Trending Airing Series" iconColor="text-primary" href="/trending" />
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {trendingList.map((anime, i) => <AnimePortraitCard key={anime.slug} anime={anime} i={i} />)}
            </div>
          </section>

          {/* Editor's Pick + Underrated - joined sections */}
          <div className="relative overflow-hidden rounded-lg bg-card border border-border">
            {/* Editor's Pick section */}
            <div className="relative p-4 md:p-6 pb-6">
              {/* Top-right corner embedded image */}
              <div className="absolute top-0 right-0 w-28 h-28 md:w-40 md:h-40 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[200%] h-[200%] bg-primary/10 -rotate-45 -translate-x-[30%] -translate-y-[30%]" />
                <div className={`absolute top-2 right-2 w-14 h-18 md:w-20 md:h-28 rounded-md bg-gradient-to-br ${getGradient(6)} shadow-lg border border-border`} />
              </div>
              <SectionHeader icon={Sparkles} title="Editor's Pick" iconColor="text-score-star" hideArrow />
              <p className="text-muted-foreground text-[11px] mb-3 -mt-2">This is our favorite picks of all time</p>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 relative z-10">
                {editorsList.map((anime, i) => <AnimePortraitCard key={anime.slug} anime={anime} i={i + 6} />)}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Underrated section */}
            <div className="relative p-4 md:p-6 pt-6">
              {/* Bottom-left corner embedded image */}
              <div className="absolute bottom-0 left-0 w-28 h-28 md:w-40 md:h-40 overflow-hidden pointer-events-none">
                <div className="absolute bottom-0 left-0 w-[200%] h-[200%] bg-primary/10 -rotate-45 translate-x-[-30%] translate-y-[30%]" />
                <div className={`absolute bottom-2 left-2 w-14 h-18 md:w-20 md:h-28 rounded-md bg-gradient-to-br ${getGradient(3)} shadow-lg border border-border`} />
              </div>
              <SectionHeader icon={HeartHandshake} title="Underrated Series" iconColor="text-heart" hideArrow />
              <p className="text-muted-foreground text-[11px] mb-3 -mt-2">Real gems that should get the attention they deserve</p>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 relative z-10">
                {underratedList.map((anime, i) => <AnimePortraitCard key={anime.slug} anime={anime} i={i + 3} />)}
              </div>
            </div>
          </div>

          {/* New on YugenAnime - 6 per row */}
          <section>
            <SectionHeader icon={Plus} title="New on YugenAnime" iconColor="text-primary" href="/new" />
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {newList.map((anime, i) => <AnimePortraitCard key={anime.slug} anime={anime} i={i + 9} />)}
            </div>
          </section>

          {/* Most Popular - 6 per row */}
          <section>
            <SectionHeader icon={Flame} title="Most Popular Series" iconColor="text-score-star" href="/popular" />
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {popularList.map((anime, i) => <AnimePortraitCard key={anime.slug} anime={anime} i={i} />)}
            </div>
          </section>

          {/* Recent Reviews - 4 per row desktop */}
          <section>
            <SectionHeader icon={MessageSquareText} title="Recent YugenAnime Reviews" iconColor="text-primary" href="/reviews" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {reviews.map((review, i) => {
                const liked = isLiked(review.id);
                const count = getCount(review.id, review.likes);
                return (
                  <div key={i} className="bg-card border border-border rounded-lg overflow-hidden group hover:border-primary/50 transition-colors">
                    <Link to={`/anime/${review.slug}?tab=Reviews`}>
                      <div className={`w-full h-28 bg-gradient-to-br ${getGradient(review.gradient)}`} />
                    </Link>
                    <div className="p-3">
                      <Link to={`/anime/${review.slug}?tab=Reviews`} className="text-primary text-[11px] font-medium group-hover:underline block">Review of {review.anime} by {review.user}</Link>
                      <p className="text-secondary-foreground text-xs italic mt-1">"{review.quote}"</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-muted-foreground text-[10px]">{review.time}</span>
                        <button onClick={() => toggleLike(review.id)} className={`text-[10px] flex items-center gap-1 transition ${liked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
                          <ThumbsUp size={10} fill={liked ? "currentColor" : "none"} /> {count}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;

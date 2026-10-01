import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import AnimeTabs from "@/components/AnimeTabs";
import AnimeInfoSidebar from "@/components/AnimeInfoSidebar";
import MobileAnimeInfo from "@/components/MobileAnimeInfo";
import MobileDescription from "@/components/MobileDescription";
import StatusDistribution from "@/components/StatusDistribution";
import EpisodeGrid from "@/components/EpisodeGrid";
import ReviewsSection from "@/components/ReviewsSection";
import AnimeHeroBanner from "@/components/AnimeHeroBanner";
import TrailerSection from "@/components/TrailerSection";
import AnimeArtwork from "@/components/AnimeArtwork";
import { allAnime, getRelatedSeasons, resolveSlug } from "@/data/animeData";
import { Link } from "react-router-dom";

const AnimePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "Overview");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["Overview", "Watch", "Reviews"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    if (tab === "Overview") next.delete("tab");
    else next.set("tab", tab);
    setSearchParams(next, { replace: true });
  };

  const goToReviews = () => handleTabChange("Reviews");

  const found = resolveSlug(slug);

  if (!found) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground text-lg">Anime not found</p>
      </div>
    );
  }

  // Provide fallback synopsis & trailer for every anime
  const anime = {
    ...found,
    synopsis: found.synopsis || `${found.title} is a ${found.genres || "captivating"} ${found.format || "anime"} series ${found.season ? `that premiered in ${found.season}` : ""}${found.studios ? ` by ${found.studios}` : ""}. Follow an unforgettable journey filled with memorable characters, breathtaking visuals, and an immersive story that fans of the genre will love.`,
    trailerUrl: found.trailerUrl || "https://www.youtube.com/embed/qgQBwRJVBdU",
  };

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      <Sidebar />
      <BottomNav />
      <div className="md:ml-[70px]">
        <TopBar />
        <AnimeHeroBanner anime={anime} />
        <AnimeTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="py-4">
          <MobileAnimeInfo anime={anime} hideReviewButton={activeTab === "Reviews"} onWriteReview={goToReviews} />
        </div>

        <div className="flex gap-6 md:gap-14 p-4 md:p-6">
          <div className="w-64 flex-shrink-0 hidden md:block">
            <AnimeInfoSidebar anime={anime} hideReviewButton={activeTab === "Reviews"} onWriteReview={goToReviews} />
          </div>
          <div className="flex-1 min-w-0 space-y-6 md:space-y-8">
            {activeTab === "Overview" && (
              <>
                <MobileDescription synopsis={anime.synopsis || ""} />
                <div className="hidden md:block space-y-2">
                  <h3 className="text-foreground font-display font-semibold text-base">Synopsis</h3>
                  <p className="text-secondary-foreground text-sm leading-relaxed">
                    {anime.synopsis}
                  </p>
                </div>
                <TrailerSection trailerUrl={anime.trailerUrl} />
                {(() => {
                  const related = getRelatedSeasons(anime.slug);
                  if (related.length === 0) return null;
                  return (
                    <div className="space-y-3">
                      <h3 className="text-foreground font-display font-semibold text-base">Related Seasons & Movies</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {related.map((r) => (
                          <Link to={`/anime/${r.slug}`} key={r.slug} className="group block">
                            <AnimeArtwork cover={r.cover} className="relative aspect-[3/4] rounded-md overflow-hidden">
                              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-foreground text-xs font-semibold truncate">{r.title}</p>
                                <p className="text-muted-foreground text-[10px]">{r.format || "TV"} · {r.season}</p>
                              </div>
                            </AnimeArtwork>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                <StatusDistribution slug={anime.slug} />
              </>
            )}
            {activeTab === "Watch" && (
              <EpisodeGrid
                episodes={anime.episodes || 12}
                title={anime.title}
                slug={anime.slug}
                episodeList={anime.episodeList}
              />
            )}
            {activeTab === "Reviews" && <ReviewsSection slug={anime.slug} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimePage;

import { useEffect, useState } from "react";
import { Star, Heart } from "lucide-react";
import { toast } from "sonner";
import { AnimeEntry } from "@/data/animeData";
import { useAuth } from "@/contexts/AuthContext";
import { aggregateAnimeStats, averageUserScore } from "@/lib/animeStats";

interface Props {
  anime: AnimeEntry;
  hideReviewButton?: boolean;
  onWriteReview?: () => void;
}

const MobileAnimeInfo = ({ anime, hideReviewButton, onWriteReview }: Props) => {
  const { isLoggedIn } = useAuth();
  const [stats, setStats] = useState(() => aggregateAnimeStats(anime.slug));
  const [avg, setAvg] = useState<number | null>(() => averageUserScore(anime.slug));
  useEffect(() => {
    const update = () => { setStats(aggregateAnimeStats(anime.slug)); setAvg(averageUserScore(anime.slug)); };
    update();
    window.addEventListener("storage", update);
    window.addEventListener("yugen-favs-update", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("yugen-favs-update", update);
    };
  }, [anime.slug]);
  // Reflects real users who favorited this anime (one per account).
  const totalFavs = stats.favorites;
  const displayScore = avg != null ? avg : anime.score;

  const handleWriteReview = () => {
    if (!isLoggedIn) {
      toast("Please login first to write a review", {
        style: { background: "hsla(30, 90%, 50%, 0.85)", color: "white", border: "none" },
        position: "top-right",
      });
      return;
    }
    onWriteReview?.();
  };

  const infoColumns = [
    { label: "Romaji", value: anime.titleRomaji || anime.titleEnglish || anime.title },
    { label: "Native", value: anime.titleNative || "—" },
    { label: "Synonyms", value: anime.synonyms || "—" },
    { label: "Format", value: anime.format || "TV" },
    { label: "Studios", value: anime.studios || "—" },
    { label: "Episodes", value: String(anime.episodes || "—") },
    ...(anime.episodesDub ? [{ label: "Episodes (Dub)", value: String(anime.episodesDub) }] : []),
    { label: "Status", value: anime.status || "—" },
    { label: "Premiered", value: anime.premiered || anime.season || "—" },
    { label: "Genres", value: anime.genres || "—" },
    { label: "External Links", value: "MAL · AniList · SIMKL" },
  ];

  return (
    <div className="md:hidden px-4 space-y-3">
      <div className="flex flex-col gap-2">
        <button className="w-full flex items-center justify-center gap-2 bg-score-star/20 text-score-star font-semibold text-sm py-2.5 rounded-md">
          <Star size={16} fill="currentColor" />
          {displayScore?.toFixed(2) || "—"} Average Score
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-heart/20 text-heart font-semibold text-sm py-2.5 rounded-md">
          <Heart size={16} fill="currentColor" />
          {totalFavs.toLocaleString()} Favorites
        </button>
      </div>
      <div className="overflow-x-auto border-b border-border pb-3">
        <div className="flex gap-4 min-w-max">
          {infoColumns.map(({ label, value }) => (
            <div key={label} className="min-w-[100px] max-w-[140px]">
              <div className="text-primary text-xs font-medium">{label}</div>
              <div className="text-foreground text-xs">{value}</div>
            </div>
          ))}
        </div>
      </div>
      {!hideReviewButton && (
        <button
          onClick={handleWriteReview}
          className="w-full bg-primary text-primary-foreground font-semibold text-sm py-2.5 rounded-md hover:opacity-90 transition"
        >
          Write a Review
        </button>
      )}
    </div>
  );
};

export default MobileAnimeInfo;

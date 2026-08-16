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

const AnimeInfoSidebar = ({ anime, hideReviewButton, onWriteReview }: Props) => {
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

  const infoItems = [
    { label: "Romaji", value: anime.titleRomaji || anime.title },
    { label: "English", value: anime.titleEnglish || anime.title },
    { label: "Native", value: anime.titleNative || "—" },
    ...(anime.synonyms ? [{ label: "Synonyms", value: anime.synonyms }] : []),
    { label: "Format", value: anime.format || "TV" },
    { label: "Studios", value: anime.studios || "—" },
    { label: "Episodes", value: String(anime.episodes || "—") },
    ...(anime.episodesDub ? [{ label: "Episodes (Dub)", value: String(anime.episodesDub) }] : []),
    { label: "Episodes Duration", value: anime.duration || "24 min per ep" },
    { label: "Status", value: anime.status || "—" },
    { label: "Premiered", value: anime.premiered || anime.season || "—" },
    { label: "Genres", value: anime.genres || "—" },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Average Score & Favorites as full-width buttons */}
      <div className="w-full bg-muted rounded-md px-4 py-2.5 flex items-center gap-2">
        <Star size={16} className="text-score-star" fill="currentColor" />
        <span className="text-foreground font-semibold text-sm">{displayScore?.toFixed(2) || "—"} Average Score</span>
      </div>
      <div className="w-full bg-muted rounded-md px-4 py-2.5 flex items-center gap-2">
        <Heart size={16} className="text-heart" fill="currentColor" />
        <span className="text-foreground text-sm">{totalFavs.toLocaleString()} Favorites</span>
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        {infoItems.map(({ label, value }) => (
          <div key={label}>
            <div className="text-primary text-xs font-medium">{label}</div>
            <div className="text-foreground text-sm">{value}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-4">
        <div className="text-primary text-xs font-medium mb-1">External Links</div>
        <div className="text-muted-foreground text-sm">MyAnimeList · AniList · SIMKL</div>
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

export default AnimeInfoSidebar;

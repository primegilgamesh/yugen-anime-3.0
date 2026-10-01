import { Link } from "react-router-dom";
import { Star, Headphones } from "lucide-react";
import AnimeArtwork from "@/components/AnimeArtwork";

interface AnimeCardProps {
  slug: string;
  title: string;
  season?: string;
  score?: number;
  gradient: string;
  dubbed?: boolean;
  variant?: "default" | "wide" | "numbered";
  number?: number;
  subtitle?: string;
}

const AnimeCard = ({ slug, title, season, score, gradient, dubbed, variant = "default", number, subtitle }: AnimeCardProps) => (
  <Link to={`/anime/${slug}`} className="group block">
    <AnimeArtwork cover={gradient} className={`relative rounded-md overflow-hidden ${variant === "wide" ? "aspect-[16/10]" : "aspect-[3/4]"}`}>
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
      {/* Number badge */}
      {variant === "numbered" && number !== undefined && (
        <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded">
          {number}
        </div>
      )}
      {/* Dubbed badge */}
      {dubbed && (
        <div className="absolute bottom-8 left-1.5 bg-transparent text-foreground text-[9px] flex items-center gap-0.5 px-1.5 py-0.5 rounded drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          <Headphones size={10} /> Available in Dub
        </div>
      )}
      {/* Title overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-foreground text-xs font-semibold leading-tight truncate">{title}</p>
      </div>
    </AnimeArtwork>
    <div className="mt-1.5">
      <p className="text-foreground text-xs font-medium truncate group-hover:text-primary transition-colors">{title}</p>
      <div className="flex items-center gap-2 mt-0.5">
        {season && <span className="text-muted-foreground text-[10px]">{season}</span>}
        {score && (
          <span className="flex items-center gap-0.5 text-score-star text-[10px]">
            <Star size={9} fill="currentColor" /> {score.toFixed(2)}
          </span>
        )}
      </div>
      {subtitle && <p className="text-muted-foreground text-[10px] mt-0.5 truncate">{subtitle}</p>}
    </div>
  </Link>
);

export default AnimeCard;

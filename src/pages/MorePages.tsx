import { Link } from "react-router-dom";
import { Star, Headphones, Plus, Flame, MessageSquareText, ThumbsUp, type LucideIcon } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { newOnYugen, mostPopular, allAnime, getGradient, AnimeEntry } from "@/data/animeData";
import { useReviewLikes } from "@/contexts/ReviewLikesContext";
import AnimeArtwork from "@/components/AnimeArtwork";

const reviews = [
  { id: "more-rev-1", anime: "I've Got a Million Skill Points!", slug: "million-skill-points", user: "MadSlime", quote: "when will this be out i kinda want to watch it so bad its hurting my last brain cell", time: "about 6 hours ago", likes: 0, gradient: 2 },
  { id: "more-rev-2", anime: "Plastic Memories", slug: "plastic-memories", user: "TimmyFlame", quote: "Heartfelt story with interesting takeaways", time: "about 14 hours ago", likes: 0, gradient: 5 },
  { id: "more-rev-3", anime: "Kusuriya no Hitorigoto", slug: "kusuriya-no-hitorigoto", user: "Maya_cato78", quote: "TALENTED SHIKISO LMFAOOOOOOO", time: "a day ago", likes: 7, gradient: 1 },
  { id: "more-rev-4", anime: "Youkoso Jitsuryoku Shijou Shugi no Classroom e 3rd Season", slug: "youkoso-jitsuryoku", user: "Treyennes", quote: "School anime at it's best", time: "a day ago", likes: 3, gradient: 8 },
  { id: "more-rev-5", anime: "Sousou no Frieren", slug: "frieren", user: "AniChiwa", quote: "Best anime in this genre!", time: "a day ago", likes: 0, gradient: 0 },
  { id: "more-rev-6", anime: "I've Got a Million Skill Points!", slug: "million-skill-points", user: "NightShade587", quote: "Some descriptions, I should be clear, the anime is alright because it currently has no description.", time: "2 days ago", likes: 1, gradient: 3 },
  ...allAnime.slice(0, 30).map((a, i) => ({
    id: `more-rev-extra-${i}`, anime: a.title, slug: a.slug, user: `Reviewer${i + 1}`,
    quote: `An incredible take on the genre. ${a.title} truly delivers!`,
    time: `${i + 3} days ago`, likes: Math.floor(Math.random() * 20), gradient: i,
  })),
];

const PortraitGrid = ({ items, title, icon: Icon, iconColor = "text-primary" }: { items: AnimeEntry[]; title: string; icon: LucideIcon; iconColor?: string }) => (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <Icon size={20} className={iconColor} />
      <h1 className="text-foreground font-display font-bold text-xl">{title}</h1>
      <span className="text-muted-foreground text-sm">({items.length})</span>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-7 gap-3">
      {items.map((anime, i) => (
        <Link to={`/anime/${anime.slug}`} key={anime.slug + i} className="group block">
          <AnimeArtwork cover={anime.cover || getGradient(i)} className="relative rounded-md overflow-hidden aspect-[3/4]">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            {anime.dubbed && (
              <div className="absolute bottom-8 left-1.5 bg-card/80 text-foreground text-[9px] flex items-center gap-0.5 px-1.5 py-0.5 rounded">
                <Headphones size={10} /> Dub
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-foreground text-xs font-semibold leading-tight truncate">{anime.title}</p>
            </div>
          </AnimeArtwork>
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
  </div>
);

const newItems = [...newOnYugen, ...allAnime.slice(0, 60).filter((a) => !newOnYugen.find((n) => n.slug === a.slug))];
const popularItems = [...mostPopular, ...allAnime.filter((a) => (a.score || 0) > 8 && !mostPopular.find((m) => m.slug === a.slug)).slice(0, 60)];

export const NewPage = () => (
  <div className="min-h-screen bg-background pb-14 md:pb-0">
    <Sidebar /><BottomNav />
    <div className="md:ml-[70px]"><TopBar />
      <div className="px-4 md:px-6 py-6">
        <PortraitGrid items={newItems} title="New on YugenAnime" icon={Plus} />
      </div>
    </div>
  </div>
);

export const PopularPage = () => (
  <div className="min-h-screen bg-background pb-14 md:pb-0">
    <Sidebar /><BottomNav />
    <div className="md:ml-[70px]"><TopBar />
      <div className="px-4 md:px-6 py-6">
        <PortraitGrid items={popularItems} title="Most Popular Series" icon={Flame} iconColor="text-score-star" />
      </div>
    </div>
  </div>
);

export const ReviewsPage = () => {
  const { isLiked, toggleLike, getCount } = useReviewLikes();
  return (
  <div className="min-h-screen bg-background pb-14 md:pb-0">
    <Sidebar /><BottomNav />
    <div className="md:ml-[70px]"><TopBar />
      <div className="px-4 md:px-6 py-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquareText size={20} className="text-primary" />
          <h1 className="text-foreground font-display font-bold text-xl">YugenAnime Reviews</h1>
          <span className="text-muted-foreground text-sm">({reviews.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
      </div>
    </div>
  </div>
  );
};

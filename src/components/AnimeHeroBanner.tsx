import { AnimeEntry } from "@/data/animeData";
import ListControls from "@/components/ListControls";
import AnimeArtwork from "@/components/AnimeArtwork";

interface Props {
  anime: AnimeEntry;
}

const AnimeHeroBanner = ({ anime }: Props) => {
  return (
    <div className="relative w-full">
      <div className="relative w-full h-[180px] md:h-[280px] overflow-hidden">
        <AnimeArtwork cover={anime.cover} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="relative px-4 md:px-6 -mt-[70px] md:-mt-[90px]">
        {/* Mobile */}
        <div className="flex items-end gap-3 md:hidden">
          <AnimeArtwork cover={anime.cover} className="w-[100px] h-[140px] overflow-hidden rounded-md border-2 border-background shadow-lg flex-shrink-0" />
          <div className="flex items-center gap-2 mb-2">
            <ListControls anime={anime} size="sm" />
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <div className="flex items-end gap-4">
            <AnimeArtwork cover={anime.cover} className="w-[160px] h-[225px] overflow-hidden rounded-md border-2 border-background shadow-lg flex-shrink-0" />
            <h1 className="font-display text-2xl font-bold mb-2">{anime.title}</h1>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <ListControls anime={anime} size="md" />
          </div>
        </div>

        <h1 className="font-display text-xl font-bold mt-2 md:hidden">{anime.title}</h1>
      </div>
    </div>
  );
};

export default AnimeHeroBanner;

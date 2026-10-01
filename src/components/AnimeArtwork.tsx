import type { ReactNode } from "react";

interface AnimeArtworkProps {
  cover: string;
  className?: string;
  imageClassName?: string;
  children?: ReactNode;
}

export const isAnimeImage = (cover?: string) => Boolean(cover?.startsWith("/"));

const AnimeArtwork = ({ cover, className = "", imageClassName = "object-cover", children }: AnimeArtworkProps) => (
  <div className={`${className} ${isAnimeImage(cover) ? "" : `bg-gradient-to-br ${cover}`}`}>
    {isAnimeImage(cover) && (
      <img src={cover} alt="" className={`h-full w-full ${imageClassName}`} loading="lazy" />
    )}
    {children}
  </div>
);

export default AnimeArtwork;
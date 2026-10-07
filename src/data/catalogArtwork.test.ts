import { describe, expect, it } from "vitest";
import { resolveSlug } from "./animeData";
import soloArtwork from "@/assets/anime/solo-leveling-s2.jpg.asset.json";
import onePieceArtwork from "@/assets/anime/one-piece.jpg.asset.json";

describe("verified catalog artwork", () => {
  it("assigns the source poster to Solo Leveling Season 2 only", () => {
    expect(resolveSlug("solo-leveling-s2")?.cover).toBe(soloArtwork.url);
    expect(resolveSlug("solo-leveling")?.cover).not.toBe(soloArtwork.url);
  });

  it("preserves the uploaded One Piece picture", () => {
    expect(resolveSlug("one-piece")?.cover).toBe(onePieceArtwork.url);
  });
});
import { describe, it, expect } from "vitest";
import { slugify, seasonOf, titleSimilarity, findAnime, searchAnime } from "@/lib/animeMatch";
import type { AnimeEntry } from "@/data/animeData";

const a = (slug: string, title: string, extra: Partial<AnimeEntry> = {}): AnimeEntry =>
  ({ slug, title, ...extra } as AnimeEntry);

const catalog: AnimeEntry[] = [
  a("chainsaw-man", "Chainsaw Man", { titleRomaji: "Chainsaw Man" }),
  a("chainsaw-man-reze-arc", "Chainsaw Man Movie: Reze-hen"),
  a("shingeki-no-kyojin", "Shingeki no Kyojin", { titleEnglish: "Attack on Titan" }),
  a("jujutsu-kaisen", "Jujutsu Kaisen"),
  a("jujutsu-kaisen-s2", "Jujutsu Kaisen Season 2"),
  a("frieren", "Sousou no Frieren", { titleEnglish: "Frieren: Beyond Journey's End" }),
  a("one-punch-man-s3", "One Punch Man Season 3"),
  a("spy-x-family", "Spy x Family"),
];

describe("slugify", () => {
  it("normalizes punctuation and accents", () => {
    expect(slugify("Ranma ½ (2024)")).toBe("ranma-1-2-2024");
    expect(slugify("Sousou no Frieren")).toBe("sousou-no-frieren");
  });
});

describe("seasonOf", () => {
  it("reads arabic, ordinal and roman season markers", () => {
    expect(seasonOf("Jujutsu Kaisen")).toBe(1);
    expect(seasonOf("Jujutsu Kaisen Season 2")).toBe(2);
    expect(seasonOf("Youkoso 3rd Season")).toBe(3);
    expect(seasonOf("One Punch Man S3")).toBe(3);
    expect(seasonOf("Overlord IV")).toBe(4);
  });
});

describe("titleSimilarity", () => {
  it("treats different seasons as non-matching", () => {
    expect(titleSimilarity("Jujutsu Kaisen", "Jujutsu Kaisen Season 2")).toBe(0);
  });
  it("treats movies and series as non-matching", () => {
    expect(titleSimilarity("Chainsaw Man", "Chainsaw Man Movie: Reze-hen")).toBe(0);
  });
  it("scores identical titles at 1", () => {
    expect(titleSimilarity("Spy x Family", "Spy X Family")).toBe(1);
  });
});

describe("findAnime", () => {
  it("matches by exact slug", () => {
    expect(findAnime("chainsaw-man", catalog)?.slug).toBe("chainsaw-man");
  });
  it("tolerates typos", () => {
    expect(findAnime("Chainsw Man", catalog)?.slug).toBe("chainsaw-man");
  });
  it("matches english titles", () => {
    expect(findAnime("Attack on Titan", catalog)?.slug).toBe("shingeki-no-kyojin");
    expect(findAnime("Frieren: Beyond Journey's End", catalog)?.slug).toBe("frieren");
  });
  it("does not confuse seasons", () => {
    expect(findAnime("Jujutsu Kaisen Season 2", catalog)?.slug).toBe("jujutsu-kaisen-s2");
    expect(findAnime("Jujutsu Kaisen", catalog)?.slug).toBe("jujutsu-kaisen");
  });
  it("does not confuse movies with the series", () => {
    expect(findAnime("Chainsaw Man Movie: Reze Arc", catalog)?.slug).toBe("chainsaw-man-reze-arc");
  });
  it("returns null for unrelated titles", () => {
    expect(findAnime("Completely Unrelated Show", catalog)).toBeNull();
  });
});

describe("searchAnime", () => {
  it("returns exact matches first", () => {
    expect(searchAnime("frieren", catalog)[0].slug).toBe("frieren");
  });
  it("supports partial and typo queries", () => {
    expect(searchAnime("chainsw", catalog).map((x) => x.slug)).toContain("chainsaw-man");
    expect(searchAnime("spy fam", catalog).map((x) => x.slug)).toContain("spy-x-family");
  });
  it("returns nothing for an empty query", () => {
    expect(searchAnime("", catalog)).toEqual([]);
  });
});

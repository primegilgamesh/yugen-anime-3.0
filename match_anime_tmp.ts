import { recentlyReleased, trendingAiring, editorsPick, underratedSeries, heroPicks, topAiring, mostFavorite, mostPopular, topUpcoming } from "./src/data/animeData";
import { franchiseMovieEntries } from "./src/data/franchiseMovies";
import { findAnime } from "./src/lib/animeMatch";
import * as fs from 'fs';

const allCatalog = [
  ...heroPicks,
  ...recentlyReleased,
  ...trendingAiring,
  ...editorsPick,
  ...underratedSeries,
  ...topAiring,
  ...mostFavorite,
  ...mostPopular,
  ...topUpcoming,
  ...franchiseMovieEntries
];

const catalog = Array.from(new Map(allCatalog.map(item => [item.slug, item])).values());
const pageData = JSON.parse(fs.readFileSync('/tmp/9anime-page.json', 'utf-8'));
const markdown = pageData.data.markdown;

const regex = /!\[(.*?)\]\((.*?)\)/g;
let match;
const foundOn9Anime: { title: string, imageUrl: string }[] = [];
while ((match = regex.exec(markdown)) !== null) {
  if (match[2].includes('noimg')) continue;
  foundOn9Anime.push({ title: match[1], imageUrl: match[2] });
}

const matches: any[] = [];
const mismatches: any[] = [];

for (const entry of foundOn9Anime) {
  const catalogEntry = findAnime(entry.title, catalog, 0.95);
  if (catalogEntry) {
    matches.push({
      slug: catalogEntry.slug,
      title: catalogEntry.title,
      image: entry.imageUrl
    });
  } else {
    mismatches.push(entry.title);
  }
}

const uniqueMatches = Array.from(new Map(matches.map(m => [m.slug, m])).values());

console.log("### CANDIDATE MATCHES");
uniqueMatches.forEach(m => {
  console.log(`- Slug: ${m.slug}\n  Title: ${m.title}\n  Image: ${m.image}`);
});

console.log("\n### MISMATCHES SKIPPED");
const uniqueMismatches = Array.from(new Set(mismatches));
uniqueMismatches.forEach(m => console.log(`- ${m}`));

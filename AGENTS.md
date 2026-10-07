# Architecture rules

- Render catalog artwork through `AnimeArtwork` so image URLs and gradient fallbacks remain compatible across every anime view.
- Apply verified missing-poster mappings by canonical slug after catalog deduplication, preserving existing image covers so installment identity and uploaded artwork remain intact.
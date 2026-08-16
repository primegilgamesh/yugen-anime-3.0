import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type ListCategory = "plan-to-watch" | "watching" | "completed" | "dropped";

interface ListItem {
  slug: string;
  title: string;
  cover: string;
  category: ListCategory;
  addedAt: number;
  episodesWatched?: number;
  totalEpisodes?: number;
  score?: number;
  startDate?: string;
  finishDate?: string;
}

export interface ListEntryUpdate {
  category: ListCategory;
  episodesWatched?: number;
  score?: number;
  startDate?: string;
  finishDate?: string;
  totalEpisodes?: number;
}

interface FavoriteItem {
  slug: string;
  title: string;
  cover: string;
  addedAt: number;
}

export interface HistoryItem {
  slug: string;
  title: string;
  cover: string;
  episode: number;
  episodeTitle?: string;
  watchedAt: number;
}

interface ListContextType {
  listItems: ListItem[];
  favorites: FavoriteItem[];
  history: HistoryItem[];
  addToList: (slug: string, title: string, cover: string, category: ListCategory, totalEpisodes?: number) => void;
  upsertListEntry: (slug: string, title: string, cover: string, update: ListEntryUpdate) => void;
  getListEntry: (slug: string) => ListItem | null;
  removeFromList: (slug: string) => void;
  getListCategory: (slug: string) => ListCategory | null;
  getEpisodesWatched: (slug: string) => number;
  toggleFavorite: (slug: string, title: string, cover: string) => boolean;
  isFavorited: (slug: string) => boolean;
  recordWatch: (slug: string, title: string, cover: string, episode: number, episodeTitle?: string) => void;
  removeHistoryItem: (slug: string, episode: number) => void;
  clearHistory: () => void;
}

const ListContext = createContext<ListContextType | null>(null);

export const ListProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const storageKey = user ? `yugen_list_${user.email}` : null;
  const favKey = user ? `yugen_favs_${user.email}` : null;
  const histKey = user ? `yugen_history_${user.email}` : null;

  useEffect(() => {
    if (storageKey) {
      try { setListItems(JSON.parse(localStorage.getItem(storageKey) || "[]")); } catch { setListItems([]); }
    } else { setListItems([]); }
    if (favKey) {
      try { setFavorites(JSON.parse(localStorage.getItem(favKey) || "[]")); } catch { setFavorites([]); }
    } else { setFavorites([]); }
    if (histKey) {
      try { setHistory(JSON.parse(localStorage.getItem(histKey) || "[]")); } catch { setHistory([]); }
    } else { setHistory([]); }
  }, [storageKey, favKey, histKey]);

  const addToList: ListContextType["addToList"] = (slug, title, cover, category, totalEpisodes) => {
    setListItems((prev) => {
      const existing = prev.find((i) => i.slug === slug);
      const filtered = prev.filter((i) => i.slug !== slug);
      const next = [...filtered, {
        slug, title, cover, category,
        addedAt: existing?.addedAt || Date.now(),
        episodesWatched: existing?.episodesWatched || 0,
        totalEpisodes: totalEpisodes || existing?.totalEpisodes,
      }];
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const removeFromList = (slug: string) => {
    setListItems((prev) => {
      const next = prev.filter((i) => i.slug !== slug);
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const upsertListEntry: ListContextType["upsertListEntry"] = (slug, title, cover, update) => {
    setListItems((prev) => {
      const existing = prev.find((i) => i.slug === slug);
      const filtered = prev.filter((i) => i.slug !== slug);
      const next = [...filtered, {
        slug, title, cover,
        category: update.category,
        addedAt: existing?.addedAt || Date.now(),
        episodesWatched: update.episodesWatched ?? existing?.episodesWatched ?? 0,
        totalEpisodes: update.totalEpisodes ?? existing?.totalEpisodes,
        score: update.score ?? existing?.score,
        startDate: update.startDate ?? existing?.startDate,
        finishDate: update.finishDate ?? existing?.finishDate,
      }];
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const getListEntry = (slug: string) => listItems.find((i) => i.slug === slug) || null;
  const getListCategory = (slug: string): ListCategory | null => listItems.find((i) => i.slug === slug)?.category || null;
  const getEpisodesWatched = (slug: string): number => listItems.find((i) => i.slug === slug)?.episodesWatched || 0;

  const toggleFavorite = (slug: string, title: string, cover: string): boolean => {
    const exists = favorites.some((f) => f.slug === slug);
    setFavorites((prev) => {
      const next = exists ? prev.filter((f) => f.slug !== slug) : [...prev, { slug, title, cover, addedAt: Date.now() }];
      if (favKey) localStorage.setItem(favKey, JSON.stringify(next));
      // notify same-tab listeners (favorite counters) — `storage` only fires cross-tab
      window.dispatchEvent(new Event("yugen-favs-update"));
      return next;
    });
    return !exists;
  };

  const isFavorited = (slug: string) => favorites.some((f) => f.slug === slug);

  const recordWatch = useCallback<ListContextType["recordWatch"]>((slug, title, cover, episode, episodeTitle) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => !(h.slug === slug && h.episode === episode));
      const next = [{ slug, title, cover, episode, episodeTitle, watchedAt: Date.now() }, ...filtered].slice(0, 200);
      if (histKey) localStorage.setItem(histKey, JSON.stringify(next));
      return next;
    });
    // bump watched count on list item
    setListItems((prev) => {
      const item = prev.find((i) => i.slug === slug);
      if (!item) return prev;
      const watched = Math.max(item.episodesWatched || 0, episode);
      const next = prev.map((i) => i.slug === slug ? { ...i, episodesWatched: watched } : i);
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [histKey, storageKey]);

  const removeHistoryItem = (slug: string, episode: number) => {
    setHistory((prev) => {
      const next = prev.filter((h) => !(h.slug === slug && h.episode === episode));
      if (histKey) localStorage.setItem(histKey, JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    if (histKey) localStorage.setItem(histKey, "[]");
  };

  return (
    <ListContext.Provider value={{ listItems, favorites, history, addToList, upsertListEntry, getListEntry, removeFromList, getListCategory, getEpisodesWatched, toggleFavorite, isFavorited, recordWatch, removeHistoryItem, clearHistory }}>
      {children}
    </ListContext.Provider>
  );
};

export const useList = () => {
  const ctx = useContext(ListContext);
  if (!ctx) throw new Error("useList must be used within ListProvider");
  return ctx;
};

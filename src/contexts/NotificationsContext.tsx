import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface AppNotification {
  id: string;
  title: string;
  body?: string;
  type: "admin" | "release" | "system";
  createdAt: number;
  read?: boolean;
  readAt?: number;
  link?: string;
}

interface Ctx {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "createdAt"> & { id?: string; createdAt?: number }) => void;
  removeNotification: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<Ctx | null>(null);

const GLOBAL_KEY = "yugen_global_notifications"; // admin broadcasts

export const broadcastAdminNotification = (n: Omit<AppNotification, "id" | "createdAt" | "type">) => {
  const list: AppNotification[] = JSON.parse(localStorage.getItem(GLOBAL_KEY) || "[]");
  list.unshift({ ...n, id: `admin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type: "admin", createdAt: Date.now() });
  localStorage.setItem(GLOBAL_KEY, JSON.stringify(list.slice(0, 100)));
  window.dispatchEvent(new Event("yugen-notifications-update"));
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const key = user ? `yugen_notifications_${user.email}` : null;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const load = useCallback(() => {
    if (!key) { setNotifications([]); return; }
    let personal: AppNotification[] = JSON.parse(localStorage.getItem(key) || "[]");
    // Auto-dismiss release notifications 30s after being read.
    const now = Date.now();
    const before = personal.length;
    personal = personal.filter((n) => !(n.type === "release" && n.readAt && now - n.readAt > 30_000));
    if (personal.length !== before) localStorage.setItem(key, JSON.stringify(personal));
    const global: AppNotification[] = JSON.parse(localStorage.getItem(GLOBAL_KEY) || "[]");
    const dismissed: string[] = JSON.parse(localStorage.getItem(`${key}_dismissed`) || "[]");
    const merged = [...personal, ...global.filter((g) => !dismissed.includes(g.id))]
      .sort((a, b) => b.createdAt - a.createdAt);
    setNotifications(merged);
  }, [key]);

  useEffect(() => { load(); }, [load]);

  // Re-evaluate periodically so read release notifications disappear after 30s.
  useEffect(() => {
    const id = setInterval(() => load(), 5000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("yugen-notifications-update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("yugen-notifications-update", handler);
      window.removeEventListener("storage", handler);
    };
  }, [load]);

  // Seed today's anime releases as notifications once per day per user.
  useEffect(() => {
    if (!key) return;
    const today = new Date().toISOString().slice(0, 10);
    const seedKey = `${key}_seeded_${today}`;
    if (localStorage.getItem(seedKey)) return;
    (async () => {
      try {
        const start = new Date(); start.setHours(0, 0, 0, 0);
        const end = new Date(start); end.setDate(end.getDate() + 1);
        const query = `query($s:Int,$e:Int){Page(page:1,perPage:10){airingSchedules(airingAt_greater:$s,airingAt_lesser:$e,sort:TIME){airingAt episode media{title{romaji english}}}}}`;
        const res = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables: { s: Math.floor(start.getTime() / 1000), e: Math.floor(end.getTime() / 1000) } }),
        });
        const json = await res.json();
        const list = json?.data?.Page?.airingSchedules ?? [];
        const personal: AppNotification[] = JSON.parse(localStorage.getItem(key) || "[]");
        list.slice(0, 5).forEach((a: any) => {
          const title = a.media?.title?.english || a.media?.title?.romaji || "New episode";
          personal.unshift({
            id: `rel-${today}-${title}-${a.episode}`,
            title: `New episode: ${title}`,
            body: `Episode ${a.episode} airs today`,
            type: "release",
            createdAt: a.airingAt * 1000,
          });
        });
        // dedupe by id
        const seen = new Set<string>();
        const dedup = personal.filter((n) => (seen.has(n.id) ? false : (seen.add(n.id), true)));
        localStorage.setItem(key, JSON.stringify(dedup.slice(0, 100)));
        localStorage.setItem(seedKey, "1");
        load();
      } catch {}
    })();
  }, [key, load]);

  const addNotification: Ctx["addNotification"] = (n) => {
    if (!key) return;
    const personal: AppNotification[] = JSON.parse(localStorage.getItem(key) || "[]");
    personal.unshift({
      id: n.id || `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: n.createdAt || Date.now(),
      title: n.title, body: n.body, type: n.type, link: n.link, read: n.read,
    });
    localStorage.setItem(key, JSON.stringify(personal.slice(0, 100)));
    load();
  };

  const removeNotification = (id: string) => {
    if (!key) return;
    const personal: AppNotification[] = JSON.parse(localStorage.getItem(key) || "[]");
    const filtered = personal.filter((n) => n.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
    // also dismiss global broadcasts
    const dismissed: string[] = JSON.parse(localStorage.getItem(`${key}_dismissed`) || "[]");
    if (!dismissed.includes(id)) {
      dismissed.push(id);
      localStorage.setItem(`${key}_dismissed`, JSON.stringify(dismissed));
    }
    load();
  };

  const markAllRead = () => {
    if (!key) return;
    const personal: AppNotification[] = JSON.parse(localStorage.getItem(key) || "[]");
    const now = Date.now();
    localStorage.setItem(key, JSON.stringify(personal.map((n) => ({ ...n, read: true, readAt: n.readAt ?? now }))));
    const readSet: string[] = JSON.parse(localStorage.getItem(`${key}_read_global`) || "[]");
    const global: AppNotification[] = JSON.parse(localStorage.getItem(GLOBAL_KEY) || "[]");
    const merged = Array.from(new Set([...readSet, ...global.map((g) => g.id)]));
    localStorage.setItem(`${key}_read_global`, JSON.stringify(merged));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, readAt: n.readAt ?? now })));
  };

  const clearAll = () => {
    if (!key) return;
    localStorage.setItem(key, "[]");
    const global: AppNotification[] = JSON.parse(localStorage.getItem(GLOBAL_KEY) || "[]");
    localStorage.setItem(`${key}_dismissed`, JSON.stringify(global.map((g) => g.id)));
    load();
  };

  const readKey = key ? `${key}_read_global` : null;
  const readGlobal: string[] = readKey ? JSON.parse(localStorage.getItem(readKey) || "[]") : [];
  const unreadCount = notifications.filter((n) => !n.read && !readGlobal.includes(n.id)).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, removeNotification, markAllRead, clearAll }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
};
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import { useAuth, ADMINS_KEY, ADMIN_LOGINS_KEY, AdminAccount } from "@/contexts/AuthContext";
import { broadcastAdminNotification } from "@/contexts/NotificationsContext";
import { allAnime } from "@/data/animeData";
import { aggregateAnimeStats } from "@/lib/animeStats";
import { toast } from "sonner";
import { Ban, CheckCircle2, Send, Trash2, Plus, Save, Search } from "lucide-react";

interface StoredUser { username: string; email: string; password: string; avatar: string }
interface CustomAnime { slug: string; title: string; synopsis?: string; genres?: string; episodes?: number; createdAt: number }
interface AnimeOverride { synopsis?: string; genres?: string; episodes?: number; title?: string }

const OVERRIDES_KEY = "yugen_anime_overrides";
const CUSTOM_KEY = "yugen_custom_animes";
const BAN_KEY = "yugen_banned_users";

const loadJSON = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || "") ?? d; } catch { return d; } };

const AdminLoginGate = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (!res.success) setErr(res.error || "Login failed");
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-card border border-border rounded-xl p-6 space-y-4">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Admin Sign-in</h1>
          <p className="text-muted-foreground text-xs mt-1">Restricted area. Admin credentials required.</p>
        </div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full bg-secondary text-foreground text-sm rounded-md px-3 py-2 outline-none" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full bg-secondary text-foreground text-sm rounded-md px-3 py-2 outline-none" />
        {err && <p className="text-destructive text-xs">{err}</p>}
        <button type="submit" className="w-full bg-primary text-primary-foreground text-sm font-semibold py-2 rounded-md hover:opacity-90">Sign in</button>
      </form>
    </div>
  );
};

type Tab = "animes" | "users" | "stats" | "broadcast" | "home" | "admins";

const Admin = () => {
  const { isAdmin, isLoggedIn } = useAuth();
  const [tab, setTab] = useState<Tab>("animes");

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopBar />
        <AdminLoginGate />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <header className="mb-5">
            <h1 className="text-2xl font-display font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground text-xs">Manage content, users and broadcasts.</p>
          </header>
          <nav className="flex flex-wrap gap-2 mb-5">
            {([
              ["animes", "Animes"],
              ["users", "Users"],
              ["stats", "Statistics"],
              ["broadcast", "Broadcast"],
              ["home", "Home Layout"],
              ["admins", "Admins"],
            ] as [Tab, string][]).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} className={`text-xs font-semibold px-3 py-1.5 rounded-md transition ${tab === id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{label}</button>
            ))}
          </nav>
          {tab === "animes" && <AnimesTab />}
          {tab === "users" && <UsersTab />}
          {tab === "stats" && <StatsTab />}
          {tab === "broadcast" && <BroadcastTab />}
          {tab === "home" && <HomeLayoutTab />}
          {tab === "admins" && <AdminsTab />}
        </main>
      </div>
    </div>
  );
};

/* ---------------- Animes ---------------- */
const AnimesTab = () => {
  const [q, setQ] = useState("");
  const [overrides, setOverrides] = useState<Record<string, AnimeOverride>>(() => loadJSON(OVERRIDES_KEY, {}));
  const [customs, setCustoms] = useState<CustomAnime[]>(() => loadJSON(CUSTOM_KEY, []));
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<AnimeOverride>({});
  const [newAnime, setNewAnime] = useState<CustomAnime>({ slug: "", title: "", synopsis: "", genres: "", episodes: 12, createdAt: 0 });

  const persist = (next: Record<string, AnimeOverride>) => {
    setOverrides(next);
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next));
  };
  const persistC = (next: CustomAnime[]) => {
    setCustoms(next);
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
  };

  const merged = useMemo(() => {
    const base = allAnime.map((a) => ({ slug: a.slug, title: overrides[a.slug]?.title || a.title, source: "library" as const }));
    const custom = customs.map((c) => ({ slug: c.slug, title: c.title, source: "custom" as const }));
    return [...custom, ...base];
  }, [overrides, customs]);

  const filtered = merged.filter((m) => m.title.toLowerCase().includes(q.toLowerCase())).slice(0, 80);

  const startEdit = (slug: string) => {
    setEditing(slug);
    const custom = customs.find((c) => c.slug === slug);
    const base = allAnime.find((a) => a.slug === slug);
    setDraft({
      title: overrides[slug]?.title ?? custom?.title ?? base?.title,
      synopsis: overrides[slug]?.synopsis ?? custom?.synopsis ?? base?.synopsis,
      genres: overrides[slug]?.genres ?? custom?.genres ?? base?.genres,
      episodes: overrides[slug]?.episodes ?? custom?.episodes ?? base?.episodes,
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    persist({ ...overrides, [editing]: draft });
    toast.success("Anime updated (override saved)");
    setEditing(null);
  };

  const removeCustom = (slug: string) => {
    persistC(customs.filter((c) => c.slug !== slug));
    toast.success("Custom anime removed");
  };

  const addCustom = () => {
    if (!newAnime.title.trim()) return toast.error("Title required");
    const slug = newAnime.slug.trim() || newAnime.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (merged.find((m) => m.slug === slug)) return toast.error("Slug already exists");
    persistC([{ ...newAnime, slug, createdAt: Date.now() }, ...customs]);
    broadcastAdminNotification({ title: `New anime added: ${newAnime.title}`, body: newAnime.synopsis?.slice(0, 120) });
    toast.success("Anime added and broadcast sent");
    setNewAnime({ slug: "", title: "", synopsis: "", genres: "", episodes: 12, createdAt: 0 });
  };

  return (
    <div className="space-y-6">
      <section className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-foreground font-semibold text-sm mb-3 flex items-center gap-2"><Plus size={14} /> Add new anime</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input value={newAnime.title} onChange={(e) => setNewAnime({ ...newAnime, title: e.target.value })} placeholder="Title" className="bg-secondary text-sm rounded-md px-3 py-2 outline-none text-foreground" />
          <input value={newAnime.slug} onChange={(e) => setNewAnime({ ...newAnime, slug: e.target.value })} placeholder="Slug (auto)" className="bg-secondary text-sm rounded-md px-3 py-2 outline-none text-foreground" />
          <input value={newAnime.genres} onChange={(e) => setNewAnime({ ...newAnime, genres: e.target.value })} placeholder="Genres (comma separated)" className="bg-secondary text-sm rounded-md px-3 py-2 outline-none text-foreground" />
          <input value={newAnime.episodes ?? ""} onChange={(e) => setNewAnime({ ...newAnime, episodes: Number(e.target.value) || 0 })} type="number" placeholder="Episodes" className="bg-secondary text-sm rounded-md px-3 py-2 outline-none text-foreground" />
          <textarea value={newAnime.synopsis} onChange={(e) => setNewAnime({ ...newAnime, synopsis: e.target.value })} placeholder="Synopsis" rows={3} className="bg-secondary text-sm rounded-md px-3 py-2 outline-none text-foreground md:col-span-2" />
        </div>
        <button onClick={addCustom} className="mt-3 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-md hover:opacity-90">Add anime</button>
      </section>

      <section className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search size={14} className="text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search animes…" className="bg-secondary text-sm rounded-md px-3 py-1.5 outline-none text-foreground flex-1" />
        </div>
        <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
          {filtered.map((m) => (
            <div key={m.slug} className="py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-medium truncate">{m.title}</p>
                  <p className="text-muted-foreground text-[10px]">{m.slug} · {m.source}{overrides[m.slug] ? " · edited" : ""}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(m.slug)} className="text-xs text-primary hover:underline">Edit</button>
                  {m.source === "custom" && (
                    <button onClick={() => removeCustom(m.slug)} className="text-xs text-destructive hover:underline">Delete</button>
                  )}
                </div>
              </div>
              {editing === m.slug && (
                <div className="mt-2 bg-secondary/50 rounded-md p-3 space-y-2">
                  <input value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" className="w-full bg-background text-sm rounded-md px-3 py-1.5 outline-none text-foreground" />
                  <input value={draft.genres || ""} onChange={(e) => setDraft({ ...draft, genres: e.target.value })} placeholder="Genres" className="w-full bg-background text-sm rounded-md px-3 py-1.5 outline-none text-foreground" />
                  <input value={draft.episodes ?? ""} onChange={(e) => setDraft({ ...draft, episodes: Number(e.target.value) || 0 })} type="number" placeholder="Episodes" className="w-full bg-background text-sm rounded-md px-3 py-1.5 outline-none text-foreground" />
                  <textarea value={draft.synopsis || ""} onChange={(e) => setDraft({ ...draft, synopsis: e.target.value })} placeholder="Synopsis" rows={3} className="w-full bg-background text-sm rounded-md px-3 py-1.5 outline-none text-foreground" />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md flex items-center gap-1"><Save size={12} /> Save</button>
                    <button onClick={() => setEditing(null)} className="bg-secondary text-foreground text-xs px-3 py-1.5 rounded-md">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-muted-foreground text-xs py-6 text-center">No animes match your search.</p>}
        </div>
      </section>
    </div>
  );
};

/* ---------------- Users ---------------- */
const UsersTab = () => {
  const [users, setUsers] = useState<StoredUser[]>(() => loadJSON("yugen_users", [] as StoredUser[]));
  const [banned, setBanned] = useState<string[]>(() => loadJSON(BAN_KEY, [] as string[]));
  const [target, setTarget] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const refresh = () => setUsers(loadJSON("yugen_users", [] as StoredUser[]));

  const toggleBan = (email: string) => {
    const next = banned.includes(email) ? banned.filter((e) => e !== email) : [...banned, email];
    setBanned(next);
    localStorage.setItem(BAN_KEY, JSON.stringify(next));
    toast.success(banned.includes(email) ? "User unbanned" : "User banned");
  };

  const sendDM = () => {
    if (!target || !message.trim()) return;
    const key = `yugen_notifications_${target}`;
    const list = loadJSON(key, [] as any[]);
    list.unshift({
      id: `dm-${Date.now()}`,
      title: "Message from Admin",
      body: message.trim(),
      type: "admin",
      createdAt: Date.now(),
    });
    localStorage.setItem(key, JSON.stringify(list.slice(0, 100)));
    window.dispatchEvent(new Event("yugen-notifications-update"));
    toast.success(`Message sent to ${target}`);
    setMessage("");
    setTarget(null);
  };

  const deleteUser = (email: string) => {
    const next = users.filter((u) => u.email !== email);
    setUsers(next);
    localStorage.setItem("yugen_users", JSON.stringify(next));
    toast.success("User account removed");
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-foreground font-semibold text-sm">{users.length} registered users</h2>
        <button onClick={refresh} className="text-xs text-muted-foreground hover:text-foreground">Refresh</button>
      </div>
      <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
        {users.map((u) => {
          const isB = banned.includes(u.email);
          return (
            <div key={u.email} className="py-2.5 flex items-center gap-3">
              <img src={u.avatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium truncate">{u.username} {isB && <span className="text-destructive text-[10px] ml-2">BANNED</span>}</p>
                <p className="text-muted-foreground text-[11px] truncate">{u.email}</p>
              </div>
              <button onClick={() => setTarget(u.email)} className="text-xs text-primary hover:underline flex items-center gap-1"><Send size={12} /> Message</button>
              <button onClick={() => toggleBan(u.email)} className={`text-xs hover:underline flex items-center gap-1 ${isB ? "text-emerald-500" : "text-orange-500"}`}>
                {isB ? <><CheckCircle2 size={12} /> Unban</> : <><Ban size={12} /> Ban</>}
              </button>
              <button onClick={() => deleteUser(u.email)} className="text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 size={12} /></button>
            </div>
          );
        })}
        {users.length === 0 && <p className="text-muted-foreground text-xs py-6 text-center">No registered users yet.</p>}
      </div>

      {target && (
        <div className="mt-4 bg-secondary/50 rounded-md p-3">
          <p className="text-foreground text-xs font-medium mb-2">Send message to {target}</p>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Your message…" className="w-full bg-background text-sm rounded-md px-3 py-2 outline-none text-foreground" />
          <div className="flex gap-2 mt-2">
            <button onClick={sendDM} className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md">Send</button>
            <button onClick={() => { setTarget(null); setMessage(""); }} className="bg-secondary text-foreground text-xs px-3 py-1.5 rounded-md">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------- Stats ---------------- */
const StatsTab = () => {
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    return allAnime.map((a) => ({ ...a, stats: aggregateAnimeStats(a.slug) }))
      .sort((a, b) => (b.stats.favorites + b.stats.watching + b.stats.completed + b.stats.plan) - (a.stats.favorites + a.stats.watching + a.stats.completed + a.stats.plan));
  }, []);
  const filtered = rows.filter((r) => r.title.toLowerCase().includes(q.toLowerCase())).slice(0, 100);

  const totals = rows.reduce((acc, r) => {
    acc.fav += r.stats.favorites; acc.list += r.stats.watching + r.stats.completed + r.stats.plan + r.stats.dropped;
    return acc;
  }, { fav: 0, list: 0 });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Favorites" value={totals.fav} />
        <StatCard label="List entries" value={totals.list} />
        <StatCard label="Animes" value={allAnime.length} />
        <StatCard label="Users" value={loadJSON("yugen_users", [] as StoredUser[]).length} />
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search size={14} className="text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search anime…" className="bg-secondary text-sm rounded-md px-3 py-1.5 outline-none text-foreground flex-1" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 font-medium">Title</th>
                <th className="py-2 font-medium text-right">Favs</th>
                <th className="py-2 font-medium text-right">Watching</th>
                <th className="py-2 font-medium text-right">Plan</th>
                <th className="py-2 font-medium text-right">Completed</th>
                <th className="py-2 font-medium text-right">Dropped</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.slug} className="border-t border-border">
                  <td className="py-2 text-foreground truncate max-w-[180px]">{r.title}</td>
                  <td className="py-2 text-right text-foreground">{r.stats.favorites}</td>
                  <td className="py-2 text-right text-foreground">{r.stats.watching}</td>
                  <td className="py-2 text-right text-foreground">{r.stats.plan}</td>
                  <td className="py-2 text-right text-foreground">{r.stats.completed}</td>
                  <td className="py-2 text-right text-foreground">{r.stats.dropped}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-card border border-border rounded-lg p-4">
    <p className="text-muted-foreground text-xs">{label}</p>
    <p className="text-foreground text-2xl font-display font-bold mt-1">{value}</p>
  </div>
);

/* ---------------- Broadcast ---------------- */
const BroadcastTab = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const send = () => {
    if (!title.trim()) return toast.error("Title required");
    broadcastAdminNotification({ title: title.trim(), body: body.trim() || undefined });
    toast.success("Broadcast sent to all users");
    setTitle(""); setBody("");
  };
  return (
    <div className="bg-card border border-border rounded-lg p-4 max-w-xl space-y-3">
      <h2 className="text-foreground font-semibold text-sm">Broadcast notification</h2>
      <p className="text-muted-foreground text-xs">Sends a notification visible to every signed-in user.</p>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full bg-secondary text-sm rounded-md px-3 py-2 outline-none text-foreground" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Message body" className="w-full bg-secondary text-sm rounded-md px-3 py-2 outline-none text-foreground" />
      <button onClick={send} className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1"><Send size={12} /> Send broadcast</button>
    </div>
  );
};

export default Admin;
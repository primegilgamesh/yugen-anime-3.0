import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import TopBar from "@/components/TopBar";

import { useAuth, ADMINS_KEY, ADMIN_LOGINS_KEY, AdminAccount, loadAdmins, saveAdmins, setOwnerPassword } from "@/contexts/AuthContext";
import { loadUsers, saveUsers, SecureUser } from "@/lib/cryptoStore";
import { broadcastAdminNotification } from "@/contexts/NotificationsContext";
import { allAnime } from "@/data/animeData";
import { aggregateAnimeStats } from "@/lib/animeStats";
import { runLinkAudit, auditSummary, LinkAuditRow, LinkStatus } from "@/lib/linkAudit";
import { toast } from "sonner";
import { Ban, CheckCircle2, Send, Trash2, Plus, Save, Search } from "lucide-react";

type StoredUser = SecureUser;
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
  const [users, setUsers] = useState<StoredUser[]>(() => loadUsers());
  const [banned, setBanned] = useState<string[]>(() => loadJSON(BAN_KEY, [] as string[]));
  const [target, setTarget] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");

  const refresh = () => setUsers(loadUsers());

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
    saveUsers(next);
    toast.success("User account removed");
  };

  const filteredUsers = users.filter((u) => {
    const matchesQ = !q || u.username.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase());
    const isB = banned.includes(u.email);
    const matchesStatus = statusFilter === "all" || (statusFilter === "banned" ? isB : !isB);
    return matchesQ && matchesStatus;
  });

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-foreground font-semibold text-sm">{users.length} registered users</h2>
        <button onClick={refresh} className="text-xs text-muted-foreground hover:text-foreground">Refresh</button>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex items-center gap-2 bg-secondary rounded-md px-2 py-1 flex-1 min-w-[180px]">
          <Search size={12} className="text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…" className="bg-transparent text-xs outline-none text-foreground flex-1" />
        </div>
        <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
          {(["all", "active", "banned"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`text-[11px] font-semibold px-2.5 py-1 rounded transition ${statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{s[0].toUpperCase() + s.slice(1)}</button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
        {filteredUsers.map((u) => {
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
        {filteredUsers.length === 0 && <p className="text-muted-foreground text-xs py-6 text-center">No users match your filters.</p>}
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
        <StatCard label="Users" value={loadUsers().length} />
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

/* ---------------- Home Layout ---------------- */
const HOME_OVERRIDES_KEY = "yugen_home_overrides";
const SECTIONS: { id: string; label: string; hint: string }[] = [
  { id: "heroSlides", label: "Hero Slideshow", hint: "Slugs that appear in the homepage hero slideshow (in order)." },
  { id: "trendingAiring", label: "Trending Airing", hint: "Trending Airing Series section." },
  { id: "editorsPick", label: "Editor's Pick", hint: "Editor's Pick row." },
  { id: "underratedSeries", label: "Underrated", hint: "Underrated Series row." },
  { id: "newOnYugen", label: "New on YugenAnime", hint: "New on YugenAnime row." },
  { id: "mostPopular", label: "Most Popular", hint: "Most Popular Series row." },
];

const HomeLayoutTab = () => {
  const [overrides, setOverrides] = useState<Record<string, string[]>>(() => loadJSON(HOME_OVERRIDES_KEY, {} as Record<string, string[]>));
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    SECTIONS.forEach((s) => { init[s.id] = (overrides[s.id] || []).join(", "); });
    return init;
  });

  const save = (id: string) => {
    const slugs = drafts[id].split(",").map((s) => s.trim()).filter(Boolean);
    const next = { ...overrides, [id]: slugs };
    setOverrides(next);
    localStorage.setItem(HOME_OVERRIDES_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("yugen-home-overrides-update"));
    toast.success(`${id} updated`);
  };

  const reset = (id: string) => {
    const next = { ...overrides };
    delete next[id];
    setOverrides(next);
    localStorage.setItem(HOME_OVERRIDES_KEY, JSON.stringify(next));
    setDrafts((d) => ({ ...d, [id]: "" }));
    window.dispatchEvent(new Event("yugen-home-overrides-update"));
    toast.success(`${id} reset to default`);
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-xs">Enter comma-separated anime slugs for each section. Leave blank to use defaults.</p>
      {SECTIONS.map((s) => (
        <section key={s.id} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-foreground font-semibold text-sm">{s.label}</h3>
            <span className="text-[10px] text-muted-foreground">{(overrides[s.id]?.length ?? 0)} custom slugs</span>
          </div>
          <p className="text-muted-foreground text-[11px] mb-2">{s.hint}</p>
          <textarea
            value={drafts[s.id]}
            onChange={(e) => setDrafts({ ...drafts, [s.id]: e.target.value })}
            rows={2}
            placeholder="frieren, jujutsu-kaisen, one-piece"
            className="w-full bg-secondary text-sm rounded-md px-3 py-2 outline-none text-foreground"
          />
          <div className="flex gap-2 mt-2">
            <button onClick={() => save(s.id)} className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md flex items-center gap-1"><Save size={12} /> Save</button>
            <button onClick={() => reset(s.id)} className="bg-secondary text-foreground text-xs px-3 py-1.5 rounded-md">Reset</button>
          </div>
        </section>
      ))}
    </div>
  );
};

/* ---------------- Admins ---------------- */
interface AdminLoginRecord { email: string; at: number; userAgent?: string }

const AdminsTab = () => {
  const [admins, setAdmins] = useState<AdminAccount[]>(() => loadAdmins());
  const [logins, setLogins] = useState<AdminLoginRecord[]>(() => loadJSON(ADMIN_LOGINS_KEY, [] as AdminLoginRecord[]));
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [editingPw, setEditingPw] = useState<string | null>(null);
  const [pwDraft, setPwDraft] = useState("");
  const [ownerPw, setOwnerPw] = useState("");

  const refresh = () => setLogins(loadJSON(ADMIN_LOGINS_KEY, [] as AdminLoginRecord[]));

  const add = () => {
    if (!form.email.trim() || !form.password.trim()) return toast.error("Email and password required");
    if (admins.find((a) => a.email === form.email)) return toast.error("This admin already exists");
    const next = [...admins, { email: form.email.trim(), password: form.password, name: form.name.trim() || undefined, addedAt: Date.now() }];
    setAdmins(next);
    saveAdmins(next);
    toast.success("Admin added");
    setForm({ name: "", email: "", password: "" });
  };

  const remove = (email: string) => {
    const next = admins.filter((a) => a.email !== email);
    setAdmins(next);
    saveAdmins(next);
    toast.success("Admin removed");
  };

  const savePw = (email: string) => {
    if (pwDraft.length < 6) return toast.error("Password must be at least 6 characters");
    const next = admins.map((a) => a.email === email ? { ...a, password: pwDraft } : a);
    setAdmins(next);
    saveAdmins(next);
    setEditingPw(null);
    setPwDraft("");
    toast.success("Admin password updated");
  };

  const saveOwnerPw = () => {
    if (ownerPw.length < 6) return toast.error("Password must be at least 6 characters");
    setOwnerPassword(ownerPw);
    setOwnerPw("");
    toast.success("Owner password updated");
  };

  return (
    <div className="space-y-5">
      <section className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-foreground font-semibold text-sm mb-3 flex items-center gap-2"><Plus size={14} /> Add new admin</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name (optional)" className="bg-secondary text-sm rounded-md px-3 py-2 outline-none text-foreground" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="Email" className="bg-secondary text-sm rounded-md px-3 py-2 outline-none text-foreground" />
          <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="text" placeholder="Password" className="bg-secondary text-sm rounded-md px-3 py-2 outline-none text-foreground" />
        </div>
        <button onClick={add} className="mt-3 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-md">Add admin</button>
      </section>

      <section className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-foreground font-semibold text-sm mb-3">Admin accounts ({admins.length})</h2>
        <div className="divide-y divide-border">
          <div className="py-2 flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <p className="text-foreground text-sm font-medium">Owner</p>
              <p className="text-muted-foreground text-[11px]">yugenanimecc@gmail.com · primary admin</p>
            </div>
            <input
              type="password"
              value={ownerPw}
              onChange={(e) => setOwnerPw(e.target.value)}
              placeholder="New owner password"
              className="bg-secondary text-foreground text-xs rounded-md px-2 py-1.5 outline-none w-44"
            />
            <button onClick={saveOwnerPw} className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md flex items-center gap-1"><Save size={12} /> Save</button>
          </div>
          {admins.map((a) => (
            <div key={a.email} className="py-2 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium truncate">{a.name || "Admin"}</p>
                <p className="text-muted-foreground text-[11px] truncate">{a.email} · added {new Date(a.addedAt).toLocaleDateString()}</p>
                {editingPw === a.email && (
                  <div className="mt-2 flex gap-2">
                    <input type="password" value={pwDraft} onChange={(e) => setPwDraft(e.target.value)} placeholder="New password" className="bg-background text-foreground text-xs rounded-md px-2 py-1.5 outline-none flex-1" />
                    <button onClick={() => savePw(a.email)} className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md">Save</button>
                    <button onClick={() => { setEditingPw(null); setPwDraft(""); }} className="bg-secondary text-foreground text-xs px-3 py-1.5 rounded-md">Cancel</button>
                  </div>
                )}
              </div>
              <button onClick={() => { setEditingPw(a.email); setPwDraft(""); }} className="text-primary text-xs hover:underline">Change password</button>
              <button onClick={() => remove(a.email)} className="text-destructive text-xs hover:underline flex items-center gap-1"><Trash2 size={12} /> Remove</button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-foreground font-semibold text-sm">Admin login history</h2>
          <button onClick={refresh} className="text-xs text-muted-foreground hover:text-foreground">Refresh</button>
        </div>
        <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
          {logins.length === 0 && <p className="text-muted-foreground text-xs py-6 text-center">No admin logins recorded yet.</p>}
          {logins.map((l, i) => (
            <div key={i} className="py-2">
              <p className="text-foreground text-xs font-medium">{l.email}</p>
              <p className="text-muted-foreground text-[10px]">{new Date(l.at).toLocaleString("en-GB", { hour12: false })}</p>
              {l.userAgent && <p className="text-muted-foreground/70 text-[10px] truncate">{l.userAgent}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

/* ---------------- Link audit ---------------- */
const STATUS_STYLES: Record<LinkStatus, string> = {
  ok: "bg-primary/15 text-primary",
  alias: "bg-secondary text-muted-foreground",
  mismatch: "bg-destructive/15 text-destructive",
  missing: "bg-destructive/25 text-destructive",
};

const LinksTab = () => {
  const [rows, setRows] = useState<LinkAuditRow[]>(() => runLinkAudit());
  const [filter, setFilter] = useState<"all" | LinkStatus>("all");
  const [q, setQ] = useState("");

  const summary = useMemo(() => auditSummary(rows), [rows]);
  const filtered = rows
    .filter((r) => (filter === "all" ? true : r.status === filter))
    .filter((r) => r.label.toLowerCase().includes(q.toLowerCase()) || r.linkedSlug.includes(q.toLowerCase()))
    .slice(0, 300);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Links scanned" value={summary.total} />
        <StatCard label="Correct" value={summary.ok} />
        <StatCard label="Aliased" value={summary.alias} />
        <StatCard label="Mismatched" value={summary.mismatch} />
        <StatCard label="Missing" value={summary.missing} />
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {(["all", "mismatch", "missing", "alias", "ok"] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`text-xs font-semibold px-3 py-1.5 rounded-md transition ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
          <div className="flex items-center gap-2 flex-1 min-w-[160px]">
            <Search size={14} className="text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search links…" className="bg-secondary text-sm rounded-md px-3 py-1.5 outline-none text-foreground flex-1" />
          </div>
          <button onClick={() => setRows(runLinkAudit())} className="bg-secondary text-foreground text-xs px-3 py-1.5 rounded-md hover:opacity-90">Re-scan</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 font-medium">Source</th>
                <th className="py-2 font-medium">Link label</th>
                <th className="py-2 font-medium">Linked slug</th>
                <th className="py-2 font-medium">Resolves to</th>
                <th className="py-2 font-medium">Suggested</th>
                <th className="py-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={`${r.source}-${r.linkedSlug}-${i}`} className="border-t border-border align-top">
                  <td className="py-2 text-muted-foreground">{r.source}</td>
                  <td className="py-2 text-foreground max-w-[200px] truncate">{r.label}</td>
                  <td className="py-2 text-muted-foreground">{r.linkedSlug}</td>
                  <td className="py-2 text-foreground max-w-[180px] truncate">{r.resolvedTitle || "—"}</td>
                  <td className="py-2 text-muted-foreground max-w-[180px] truncate">{r.status === "ok" ? "—" : r.suggestedSlug || "no confident match"}</td>
                  <td className="py-2 text-right">
                    <span className={`px-2 py-0.5 rounded-md font-semibold ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-muted-foreground text-xs py-6 text-center">No links in this category.</p>}
        </div>
      </div>
    </div>
  );
};

export default Admin;
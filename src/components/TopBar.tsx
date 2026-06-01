import { useState, useRef, useEffect } from "react";
import { Search, X, LogOut, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, AVATARS } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { allAnime } from "@/data/animeData";
import yugenLogo from "@/assets/yugen-logo.png";

const DiscordIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
  </svg>
);

const TopBar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof allAnime>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoggedIn, logout, setAvatar } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const results = allAnime.filter((a) =>
        a.title.toLowerCase().includes(q) ||
        a.titleEnglish?.toLowerCase().includes(q) ||
        a.titleRomaji?.toLowerCase().includes(q)
      ).slice(0, 8);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
      setSearchResults([]);
    }
  };

  const handleResultClick = (slug: string) => {
    navigate(`/anime/${slug}`);
    setSearchQuery("");
    setSearchOpen(false);
    setSearchResults([]);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setShowAvatarPicker(false);
  };

  const profileDropdown = (
    <div className="w-56 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
      {showAvatarPicker ? (
        <div className="p-3">
          <button onClick={() => setShowAvatarPicker(false)} className="text-muted-foreground text-xs mb-2 hover:text-foreground">← Back</button>
          <p className="text-foreground text-sm font-medium mb-2">Choose Avatar</p>
          <div className="grid grid-cols-4 gap-2">
            {AVATARS.map((av) => (
              <button key={av} onClick={() => { setAvatar(av); setShowAvatarPicker(false); setProfileOpen(false); }} className={`w-10 h-10 rounded-full overflow-hidden border-2 transition ${user?.avatar === av ? "border-primary" : "border-transparent hover:border-muted-foreground"}`}>
                <img src={av} alt="" className="w-full h-full" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="p-3 border-b border-border flex items-center gap-2">
            <img src={user?.avatar} alt="" className="w-8 h-8 rounded-full" />
            <div>
              <p className="text-foreground text-sm font-medium">{user?.username}</p>
              <p className="text-muted-foreground text-[10px]">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 text-destructive text-sm hover:bg-secondary transition-colors">
            <LogOut size={14} /> Logout
          </button>
        </>
      )}
    </div>
  );

  const searchDropdown = searchQuery.trim().length > 0 && (
    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto">
      {searchResults.map((a) => (
        <button key={a.slug} onClick={() => handleResultClick(a.slug)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary transition-colors text-left">
          <div className={`w-8 h-10 rounded bg-gradient-to-br ${a.cover} flex-shrink-0`} />
          <div className="min-w-0">
            <p className="text-foreground text-sm font-medium truncate">{a.title}</p>
            <p className="text-muted-foreground text-[10px]">{a.season} • {a.score?.toFixed(2)}</p>
          </div>
        </button>
      ))}
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleSearchSubmit(e as unknown as React.FormEvent); }}
        className="w-full px-3 py-2 text-primary text-xs hover:bg-secondary transition-colors text-center border-t border-border"
      >
        View all results in Discover →
      </button>
    </div>
  );

  const searchBar = (
    <form onSubmit={handleSearchSubmit} className="relative">
      <div className="flex items-center bg-secondary rounded-md px-3 py-1.5 gap-2">
        <Search size={14} className="text-muted-foreground" />
        <input
          ref={desktopInputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search anime..."
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
        />
        {searchQuery && (
          <button type="button" onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
            <X size={12} />
          </button>
        )}
      </div>
      {searchDropdown}
    </form>
  );

  return (
    <header className="h-12 bg-card flex items-center px-4 gap-4 border-b border-border relative">
      {searchOpen ? (
        <div className="flex-1 flex items-center gap-2 md:hidden">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <div className="flex items-center bg-secondary rounded-md px-3 py-1.5 gap-2">
              <Search size={14} className="text-muted-foreground" />
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anime..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
            {searchDropdown}
          </form>
          <button onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
        </div>
      ) : (
        <>
          <Link to="/" className="text-foreground font-display font-bold text-base mr-4 flex items-center gap-1.5">
            <img src={yugenLogo} alt="YugenAnime" width={20} height={20} className="w-5 h-5" />
            YugenAnime
          </Link>
          <div className="flex-1 max-w-md hidden md:block">{searchBar}</div>
          <div className="ml-auto flex items-center gap-3">
            <button className="md:hidden text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSearchOpen(true)}><Search size={18} /></button>
            <button onClick={toggleTheme} aria-label="Toggle theme" className="text-muted-foreground hover:text-foreground transition-colors">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a href="https://discord.gg/lovable-dev" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <DiscordIcon />
            </a>
            {isLoggedIn ? (
              <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="w-7 h-7 rounded-full overflow-hidden border border-border hover:border-primary transition">
                    <img src={user?.avatar} alt="" className="w-full h-full" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-auto p-0 border-0 bg-transparent shadow-none" align="end">
                  {profileDropdown}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/signin" className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-md hover:opacity-90 transition">Sign in</Link>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default TopBar;

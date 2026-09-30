import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";

const KEY = "yugen_cookie_consent";

export const getCookieConsent = () => localStorage.getItem(KEY);

const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const CookieConsent = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) setOpen(true);
  }, []);

  const choose = (value: "all" | "essential") => {
    localStorage.setItem(KEY, value);
    setCookie("yugen_consent", value);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-xl rounded-xl border border-border bg-card p-4 text-card-foreground shadow-2xl animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <Cookie className="h-6 w-6 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="font-semibold">We use cookies</p>
          <p className="mt-1 text-sm text-muted-foreground">
            YugenAnime uses cookies to keep you signed in, remember your lists and theme, and improve your experience.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => choose("all")} className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
              Accept all
            </button>
            <button onClick={() => choose("essential")} className="rounded-md border border-border px-4 py-1.5 text-sm font-medium hover:bg-muted">
              Essential only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

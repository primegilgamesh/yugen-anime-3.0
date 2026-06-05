import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loadUsers, saveUsers, SecureUser, encryptField, decryptField } from "@/lib/cryptoStore";

export interface User {
  username: string;
  email: string;
  avatar: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (username: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  setAvatar: (avatar: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AVATAR_SEEDS = [
  "Felix", "Aneka", "Milo", "Zoe", "Luna", "Nova", "Kai", "Aria",
  "Sora", "Hikaru", "Yuki", "Rei", "Akira", "Mika", "Ren", "Hana",
  "Taro", "Sakura", "Riku", "Mei", "Haru", "Kira", "Asuka", "Jin",
  "Naomi", "Toru", "Yuna", "Kei", "Emi", "Daichi",
];

const AVATARS = AVATAR_SEEDS.flatMap((seed) => [
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
  `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}`,
]);

export { AVATARS };

const validateUsername = (username: string): string | null => {
  if (username.length < 3) return "Username must be at least 3 characters";
  if (username.length > 20) return "Username must be less than 20 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores";
  return null;
};

const validateEmail = (email: string): string | null => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address";
  return null;
};

const validatePassword = (password: string): string | null => {
  if (password.length < 6) return "Password must be at least 6 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
};

export { validateUsername, validateEmail, validatePassword };

type StoredUser = SecureUser;

export const ADMIN_EMAIL = "yugenanimecc@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "Lordson@18";
export const OWNER_PASSWORD_KEY = "yugen_owner_password";
const getOwnerPassword = (): string => {
  try {
    const stored = localStorage.getItem(OWNER_PASSWORD_KEY);
    if (stored && stored.startsWith("enc:")) {
      return decryptField(stored);
    }
    return stored || DEFAULT_ADMIN_PASSWORD;
  } catch { return DEFAULT_ADMIN_PASSWORD; }
};
export const setOwnerPassword = (next: string) => {
  localStorage.setItem(OWNER_PASSWORD_KEY, encryptField(next));
};

export interface AdminAccount { email: string; password: string; name?: string; addedAt: number }
export const ADMINS_KEY = "yugen_admins";
export const ADMIN_LOGINS_KEY = "yugen_admin_logins";

const recordAdminLogin = (email: string) => {
  try {
    const list: any[] = JSON.parse(localStorage.getItem(ADMIN_LOGINS_KEY) || "[]");
    list.unshift({ email, at: Date.now(), userAgent: navigator.userAgent.slice(0, 120) });
    localStorage.setItem(ADMIN_LOGINS_KEY, JSON.stringify(list.slice(0, 200)));
  } catch {}
};

const findExtraAdmin = (email: string, password: string): AdminAccount | null => {
  try {
    const list: AdminAccount[] = loadAdmins();
    return list.find((a) => a.email === email && a.password === password) || null;
  } catch { return null; }
};

export const loadAdmins = (): AdminAccount[] => {
  try {
    const raw: any[] = JSON.parse(localStorage.getItem(ADMINS_KEY) || "[]");
    return raw.map((a) => ({
      email: decryptField(a.email),
      password: decryptField(a.password),
      name: a.name,
      addedAt: a.addedAt,
    }));
  } catch { return []; }
};

export const saveAdmins = (list: AdminAccount[]) => {
  const enc = list.map((a) => ({
    email: encryptField(a.email),
    password: encryptField(a.password),
    name: a.name,
    addedAt: a.addedAt,
  }));
  localStorage.setItem(ADMINS_KEY, JSON.stringify(enc));
};

const isBanned = (email: string): boolean => {
  try {
    const banned: string[] = JSON.parse(localStorage.getItem("yugen_banned_users") || "[]");
    return banned.includes(email);
  } catch { return false; }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("yugen_current_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const login = (email: string, password: string) => {
    const emailErr = validateEmail(email);
    if (emailErr) return { success: false, error: emailErr };

    // Admin login shortcut — does not require a registered account.
    if (email === ADMIN_EMAIL && password === getOwnerPassword()) {
      const adminData: User = {
        username: "Admin",
        email: ADMIN_EMAIL,
        avatar: `https://api.dicebear.com/7.x/lorelei/svg?seed=Admin`,
        isAdmin: true,
      };
      setUser(adminData);
      localStorage.setItem("yugen_current_user", JSON.stringify(adminData));
      recordAdminLogin(email);
      return { success: true };
    }

    const extra = findExtraAdmin(email, password);
    if (extra) {
      const adminData: User = {
        username: extra.name || "Admin",
        email: extra.email,
        avatar: `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(extra.name || extra.email)}`,
        isAdmin: true,
      };
      setUser(adminData);
      localStorage.setItem("yugen_current_user", JSON.stringify(adminData));
      recordAdminLogin(email);
      return { success: true };
    }

    if (isBanned(email)) return { success: false, error: "This account has been banned." };

    const users = loadUsers();
    const found = users.find((u) => u.email === email);
    if (!found) return { success: false, error: "No account found. Please create an account first." };
    if (found.password !== password) return { success: false, error: "Incorrect password" };
    
    const userData: User = { username: found.username, email: found.email, avatar: found.avatar };
    setUser(userData);
    localStorage.setItem("yugen_current_user", JSON.stringify(userData));
    return { success: true };
  };

  const signup = (username: string, email: string, password: string) => {
    const usernameErr = validateUsername(username);
    if (usernameErr) return { success: false, error: usernameErr };
    const emailErr = validateEmail(email);
    if (emailErr) return { success: false, error: emailErr };
    const passwordErr = validatePassword(password);
    if (passwordErr) return { success: false, error: passwordErr };

    const users = loadUsers();
    if (users.find((u) => u.email === email)) return { success: false, error: "An account with this email already exists" };
    if (users.find((u) => u.username.toLowerCase() === username.toLowerCase())) return { success: false, error: "This username is already taken" };

    // Pick a unique default avatar per user (cycle through library)
    const usedAvatars = new Set(users.map((u) => u.avatar));
    const defaultAvatar = AVATARS.find((a) => !usedAvatars.has(a)) || AVATARS[users.length % AVATARS.length];
    const newUser: StoredUser = { username, email, password, avatar: defaultAvatar };
    users.push(newUser);
    saveUsers(users);

    const userData: User = { username, email, avatar: defaultAvatar };
    setUser(userData);
    localStorage.setItem("yugen_current_user", JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("yugen_current_user");
  };

  const setAvatar = (avatar: string) => {
    if (!user) return;
    const updated = { ...user, avatar };
    setUser(updated);
    localStorage.setItem("yugen_current_user", JSON.stringify(updated));
    const users = loadUsers();
    const idx = users.findIndex((u) => u.email === user.email);
    if (idx >= 0) {
      users[idx].avatar = avatar;
      saveUsers(users);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isAdmin: !!user?.isAdmin, login, signup, logout, setAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

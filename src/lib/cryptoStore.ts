// Lightweight obfuscation for credentials persisted in localStorage.
// Note: client-side storage cannot be cryptographically secure against the
// device owner, but this prevents casual snooping (plain-text in DevTools)
// and any third-party script that reads localStorage.
const KEY = "y9gE-Nan!mE_2026_secret_key";

const xor = (input: string): string => {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    out += String.fromCharCode(input.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length));
  }
  return out;
};

const toB64 = (s: string) => {
  try { return btoa(unescape(encodeURIComponent(s))); } catch { return s; }
};
const fromB64 = (s: string) => {
  try { return decodeURIComponent(escape(atob(s))); } catch { return s; }
};

export const encryptField = (plain: string): string => {
  if (!plain) return plain;
  return "enc:" + toB64(xor(plain));
};

export const decryptField = (value: string): string => {
  if (!value || !value.startsWith("enc:")) return value;
  try { return xor(fromB64(value.slice(4))); } catch { return value; }
};

export interface SecureUser {
  username: string;
  email: string;
  password: string;
  avatar: string;
}

// Read users with transparent decryption + one-time migration of legacy plaintext.
export const loadUsers = (key = "yugen_users"): SecureUser[] => {
  try {
    const raw: any[] = JSON.parse(localStorage.getItem(key) || "[]");
    let mutated = false;
    const decrypted = raw.map((u) => {
      const email = decryptField(u.email);
      const password = decryptField(u.password);
      if (email !== u.email || password !== u.password) mutated = true; // was legacy plaintext
      return { username: u.username, email, password, avatar: u.avatar } as SecureUser;
    });
    if (mutated) saveUsers(decrypted, key);
    return decrypted;
  } catch { return []; }
};

export const saveUsers = (users: SecureUser[], key = "yugen_users") => {
  const enc = users.map((u) => ({
    username: u.username,
    email: encryptField(u.email),
    password: encryptField(u.password),
    avatar: u.avatar,
  }));
  localStorage.setItem(key, JSON.stringify(enc));
};
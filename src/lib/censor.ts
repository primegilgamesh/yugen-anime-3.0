// Lightweight client-side censor for insults and threats in user reviews.
// Matches whole words case-insensitively, including light leetspeak variants,
// and preserves the original length with asterisks so context stays readable.
const BAD_WORDS = [
  // Insults / profanity
  "fuck","fucker","fucking","shit","shitty","bitch","bastard","asshole",
  "ass","dick","dickhead","pussy","cunt","slut","whore","retard","retarded",
  "moron","idiot","stupid","dumbass","jackass","douche","douchebag","prick",
  "wanker","twat","crap","damn","piss","fag","faggot","nigger","nigga",
  "chink","spic","kike","tranny","cripple",
  // Threats / violence
  "kill","killyou","murder","stab","shoot","rape","die","hang","behead",
  "lynch","bomb","strangle","choke","slaughter","execute","assault",
];

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i" };
const normalizeChar = (c: string) => LEET[c] ?? c.toLowerCase();
const normalizeWord = (w: string) => w.split("").map(normalizeChar).join("");

const BAD_SET = new Set(BAD_WORDS.map((w) => w.toLowerCase()));

// Mask length scales with word length: short -> 1 *, medium -> 2 *, long -> 3 *.
const maskFor = (len: number) => "*".repeat(len <= 4 ? 1 : len <= 7 ? 2 : 3);

export function censorText(input: string): string {
  if (!input) return input;
  return input.replace(/[A-Za-z0-9@$!]+/g, (token) => {
    const norm = normalizeWord(token);
    if (BAD_SET.has(norm)) return maskFor(token.length);
    const stripped = norm.replace(/(ing|ed|er|s)$/, "");
    if (stripped && stripped !== norm && BAD_SET.has(stripped)) return maskFor(token.length);
    return token;
  });
}
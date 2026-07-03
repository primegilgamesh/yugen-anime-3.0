import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorScreenProps {
  code?: string | number;
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHome?: boolean;
}

const ErrorScreen = ({
  code = "500",
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  showHome = true,
}: ErrorScreenProps) => {
  const digits = String(code).split("");

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 overflow-hidden relative">
      {/* animated background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-destructive/10 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center animate-fade-in">
        <div className="mb-4 flex items-center gap-2 text-destructive animate-[pulse_2s_ease-in-out_infinite]">
          <AlertTriangle size={20} />
          <span className="text-xs font-semibold uppercase tracking-[0.25em]">Error</span>
        </div>

        <div
          className="flex items-center gap-2 md:gap-4 font-display font-extrabold leading-none select-none"
          aria-label={`Error ${code}`}
        >
          {digits.map((d, i) => (
            <span
              key={i}
              className="error-digit text-[6rem] md:text-[9rem] bg-gradient-to-br from-primary via-primary/70 to-destructive bg-clip-text text-transparent drop-shadow-[0_0_25px_hsl(var(--primary)/0.35)]"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {d}
            </span>
          ))}
        </div>

        <h1 className="mt-4 text-xl md:text-2xl font-display font-bold text-foreground animate-fade-in">
          {title}
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground animate-fade-in">
          {message}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2 hover:scale-105 transition-transform"
            >
              <RefreshCw size={14} className="animate-[spin_2s_linear_infinite]" />
              Try again
            </button>
          )}
          {showHome && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card text-foreground text-sm font-medium px-4 py-2 hover:bg-secondary transition-colors"
            >
              <Home size={14} />
              Go home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;

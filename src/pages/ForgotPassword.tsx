import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowLeft, Eye, EyeOff, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Step = "email" | "code" | "done";

const ForgotPassword = () => {
  const { requestPasswordReset, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  const sendCode = () => {
    const res = requestPasswordReset(email.trim());
    if (!res.success) { toast.error(res.error); return; }
    setExpiresAt(res.expiresAt!);
    // No mail backend is configured, so the code is delivered locally via a toast
    // that simulates the email. Each request generates a brand-new code, so any
    // earlier code is immediately invalidated — preventing reuse / breach.
    toast.success(`Reset code sent to ${email}`, {
      description: `Demo code (expires in 10 min): ${res.code}`,
      duration: 15000,
    });
    setStep("code");
  };

  const submitReset = () => {
    const res = resetPassword(email.trim(), code, newPassword);
    if (!res.success) { toast.error(res.error); return; }
    toast.success("Password updated. Please sign in.");
    setStep("done");
    setTimeout(() => navigate("/signin"), 800);
  };

  const resend = () => {
    const res = requestPasswordReset(email.trim());
    if (!res.success) { toast.error(res.error); return; }
    setExpiresAt(res.expiresAt!);
    toast.success("A new code was generated. The previous code is no longer valid.", {
      description: `Demo code: ${res.code}`,
      duration: 15000,
    });
  };

  const card = (
    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm">
      <h1 className="font-display text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        <span className="text-emerald-500">✦</span> Reset Password
      </h1>
      <p className="text-sm text-gray-500 mb-5">
        {step === "email" && "Enter your account email to receive a reset code."}
        {step === "code" && "Enter the 6-digit code we sent and your new password."}
        {step === "done" && "Your password has been reset."}
      </p>

      {step === "email" && (
        <div className="space-y-4">
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 gap-2">
            <Mail size={16} className="text-gray-400" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent" />
          </div>
          <button onClick={sendCode} className="w-full bg-emerald-500 text-white font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-emerald-600 transition">Send reset code</button>
          <p className="text-xs text-gray-500 text-center">Remembered it? <Link to="/signin" className="text-emerald-500 font-medium">Sign in</Link></p>
        </div>
      )}

      {step === "code" && (
        <div className="space-y-4">
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 gap-2">
            <KeyRound size={16} className="text-gray-400" />
            <input inputMode="numeric" maxLength={6} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="flex-1 outline-none text-sm tracking-[0.4em] text-gray-700 placeholder:text-gray-400 bg-transparent" />
          </div>
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 gap-2">
            <Lock size={16} className="text-gray-400" />
            <input type={showPassword ? "text" : "password"} placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="flex-1 outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {expiresAt && (
            <p className="text-[11px] text-gray-400">Code expires at {new Date(expiresAt).toLocaleTimeString()}. A new request invalidates the previous code.</p>
          )}
          <div className="flex items-center justify-between gap-2">
            <button onClick={resend} className="text-emerald-600 text-sm font-medium hover:underline">Resend code</button>
            <button onClick={submitReset} className="bg-emerald-500 text-white font-semibold text-sm px-5 py-2 rounded-md hover:bg-emerald-600 transition">Reset password</button>
          </div>
        </div>
      )}

      {step === "done" && (
        <Link to="/signin" className="block text-center bg-emerald-500 text-white font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-emerald-600 transition">Go to sign in</Link>
      )}
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400" />
      <Link to="/signin" className="absolute top-4 left-4 z-20 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
        <ArrowLeft size={20} className="text-white" />
      </Link>
      <div className="hidden md:flex items-center justify-center min-h-screen relative z-10">{card}</div>
      <div className="md:hidden flex flex-col min-h-screen relative z-10">
        <div className="h-[30vh]" />
        <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-6">
          <div className="-mx-2">{card}</div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
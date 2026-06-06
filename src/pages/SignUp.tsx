import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth, validateUsername, validateEmail, validatePassword } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !repeat) {
      toast.error("Please fill in all fields");
      return;
    }
    const ue = validateUsername(username);
    if (ue) { toast.error(ue); return; }
    const ee = validateEmail(email);
    if (ee) { toast.error(ee); return; }
    const pe = validatePassword(password);
    if (pe) { toast.error(pe); return; }
    if (password !== repeat) { toast.error("Passwords do not match"); return; }

    const result = signup(username, email, password);
    if (result.success) {
      toast.success("Account created! Welcome!");
      navigate("/");
    } else {
      toast.error(result.error);
    }
  };

  const formContent = (mobile?: boolean) => (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className={`flex items-center border border-gray-200 rounded-lg px-3 ${mobile ? "py-3" : "py-2.5"} gap-2`}>
        <User size={14} className="text-gray-400 flex-shrink-0" />
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="flex-1 outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent min-w-0" />
      </div>
      <div className={`flex items-center border border-gray-200 rounded-lg px-3 ${mobile ? "py-3" : "py-2.5"} gap-2`}>
        <Mail size={14} className="text-gray-400 flex-shrink-0" />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent min-w-0" />
      </div>
      <div className="flex gap-2">
        <div className={`flex-1 flex items-center border border-gray-200 rounded-lg px-2 ${mobile ? "py-3" : "py-2.5"} gap-1 min-w-0`}>
          <Lock size={12} className="text-gray-400 flex-shrink-0" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 outline-none text-[11px] text-gray-700 placeholder:text-gray-400 bg-transparent min-w-0" />
        </div>
        <div className={`flex-1 flex items-center border border-gray-200 rounded-lg px-2 ${mobile ? "py-3" : "py-2.5"} gap-1 min-w-0`}>
          <Lock size={12} className="text-gray-400 flex-shrink-0" />
          <input type="password" placeholder="Repeat" value={repeat} onChange={(e) => setRepeat(e.target.value)} className="flex-1 outline-none text-[11px] text-gray-700 placeholder:text-gray-400 bg-transparent min-w-0" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <p className="text-gray-500 text-xs">Already have an account? <Link to="/signin" className="text-emerald-500 font-medium">Sign In</Link></p>
        <button type="submit" className="bg-emerald-500 text-white font-semibold text-sm px-5 py-2 rounded-md hover:bg-emerald-600 transition">Sign Up</button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400" />
      <div className="absolute top-[10%] left-[5%] w-16 h-16 bg-white/10 rounded-lg rotate-12 animate-pulse" />
      <div className="absolute top-[40%] right-[15%] w-24 h-24 bg-white/10 rounded-2xl rotate-45" />
      <div className="absolute bottom-[15%] right-[10%] w-32 h-32 bg-white/10 rounded-2xl -rotate-12" />

      <Link to="/" className="absolute top-4 left-4 z-20 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
        <ArrowLeft size={20} className="text-white" />
      </Link>

      {/* Desktop */}
      <div className="hidden md:flex items-center justify-center min-h-screen relative z-10">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <span className="text-emerald-500">✦</span> YugenAnime
          </h1>
          {formContent()}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex flex-col min-h-screen relative z-10">
        <div className="h-[35vh]" />
        <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-6">
          <h1 className="font-display text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <span className="text-emerald-500">✦</span> YugenAnime
          </h1>
          {formContent(true)}
        </div>
      </div>
    </div>
  );
};

export default SignUp;

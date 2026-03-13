import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const DOCTORS_KEY = "veda_doctors";
const PATIENTS_KEY = "veda_patients";

const readList = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

export default function LoginModal({ open, onClose, onLogin, onOpenSignup }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ role: "patient", email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    setError("");

    const users = form.role === "doctor" ? readList(DOCTORS_KEY) : readList(PATIENTS_KEY);
    const found = users.find(
      (u) => u.email.toLowerCase() === form.email.trim().toLowerCase() && u.password === form.password
    );

    if (!found) {
      setError("Invalid credentials for selected role.");
      return;
    }

    const nextSession = {
      id: found.id,
      role: form.role,
      name: found.fullName,
      email: found.email,
      loggedInAt: new Date().toISOString(),
    };

    onLogin?.(nextSession);
    navigate(form.role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop: Click anywhere to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[210] bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          <div className="fixed inset-0 z-[220] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="relative flex w-full max-w-[760px] lg:h-[500px] overflow-hidden rounded-[1.5rem] bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.45)] pointer-events-auto"
            >
              
              {/* LEFT: Artwork (Desktop only) */}
              <div className="relative hidden w-[42%] bg-[#0a1128] lg:block">
                <img 
                  src="/imgg.jpg" 
                  alt="Login Background" 
                  className="h-full w-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0a1128]/80 via-transparent to-transparent p-10 flex flex-col justify-end">
                  <h2 className="text-3xl font-light tracking-tight text-white uppercase leading-none">
                    Veda <br/><span className="italic font-normal">Health</span>
                  </h2>
                </div>
              </div>

              {/* RIGHT: Form */}
              <div className="flex w-full flex-col bg-white px-8 py-10 lg:w-[58%] lg:px-12">
                <header className="mb-8 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign In</h1>
                    <p className="text-xs text-slate-400 mt-1">Welcome back to your portal.</p>
                  </div>
                  <button onClick={onClose} className="text-slate-300 hover:text-slate-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </header>

                {/* Compact Role Tab */}
                <div className="mb-8 flex gap-6 border-b border-slate-100">
                  {["patient", "doctor"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, role }))}
                      className={`relative pb-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                        form.role === role ? "text-slate-900" : "text-slate-300 hover:text-slate-500"
                      }`}
                    >
                      {role}
                      {form.role === role && (
                        <motion.div layoutId="tab" className="absolute bottom-0 left-0 h-[2px] w-full bg-slate-900" />
                      )}
                    </button>
                  ))}
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                  {/* Email */}
                  <div className="group relative">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-slate-900">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      required
                      placeholder="Enter your email"
                      className="w-full border-b border-slate-200 bg-transparent py-2 text-sm text-slate-900 outline-none transition-colors focus:border-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Password with Eye Toggle */}
                  <div className="group relative">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-slate-900">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                        required
                        placeholder="••••••••"
                        className="w-full border-b border-slate-200 bg-transparent py-2 text-sm text-slate-900 outline-none transition-colors focus:border-slate-900 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-[10px] font-bold text-red-500 uppercase">{error}</p>
                  )}

                  <button
                    type="submit"
                    className="mt-2 w-full bg-[#0a1128] py-3.5 text-[10px] font-bold tracking-[0.3em] text-white uppercase transition-all hover:bg-black active:scale-[0.98] shadow-lg shadow-black/10"
                  >
                    Enter Portal
                  </button>
                </form>

                <footer className="mt-10 flex flex-col gap-1 items-center lg:items-start">
                  <p className="text-[10px] text-slate-400">
                    New to Veda?{" "}
                    <button
                      type="button"
                      onClick={() => { onClose?.(); onOpenSignup?.(); }}
                      className="font-bold text-slate-900 hover:underline"
                    >
                      Join now
                    </button>
                  </p>
                </footer>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
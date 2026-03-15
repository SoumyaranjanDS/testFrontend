// src/components/LoginModal.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const DOCTORS_KEY = "veda_doctors";
const PATIENTS_KEY = "veda_patients";

/**
 * Hidden admin credentials (demo only).
 * TODO(BACKEND): move admin auth to secure backend login.
 */
const ADMIN_CREDENTIALS = [
  { email: "admin@vedaai.com", password: "Admin@123", name: "Super Admin" },
  { email: "review@vedaai.com", password: "Review@123", name: "Verification Admin" },
];

const readList = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const isValidRole = (r) => r === "patient" || r === "doctor";

export default function LoginModal({ open, onClose, onLogin, onOpenSignup }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const roleFromUrl = searchParams.get("role");
  const initialRole = isValidRole(roleFromUrl) ? roleFromUrl : "patient";

  const [form, setForm] = useState({
    role: initialRole,
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const nextRole = isValidRole(roleFromUrl) ? roleFromUrl : "patient";
    setForm({ role: nextRole, email: "", password: "" });
    setError("");
    setShowPassword(false);
  }, [roleFromUrl]);

  const resetAuthFields = (roleValue = form.role) => {
    setForm({ role: roleValue, email: "", password: "" });
    setError("");
    setShowPassword(false);
  };

  if (!open) return null;

  const setRoleInUrl = (role) => {
    const next = new URLSearchParams(searchParams);
    next.set("modal", "login");
    next.set("role", role);
    setSearchParams(next, { replace: true });
  };

  const closeModal = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("modal");
    next.delete("role");
    setSearchParams(next, { replace: true });

    resetAuthFields(isValidRole(roleFromUrl) ? roleFromUrl : "patient");
    onClose?.();
  };

  const submit = (e) => {
    e.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    // Hidden admin login through doctor role
    if (form.role === "doctor") {
      const adminMatch = ADMIN_CREDENTIALS.find(
        (a) => a.email.toLowerCase() === email && a.password === password
      );

      if (adminMatch) {
        const adminSession = {
          id: `admin-${adminMatch.email}`,
          role: "admin",
          name: adminMatch.name,
          email: adminMatch.email,
          loggedInAt: new Date().toISOString(),
        };

        resetAuthFields("doctor");
        onLogin?.(adminSession);
        navigate("/admin/verification");
        return;
      }
    }

    const users = form.role === "doctor" ? readList(DOCTORS_KEY) : readList(PATIENTS_KEY);
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === email &&
        u.password === password
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
      verificationStatus: found.verificationStatus || "not_submitted",
      loggedInAt: new Date().toISOString(),
    };

    resetAuthFields(form.role);
    onLogin?.(nextSession);

    if (form.role === "doctor") {
      const status = found.verificationStatus || "not_submitted";
      navigate(status === "verified" ? "/dashboard/doctor" : "/doctor/verification");
    } else {
      navigate("/dashboard/patient");
    }
  };

  const switchRole = (role) => {
    setRoleInUrl(role);
    resetAuthFields(role);
  };

  const goToSignup = () => {
    closeModal();
    onOpenSignup?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-[210] bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          <div className="fixed inset-0 z-[220] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="relative flex w-full max-w-[760px] lg:h-[500px] overflow-hidden rounded-[1.5rem] bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.45)] pointer-events-auto"
            >
              <div className="relative hidden w-[42%] bg-[#0a1128] lg:block">
                <img
                  src="/imgg.jpg"
                  alt="Login Background"
                  className="h-full w-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0a1128]/80 via-transparent to-transparent p-10 flex flex-col justify-end">
                  <h2 className="text-3xl font-light tracking-tight text-white uppercase leading-none">
                    Veda <br />
                    <span className="italic font-normal">Health</span>
                  </h2>
                </div>
              </div>

              <div className="flex w-full flex-col bg-white px-8 py-10 lg:w-[58%] lg:px-12">
                <header className="mb-8 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Log In</h1>
                    <p className="text-xs text-slate-400 mt-1">Welcome back to your portal.</p>
                  </div>
                  <button onClick={closeModal} className="text-slate-300 hover:text-slate-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </header>

                <div className="mb-8 flex gap-6 border-b border-slate-100">
                  {["patient", "doctor"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => switchRole(role)}
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
                  <div className="group relative">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-slate-900">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      required
                      placeholder="Enter your email"
                      className="w-full border-b border-slate-200 bg-transparent py-2 text-sm text-slate-900 outline-none transition-colors focus:border-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="group relative">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-slate-900">
                      Password
                    </label>
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
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-[10px] font-bold text-red-500 uppercase">{error}</p>}

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
                    <button type="button" onClick={goToSignup} className="font-bold text-slate-900 hover:underline">
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

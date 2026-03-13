import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MoveRight, X, Menu, LogOut, LayoutDashboard } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Features", id: "features" },
  { label: "Reviews", id: "reviews" },
];

const easeSmooth = [0.22, 1, 0.36, 1];

export default function Navbar({ session, onLogout, onOpenLogin, onOpenSignup }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [tone, setTone] = useState("home");

  const isLoggedIn = Boolean(session?.email);
  const dashboardPath = useMemo(
    () => (session?.role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient"),
    [session?.role]
  );

  // Logic for scroll spy and body lock remains same...
  useEffect(() => {
    document.body.style.overflow = (menuOpen || showLogoutConfirm) ? "hidden" : "";
  }, [menuOpen, showLogoutConfirm]);

  const handleSectionNav = (id) => {
    setMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed inset-x-0 top-0 z-[999] px-4 py-6 pointer-events-none"
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          
          {/* LOGO */}
          <button onClick={() => handleSectionNav("home")} className="pointer-events-auto flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a1128] text-white shadow-xl">
              <span className="text-xl font-serif">V</span>
            </div>
            <span className="text-xl font-bold tracking-tighter text-slate-900">
              VEDA<span className="font-light italic">AI</span>
            </span>
          </button>

          {/* DESKTOP NAV RAIL */}
          <nav className="pointer-events-auto hidden lg:flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/50 px-2 py-1.5 shadow-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionNav(item.id)}
                className="px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-colors"
              >
                {item.label}
              </button>
            ))}
            
            <div className="mx-2 h-4 w-[1px] bg-slate-200" />

            {!isLoggedIn ? (
              <div className="flex items-center">
                <button onClick={onOpenLogin} className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 hover:opacity-70">
                  Login
                </button>
                <button onClick={onOpenSignup} className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a1128] hover:opacity-70">
                  Signup
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => navigate(dashboardPath)} 
                  className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                >
                  <LayoutDashboard size={14} /> Dashboard
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(true)} 
                  className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </nav>

          {/* MOBILE TRIGGER */}
          <button onClick={() => setMenuOpen(true)} className="pointer-events-auto flex lg:hidden h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-900">
            <Menu size={20} />
          </button>
        </div>
      </motion.header>

      {/* LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                <LogOut size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Confirm Logout</h3>
              <p className="mt-2 text-sm text-slate-500">Are you sure you want to end your session?</p>
              <div className="mt-8 flex flex-col gap-3">
                <button 
                  onClick={() => { onLogout(); setShowLogoutConfirm(false); }}
                  className="w-full rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-900 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE MENU (Enhanced with Dashboard/Logout) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-0 z-[1000] bg-white lg:hidden flex flex-col p-8">
             <div className="flex items-center justify-between mb-12">
                <span className="text-xl font-bold tracking-tighter">VEDA AI</span>
                <button onClick={() => setMenuOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50"><X size={24}/></button>
             </div>
             <div className="flex flex-col gap-6">
                {navItems.map(item => (
                  <button key={item.id} onClick={() => handleSectionNav(item.id)} className="text-left text-3xl font-light text-slate-900 hover:pl-2 transition-all">{item.label}</button>
                ))}
             </div>
             <div className="mt-auto flex flex-col gap-4">
                {!isLoggedIn ? (
                  <>
                    <button onClick={() => { setMenuOpen(false); onOpenLogin(); }} className="w-full border border-slate-200 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px]">Login</button>
                    <button onClick={() => { setMenuOpen(false); onOpenSignup(); }} className="w-full bg-[#0a1128] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px]">Signup</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setMenuOpen(false); navigate(dashboardPath); }} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px]">Dashboard</button>
                    <button onClick={() => { setMenuOpen(false); setShowLogoutConfirm(true); }} className="w-full border border-red-200 text-red-500 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px]">Logout</button>
                  </>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
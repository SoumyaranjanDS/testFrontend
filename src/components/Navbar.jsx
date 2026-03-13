import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Menu, LogOut, LayoutDashboard, ChevronRight, Home, Info, Zap, Star, ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Home", id: "home", icon: Home },
  { label: "About", id: "about", icon: Info },
  { label: "Features", id: "features", icon: Zap },
  { label: "Reviews", id: "reviews", icon: Star },
];

const easeSmooth = [0.4, 0, 0.2, 1];

const drawerVariants = {
  closed: { x: "100%", transition: { duration: 0.5, ease: [0.7, 0, 0.3, 1] } },
  open: { x: 0, transition: { duration: 0.7, ease: easeSmooth, staggerChildren: 0.08, delayChildren: 0.1 } }
};

const linkVariants = {
  closed: { opacity: 0, x: 20 },
  open: { opacity: 1, x: 0, transition: { duration: 0.4, ease: easeSmooth } }
};

export default function Navbar({ session, onLogout, onOpenLogin, onOpenSignup }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isLoggedIn = Boolean(session?.email);
  const dashboardPath = useMemo(
    () => (session?.role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient"),
    [session?.role]
  );

  useEffect(() => {
    document.body.style.overflow = (menuOpen || showLogoutConfirm) ? "hidden" : "";
  }, [menuOpen, showLogoutConfirm]);

  const handleSectionNav = (id) => {
    setMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 150);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed inset-x-0 top-0 z-[999] px-6 py-6 pointer-events-none"
      >
        <div className="mx-auto max-w-7xl grid grid-cols-2 lg:grid-cols-3 items-center">
          {/* LOGO */}
          <div className="flex justify-start">
            <button onClick={() => handleSectionNav("home")} className="pointer-events-auto flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a1128] text-white shadow-lg">
                <span className="text-lg font-serif italic">V</span>
              </div>
              <span className="text-lg font-bold tracking-tighter text-slate-900">VEDA<span className="text-slate-400 italic font-light text-xs ml-0.5">AI</span></span>
            </button>
          </div>

          {/* DESKTOP NAV */}
          <nav className="pointer-events-auto hidden lg:flex items-center justify-center gap-1 rounded-full bg-white/70 backdrop-blur-md border border-slate-200/50 px-2 py-1 shadow-sm">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => handleSectionNav(item.id)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-colors">
                {item.label}
              </button>
            ))}
          </nav>

          {/* DESKTOP AUTH */}
          <div className="flex justify-end items-center gap-2 pointer-events-auto">
            <div className="hidden lg:flex items-center gap-1 bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-full p-1 shadow-sm">
              {!isLoggedIn ? (
                <>
                  <button onClick={onOpenLogin} className="px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">Login</button>
                  <button onClick={onOpenSignup} className="px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#0a1128] text-white rounded-full">Sign up</button>
                </>
              ) : (
                <div className="flex items-center">
                  <button onClick={() => navigate(dashboardPath)} className="px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Dashboard</button>
                  <button onClick={() => setShowLogoutConfirm(true)} className="px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">Logout</button>
                </div>
              )}
            </div>

            <button onClick={() => setMenuOpen(true)} className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-900 shadow-sm">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* HALF-SCREEN DRAWER */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} className="fixed inset-0 z-[1000] bg-black/30 backdrop-blur-sm lg:hidden" />
            <motion.aside
              variants={drawerVariants} initial="closed" animate="open" exit="closed"
              className="fixed right-0 top-0 z-[1001] h-full w-[80%] max-w-[360px] bg-white lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-8 border-b border-slate-50">
                <span className="text-xs font-bold tracking-[0.3em] uppercase text-slate-400">Navigation</span>
                <button onClick={() => setMenuOpen(false)} className="text-slate-400"><X size={24} /></button>
              </div>

              <div className="flex flex-col py-6 px-4">
                {navItems.map((item) => (
                  <motion.button key={item.id} variants={linkVariants} onClick={() => handleSectionNav(item.id)} className="flex items-center justify-between p-4 rounded-2xl group">
                    <div className="flex items-center gap-4">
                      <item.icon size={20} className="text-slate-300 group-hover:text-[#0a1128]" />
                      <span className="text-lg font-medium text-slate-600 group-hover:text-slate-900">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-200 group-hover:text-slate-900" />
                  </motion.button>
                ))}
              </div>

              {/* DRAWER BOTTOM ACTIONS */}
              <motion.div variants={linkVariants} className="mt-auto p-6 bg-slate-50/80">
                {!isLoggedIn ? (
                  <div className="flex flex-col gap-3">
                    <button onClick={() => { setMenuOpen(false); onOpenLogin(); }} className="w-full bg-white border border-slate-200 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Login</button>
                    <button onClick={() => { setMenuOpen(false); onOpenSignup(); }} className="w-full bg-[#0a1128] text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/10">Sign Up</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {/* Dashboard and Logout side-by-side or stacked cleanly */}
                    <button onClick={() => { setMenuOpen(false); navigate(dashboardPath); }} className="w-full bg-[#0a1128] text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      <LayoutDashboard size={14} /> Dashboard
                    </button>
                    <button onClick={() => { setMenuOpen(false); setShowLogoutConfirm(true); }} className="w-full bg-red-50 text-red-500 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* CONFIRMATION POPUP */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogoutConfirm(false)} className="absolute inset-0 bg-[#0a1128]/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-10 text-center shadow-2xl"
            >
              <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                <LogOut size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Wait!</h3>
              <p className="text-slate-500 mt-2 text-sm">Are you sure you want to log out of your portal?</p>
              
              <div className="mt-10 flex flex-col gap-3">
                <button onClick={() => { onLogout(); setShowLogoutConfirm(false); }} className="w-full py-4 bg-red-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-red-600 transition-colors">
                  Yes, Sign Out
                </button>
                <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em]">
                  Stay Logged In
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
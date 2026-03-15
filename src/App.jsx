// src/App.jsx
import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useInRouterContext,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";

import Hero from "./components/Hero";
import About from "./components/About";
import Features from "./components/Features";
import HowToUse from "./components/HowToUse";
import Testimonials from "./components/Testimonials";

import PatientSignup from "./pages/PatientSignup";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorSignup from "./components/DoctorSignup";

const SESSION_KEY = "veda_session";

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function ProtectedRole({ session, role, children }) {
  if (!session?.email) return <Navigate to="/" replace />;
  if (session.role !== role) {
    return (
      <Navigate
        to={session.role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient"}
        replace
      />
    );
  }
  return children;
}

function LandingPage({ isLoggedIn, session, onOpenLogin, onOpenSignup }) {
  return (
    <>
      <section id="home">
        <Hero
          isLoggedIn={isLoggedIn}
          session={session}
          onOpenLogin={onOpenLogin}
          onOpenSignup={onOpenSignup}
        />
      </section>
      <section id="about"><About /></section>
      <section id="features"><Features /></section>
      <section id="how-to-use"><HowToUse /></section>
      <section id="reviews"><Testimonials /></section>
    </>
  );
}

function AppInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [session, setSession] = useState(readSession);
  const isLoggedIn = useMemo(() => Boolean(session?.email), [session]);
  const isHome = location.pathname === "/";

  const modal = searchParams.get("modal");
  const loginOpen = modal === "login" && !isLoggedIn;
  const signupOpen = modal === "signup" && !isLoggedIn;

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === SESSION_KEY) setSession(readSession());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const clearModalFromUrl = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("modal");
    next.delete("role");
    setSearchParams(next, { replace: true });
  };

  const openLogin = (role = "patient") => {
    if (location.pathname !== "/") {
      navigate(`/?modal=login&role=${role}`);
      return;
    }
    const next = new URLSearchParams(searchParams);
    next.set("modal", "login");
    next.set("role", role);
    setSearchParams(next, { replace: false });
  };

  const openSignup = () => {
    if (location.pathname !== "/") {
      navigate("/?modal=signup");
      return;
    }
    const next = new URLSearchParams(searchParams);
    next.set("modal", "signup");
    next.delete("role");
    setSearchParams(next, { replace: false });
  };

  const onAuth = (nextSession) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    clearModalFromUrl();
  };

  const onLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    clearModalFromUrl();
  };

  return (
    <>
      <Navbar
        session={session}
        onLogout={onLogout}
        onOpenLogin={openLogin}
        onOpenSignup={openSignup}
      />

      <main className={isHome ? "" : "pt-22 sm:pt-24"}>
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                isLoggedIn={isLoggedIn}
                session={session}
                onOpenLogin={openLogin}
                onOpenSignup={openSignup}
              />
            }
          />

          <Route path="/login" element={<Navigate to="/?modal=login&role=patient" replace />} />
          <Route path="/login/patient" element={<Navigate to="/?modal=login&role=patient" replace />} />
          <Route path="/login/doctor" element={<Navigate to="/?modal=login&role=doctor" replace />} />

          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route
            path="/signup/doctor"
            element={isLoggedIn ? <Navigate to="/" replace /> : <DoctorSignup onSignup={onAuth} />}
          />
          <Route
            path="/signup/patient"
            element={isLoggedIn ? <Navigate to="/" replace /> : <PatientSignup onSignup={onAuth} />}
          />

          <Route
            path="/dashboard/doctor"
            element={
              <ProtectedRole session={session} role="doctor">
                <DoctorDashboard session={session} onLogout={onLogout} />
              </ProtectedRole>
            }
          />
          <Route
            path="/dashboard/patient"
            element={
              <ProtectedRole session={session} role="patient">
                <PatientDashboard session={session} onLogout={onLogout} />
              </ProtectedRole>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <LoginModal
        open={loginOpen}
        onClose={clearModalFromUrl}
        onLogin={onAuth}
        onOpenSignup={openSignup}
      />
      <SignupModal
        open={signupOpen}
        onClose={clearModalFromUrl}
        onOpenLogin={openLogin}
      />
    </>
  );
}

export default function App() {
  const inRouter = useInRouterContext();
  if (inRouter) return <AppInner />;

  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

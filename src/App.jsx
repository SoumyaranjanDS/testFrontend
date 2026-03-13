// src/App.jsx
import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useInRouterContext,
  useLocation,
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
  const isHome = location.pathname === "/";

  const [session, setSession] = useState(readSession);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const isLoggedIn = useMemo(() => Boolean(session?.email), [session]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === SESSION_KEY) setSession(readSession());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const onAuth = (nextSession) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    setLoginOpen(false);
    setSignupOpen(false);
  };

  const onLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setLoginOpen(false);
    setSignupOpen(false);
  };

  const openLogin = () => {
    setSignupOpen(false);
    setLoginOpen(true);
  };

  const openSignup = () => {
    setLoginOpen(false);
    setSignupOpen(true);
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
          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route
            path="/signup/doctor"
            element={isLoggedIn ? <Navigate to="/" replace /> : <DoctorSignup onSignup={onAuth}/>}
          />
          <Route
            path="/signup/patient"
            element={isLoggedIn ? <Navigate to="/" replace /> : <PatientSignup onSignup={onAuth} />}
          />

          <Route
            path="/dashboard/doctor"
            element={
              <ProtectedRole session={session} role="doctor">
                <DoctorDashboard session={session} />
              </ProtectedRole>
            }
          />
          <Route
            path="/dashboard/patient"
            element={
              <ProtectedRole session={session} role="patient">
                <PatientDashboard session={session} />
              </ProtectedRole>
            }
          />

          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <LoginModal
        open={loginOpen && !isLoggedIn}
        onClose={() => setLoginOpen(false)}
        onLogin={onAuth}
        onOpenSignup={openSignup}
      />
      <SignupModal
        open={signupOpen && !isLoggedIn}
        onClose={() => setSignupOpen(false)}
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

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
import AdminVerificationPanel from "./pages/AdminVerificationPanel";

import DoctorSignup from "./components/DoctorSignup";
import DoctorVerification from "./components/DoctorVerification";

const SESSION_KEY = "veda_session";
const DOCTORS_KEY = "veda_doctors";

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function getDoctorByEmail(email) {
  if (!email) return null;
  return readList(DOCTORS_KEY).find(
    (d) => d.email?.toLowerCase() === email.toLowerCase()
  );
}

function ProtectedRole({ session, role, children }) {
  if (!session?.email) return <Navigate to="/" replace />;
  if (session.role !== role) {
    if (session.role === "doctor") return <Navigate to="/doctor/verification" replace />;
    if (session.role === "admin") return <Navigate to="/admin/verification" replace />;
    return <Navigate to="/dashboard/patient" replace />;
  }
  return children;
}

function ProtectedDoctorDashboard({ session, doctorVerificationStatus, children }) {
  if (!session?.email) return <Navigate to="/" replace />;
  if (session.role !== "doctor") {
    if (session.role === "admin") return <Navigate to="/admin/verification" replace />;
    return <Navigate to="/dashboard/patient" replace />;
  }
  if (doctorVerificationStatus !== "verified") {
    return <Navigate to="/doctor/verification" replace />;
  }
  return children;
}

function ProtectedDoctorVerification({ session, doctorVerificationStatus, children }) {
  if (!session?.email) return <Navigate to="/" replace />;
  if (session.role !== "doctor") {
    if (session.role === "admin") return <Navigate to="/admin/verification" replace />;
    return <Navigate to="/dashboard/patient" replace />;
  }
  if (doctorVerificationStatus === "verified") {
    return <Navigate to="/dashboard/doctor" replace />;
  }
  return children;
}

function ProtectedAdmin({ session, children }) {
  if (!session?.email) return <Navigate to="/" replace />;
  if (session.role !== "admin") {
    if (session.role === "doctor") return <Navigate to="/doctor/verification" replace />;
    if (session.role === "patient") return <Navigate to="/dashboard/patient" replace />;
    return <Navigate to="/" replace />;
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
  const [doctorRefresh, setDoctorRefresh] = useState(0);

  const isLoggedIn = useMemo(() => Boolean(session?.email), [session]);
  const isHome = location.pathname === "/";

  const doctorProfile = useMemo(() => {
    if (session?.role !== "doctor" || !session?.email) return null;
    return getDoctorByEmail(session.email);
  }, [session, doctorRefresh]);

  const doctorVerificationStatus = doctorProfile?.verificationStatus || "not_submitted";

  const modal = searchParams.get("modal");
  const loginOpen = modal === "login" && !isLoggedIn;
  const signupOpen = modal === "signup" && !isLoggedIn;

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === SESSION_KEY) setSession(readSession());
      if (e.key === DOCTORS_KEY) setDoctorRefresh((v) => v + 1);
    };
    const onDoctorUpdated = () => setDoctorRefresh((v) => v + 1);

    window.addEventListener("storage", onStorage);
    window.addEventListener("veda:doctor-updated", onDoctorUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("veda:doctor-updated", onDoctorUpdated);
    };
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
    setDoctorRefresh((v) => v + 1);
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
        doctorVerificationStatus={doctorVerificationStatus}
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
            path="/doctor/verification"
            element={
              <ProtectedDoctorVerification
                session={session}
                doctorVerificationStatus={doctorVerificationStatus}
              >
                <DoctorVerification session={session} />
              </ProtectedDoctorVerification>
            }
          />

          <Route
            path="/dashboard/doctor"
            element={
              <ProtectedDoctorDashboard
                session={session}
                doctorVerificationStatus={doctorVerificationStatus}
              >
                <DoctorDashboard session={session} onLogout={onLogout} />
              </ProtectedDoctorDashboard>
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

          <Route
            path="/admin/verification"
            element={
              <ProtectedAdmin session={session}>
                <AdminVerificationPanel />
              </ProtectedAdmin>
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

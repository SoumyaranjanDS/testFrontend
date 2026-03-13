// Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const DOCTORS_KEY = "veda_doctors";
const PATIENTS_KEY = "veda_patients";
const SESSION_KEY = "veda_session";

const readList = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    role: "patient",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const onChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();
    const list = form.role === "doctor" ? readList(DOCTORS_KEY) : readList(PATIENTS_KEY);

    const user = list.find(
      (u) => u.email.toLowerCase() === email && u.password === form.password
    );

    if (!user) {
      setError("Invalid credentials for selected role.");
      return;
    }

    const session = {
      id: user.id,
      role: form.role,
      name: user.fullName,
      email: user.email,
      loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    onLogin?.(session);
    navigate("/");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(130deg,#ecf6ff_0%,#e7f2ff_34%,#eaf8f3_65%,#f4fbff_100%)] px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#2F78D9]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-6 h-80 w-80 rounded-full bg-[#68B2A0]/20 blur-3xl" />

      <section className="relative mx-auto w-full max-w-md rounded-[28px] border border-white/60 bg-white/50 p-6 shadow-[0_30px_100px_-40px_rgba(35,95,168,0.55)] backdrop-blur-2xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2F78D9]">VedaAI</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#17363D]">Login</h1>
        <p className="mt-1 text-sm text-[#667D86]">Access your secure healthcare dashboard</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/70 bg-white/45 p-1.5">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, role: "patient" }))}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                form.role === "patient"
                  ? "bg-white text-[#17363D] shadow-sm"
                  : "text-[#5c7581]"
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, role: "doctor" }))}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                form.role === "doctor"
                  ? "bg-white text-[#17363D] shadow-sm"
                  : "text-[#5c7581]"
              }`}
            >
              Doctor
            </button>
          </div>

          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={onChange}
            required
            className="w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-[#17363D] outline-none placeholder:text-[#88a1ad] focus:border-[#2F78D9]"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
            className="w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-[#17363D] outline-none placeholder:text-[#88a1ad] focus:border-[#2F78D9]"
          />

          {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-[linear-gradient(135deg,#2F78D9,#245fb0)] px-4 py-3 font-semibold text-white transition hover:brightness-105"
          >
            Login
          </button>
        </form>

        <p className="mt-5 text-sm text-[#667D86]">
          Need an account?{" "}
          <Link to="/signup" className="font-semibold text-[#2F78D9]">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}

// src/components/PatientDashboard.jsx
import {
  Search,
  Bell,
  UserCircle2,
  Activity,
  BrainCircuit,
  CalendarCheck2,
  Stethoscope,
  FileText,
  BookOpenText,
  HeartPulse,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

const appointments = [
  { doctor: "Dr. Mehta", date: "Today, 5:30 PM" },
  { doctor: "Dr. Priya", date: "Mar 16, 11:00 AM" },
];

const reports = [
  { name: "CBC Report", status: "Reviewed" },
  { name: "Vitamin Panel", status: "Pending" },
  { name: "Lipid Profile", status: "Reviewed" },
];

export default function PatientDashboard({ session }) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#f8fcff_0%,#edf6ff_48%,#f8fffb_100%)] px-4 py-6 sm:py-8">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#90c2ff]/35 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-[#9dd9ca]/30 blur-3xl" />

      <div className="section-shell grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="lg:col-span-2 flex flex-wrap items-center gap-3 border-b border-[#d9e8f6] pb-4"
        >
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[#6b8793]" />
            <input
              placeholder="Search reports, symptoms, appointments..."
              className="w-full border-0 border-b border-[#c7ddee] bg-transparent py-2 pl-6 pr-2 text-sm text-[#17363d] outline-none focus:border-[#2f78d9]"
            />
          </div>
          <button className="text-[#4d6670]"><Bell size={18} /></button>
          <div className="ml-auto flex items-center gap-2 text-[#17363d]">
            <UserCircle2 size={20} />
            <span className="text-sm font-semibold">{session?.name || "Patient"}</span>
          </div>
        </motion.header>

        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.75, ease }}
          className="lg:sticky lg:top-24 h-max"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#2f78d9]">Health</p>
          <div className="space-y-2">
            {[
              "Health Score",
              "AI Health Check",
              "Appointments",
              "Symptom Checker",
              "Health Reports",
              "Learning Resources",
              "Health Tracker",
            ].map((item) => (
              <button key={item} className="group flex w-full items-center justify-between py-2 text-left text-sm text-[#37535d]">
                <span>{item}</span>
                <ChevronRight size={14} className="opacity-40 transition group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </motion.aside>

        {/* Main */}
        <main className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.85, ease }}
            className="grid gap-4 sm:grid-cols-3 border-b border-[#d9e8f6] pb-6"
          >
            <div>
              <div className="flex items-center gap-2 text-[#54717c]"><Activity size={15} />Health Score</div>
              <p className="mt-2 text-3xl font-semibold text-[#17363d]">82</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[#54717c]"><BrainCircuit size={15} />AI Health Check</div>
              <p className="mt-2 text-sm font-medium text-[#17363d]">No high-risk alert today</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[#54717c]"><CalendarCheck2 size={15} />Appointments</div>
              <p className="mt-2 text-3xl font-semibold text-[#17363d]">{appointments.length}</p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, ease }}
            className="border-b border-[#d9e8f6] pb-6"
          >
            <h3 className="text-xl font-semibold text-[#17363d]">Symptom Checker</h3>
            <p className="mt-2 text-sm text-[#5f7a86]">Describe symptoms clearly before consultation.</p>
            <button className="mt-4 inline-flex items-center gap-2 text-[#2f78d9] hover:underline">
              <Stethoscope size={16} />
              Start AI Symptom Check
            </button>
            {/* TODO(BACKEND): submit symptoms to patient triage endpoint */}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, ease }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <div className="border-b border-[#d9e8f6] pb-6">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-[#17363d]">
                <FileText size={18} /> Health Reports
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-[#274854]">
                {reports.map((r) => (
                  <li key={r.name} className="flex items-center justify-between">
                    <span>{r.name}</span>
                    <span className={r.status === "Reviewed" ? "text-emerald-600" : "text-amber-600"}>
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
              {/* TODO(BACKEND): fetch reports list */}
            </div>

            <div className="border-b border-[#d9e8f6] pb-6">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-[#17363d]">
                <BookOpenText size={18} /> Learning Resources
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-[#274854]">
                <li>Managing stress with daily micro-habits</li>
                <li>How to track symptoms before doctor visit</li>
                <li>Understanding blood tests quickly</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, ease }}
            className="border-b border-[#d9e8f6] pb-8"
          >
            <h3 className="flex items-center gap-2 text-xl font-semibold text-[#17363d]">
              <HeartPulse size={18} /> Health Tracker
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Sleep", value: 78 },
                { label: "Hydration", value: 64 },
                { label: "Activity", value: 71 },
              ].map((t) => (
                <div key={t.label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-[#5f7a86]">
                    <span>{t.label}</span>
                    <span>{t.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#d9e8f6]">
                    <div
                      className="h-2 rounded-full bg-[linear-gradient(90deg,#68b2a0,#2f78d9)]"
                      style={{ width: `${t.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* TODO(BACKEND): fetch tracker metrics */}
          </motion.section>
        </main>
      </div>
    </section>
  );
}

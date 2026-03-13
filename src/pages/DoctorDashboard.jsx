// src/components/DoctorDashboard.jsx
import {
  Search,
  Bell,
  TriangleAlert,
  UserCircle2,
  LayoutDashboard,
  Users,
  ClipboardList,
  Siren,
  FileText,
  CalendarClock,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

const summary = [
  { label: "Patients Today", value: "28", icon: Users },
  { label: "Queue", value: "12", icon: ClipboardList },
  { label: "Emergencies", value: "3", icon: Siren },
  { label: "Reports", value: "18", icon: FileText },
];

const queue = [
  { name: "Ananya Rao", complaint: "Chest pain", risk: "High", wait: "12m" },
  { name: "Rahul Sen", complaint: "Fever + fatigue", risk: "Medium", wait: "24m" },
  { name: "Meera Das", complaint: "Breathlessness", risk: "High", wait: "8m" },
  { name: "Kabir Ali", complaint: "Headache", risk: "Low", wait: "31m" },
];

function riskTone(risk) {
  if (risk === "High") return "text-rose-600";
  if (risk === "Medium") return "text-amber-600";
  return "text-emerald-600";
}

export default function DoctorDashboard({ session }) {
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
              placeholder="Search patient, report, case..."
              className="w-full border-0 border-b border-[#c7ddee] bg-transparent py-2 pl-6 pr-2 text-sm text-[#17363d] outline-none focus:border-[#2f78d9]"
            />
          </div>
          <button className="text-[#4d6670]"><TriangleAlert size={18} /></button>
          <button className="text-[#4d6670]"><Bell size={18} /></button>
          <div className="ml-auto flex items-center gap-2 text-[#17363d]">
            <UserCircle2 size={20} />
            <span className="text-sm font-semibold">{session?.name || "Doctor"}</span>
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
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#2f78d9]">Workspace</p>
          <div className="space-y-2">
            {[
              { label: "Overview", icon: LayoutDashboard },
              { label: "Patients", icon: Users },
              { label: "Queue", icon: ClipboardList },
              { label: "Emergencies", icon: Siren },
              { label: "Reports", icon: FileText },
              { label: "Follow-ups", icon: CalendarClock },
            ].map(({ label, icon: Icon }) => (
              <button key={label} className="group flex w-full items-center justify-between py-2 text-left text-sm text-[#37535d]">
                <span className="flex items-center gap-2">
                  <Icon size={15} />
                  {label}
                </span>
                <ArrowUpRight size={14} className="opacity-40 transition group-hover:opacity-100" />
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
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 border-b border-[#d9e8f6] pb-6"
          >
            {summary.map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <div className="flex items-center gap-2 text-[#54717c]">
                  <Icon size={15} />
                  <p className="text-sm">{label}</p>
                </div>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-[#17363d]">{value}</p>
              </div>
            ))}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, ease }}
            className="border-b border-[#d9e8f6] pb-6"
          >
            <h3 className="text-xl font-semibold text-[#17363d]">Patient Queue</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-[680px] w-full text-left text-sm">
                <thead className="text-[#6a8793]">
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Complaint</th>
                    <th className="py-2">Risk</th>
                    <th className="py-2">Wait Time</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((row) => (
                    <tr key={row.name} className="border-t border-[#e6f0f8] text-[#203f49]">
                      <td className="py-3">{row.name}</td>
                      <td className="py-3">{row.complaint}</td>
                      <td className={`py-3 font-medium ${riskTone(row.risk)}`}>{row.risk}</td>
                      <td className="py-3">{row.wait}</td>
                      <td className="py-3">
                        <button className="text-[#2f78d9] hover:underline">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* TODO(BACKEND): fetch queue list + actions from doctor APIs */}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, ease }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <div className="border-b border-[#d9e8f6] pb-6">
              <h3 className="text-xl font-semibold text-[#17363d]">AI Triage Highlights</h3>
              <p className="mt-2 text-sm text-[#5f7a86]">High-risk cases needing immediate review</p>
              <ul className="mt-3 space-y-2 text-sm text-[#274854]">
                <li>Chest pain + high BP trend detected in 2 patients.</li>
                <li>Respiratory distress markers flagged in queue.</li>
                <li>Critical wait threshold exceeded for one case.</li>
              </ul>
              {/* TODO(BACKEND): inject AI triage insights */}
            </div>

            <div className="border-b border-[#d9e8f6] pb-6">
              <h3 className="text-xl font-semibold text-[#17363d]">Follow-up Reminders</h3>
              <p className="mt-2 text-sm text-[#5f7a86]">
                Patients needing next consultation / report check
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[#274854]">
                <li>Riya Nair - blood report review due today.</li>
                <li>Arjun P - follow-up consultation pending.</li>
                <li>Sneha M - imaging upload check required.</li>
              </ul>
              {/* TODO(BACKEND): fetch follow-ups */}
            </div>
          </motion.section>
        </main>
      </div>
    </section>
  );
}

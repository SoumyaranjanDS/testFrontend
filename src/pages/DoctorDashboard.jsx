import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  LayoutDashboard,
  ClipboardList,
  MessageSquareText,
  UserCheck,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  CheckCircle2,
  Clock,
  Siren,
  FileText,
  Sparkles,
  Send,
  Copy,
  ShieldAlert,
  User,
  Home,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
// Ensure this path matches your project structure
import { reportApi } from "../api/reportApi"; 

const easeSmooth = [0.22, 1, 0.36, 1];

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now());

/**
 * TODO(BACKEND):
 * Move mock methods to real APIs.
 */
const doctorApi = {
  async getDashboard() {
    return {
      queue: [
        {
          id: "C-101",
          patientName: "Ramesh Kumar",
          patientEmail: "ramesh@example.com",
          complaint: "Chest tightness + breathlessness",
          risk: "high",
          waitMins: 14,
          status: "queued",
          assignedDoctor: null,
          summary:
            "Male, 52. Acute chest discomfort with dyspnea. Hypertension history. Needs immediate cardiopulmonary review.",
          lastUpdate: "2m ago",
          reportStatus: "not_generated",
        },
        {
          id: "C-102",
          patientName: "Sunita Devi",
          patientEmail: "sunita@example.com",
          complaint: "Lower abdominal pain (sensitive concern)",
          risk: "medium",
          waitMins: 28,
          status: "queued",
          assignedDoctor: null,
          summary:
            "Female, 31. Hesitation in verbal explanation. Guided intake completed; symptom details captured with better confidence.",
          lastUpdate: "4m ago",
          reportStatus: "not_generated",
        },
        {
          id: "C-103",
          patientName: "Ali Mohammed",
          patientEmail: "ali@example.com",
          complaint: "High fever + body ache",
          risk: "low",
          waitMins: 40,
          status: "queued",
          assignedDoctor: null,
          summary:
            "Male, 24. No major comorbidity reported. Requires symptomatic evaluation and routine follow-up.",
          lastUpdate: "8m ago",
          reportStatus: "not_generated",
        },
      ],
      notifications: [
        { id: "N1", text: "2 high-risk cases need urgent review.", unread: true },
        { id: "N2", text: "New patient report added to C-101.", unread: true },
      ],
    };
  },

  async assignCase({ caseId, doctorName }) {
    return { ok: true, caseId, doctorName };
  },

  async updateCaseStatus({ caseId, status }) {
    return { ok: true, caseId, status };
  },

  async generateStructuredReport({ caseItem, doctorNotes, chatMessages }) {
    const trace = chatMessages.map((m) => `${m.role}: ${m.content}`).join("\n");

    return {
      report: `# Structured Clinical Report\n\n## Patient Details\n- Name: ${caseItem.patientName}\n- Case ID: ${caseItem.id}\n- Primary Complaint: ${caseItem.complaint}\n- Risk Tier: ${caseItem.risk.toUpperCase()}\n\n## AI Triage Summary\n${caseItem.summary}\n\n## Doctor Technical Notes\n${doctorNotes || "No additional notes provided."}\n\n## Preliminary Assessment\n- Clinical priority: ${
        caseItem.risk === "high"
          ? "Immediate"
          : caseItem.risk === "medium"
          ? "Priority"
          : "Routine"
      }\n- Recommended pathway: ${
        caseItem.risk === "high"
          ? "Emergency specialist review"
          : "Targeted specialist consult"
      }\n\n## Suggested Next Steps\n1. Validate vitals and red flags\n2. Review uploaded reports/labs\n3. Confirm diagnosis path\n4. Provide patient-facing summary and follow-up schedule\n\n## AI Working Trace (internal)\n${trace || "No conversation trace"}`,
    };
  },
};

function riskClass(risk) {
  if (risk === "high") return "bg-rose-100 text-rose-700 border-rose-200";
  if (risk === "medium") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

export default function DoctorDashboard({ session, onLogout }) {
  const navigate = useNavigate();
  const doctorName = session?.name || "Doctor";
  const doctorEmail = session?.email || "doctor@vedaai.com";

  const [activeTab, setActiveTab] = useState("Overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [queueCases, setQueueCases] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  const [selectedCase, setSelectedCase] = useState(null);

  const [reportCase, setReportCase] = useState(null);
  const [reportChat, setReportChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [generatedReport, setGeneratedReport] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [toast, setToast] = useState("");

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const scrollRef = useRef(null);

  const { scrollYProgress } = useScroll({ container: scrollRef });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -120]);

  useEffect(() => {
    (async () => {
      const data = await doctorApi.getDashboard();
      setQueueCases(data.queue);
      setNotifications(data.notifications);
    })();
  }, []);

  useEffect(() => {
    const onOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredQueue = useMemo(() => {
    return queueCases.filter((item) => {
      const q = query.trim().toLowerCase();
      const byQuery =
        !q ||
        item.patientName.toLowerCase().includes(q) ||
        item.complaint.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      const byRisk = riskFilter === "all" ? true : item.risk === riskFilter;
      return byQuery && byRisk;
    });
  }, [queueCases, query, riskFilter]);

  const myCases = useMemo(
    () => queueCases.filter((item) => item.assignedDoctor === doctorName),
    [queueCases, doctorName]
  );

  const stats = useMemo(() => {
    const highRisk = queueCases.filter((c) => c.risk === "high").length;
    const assigned = myCases.length;
    const completed = queueCases.filter((c) => c.status === "completed").length;
    return {
      queued: queueCases.length,
      highRisk,
      assigned,
      completed,
    };
  }, [queueCases, myCases]);

  const assignToMe = async (caseId) => {
    await doctorApi.assignCase({ caseId, doctorName });
    setQueueCases((prev) =>
      prev.map((item) =>
        item.id === caseId
          ? {
              ...item,
              assignedDoctor: doctorName,
              status: item.status === "queued" ? "in_review" : item.status,
              lastUpdate: "just now",
            }
          : item
      )
    );
    setToast("Case assigned to you");
  };

  const unassignCase = async (caseId) => {
    setQueueCases((prev) =>
      prev.map((item) =>
        item.id === caseId && item.assignedDoctor === doctorName
          ? {
              ...item,
              assignedDoctor: null,
              status: "queued",
              lastUpdate: "just now",
            }
          : item
      )
    );
    setToast("Case unassigned");
  };

  const markReviewed = async (caseId) => {
    await doctorApi.updateCaseStatus({ caseId, status: "completed" });
    setQueueCases((prev) =>
      prev.map((item) =>
        item.id === caseId
          ? { ...item, status: "completed", lastUpdate: "just now" }
          : item
      )
    );
    setToast("Case marked as reviewed");
  };

  const escalateCase = async (caseId) => {
    await doctorApi.updateCaseStatus({ caseId, status: "escalated" });
    setQueueCases((prev) =>
      prev.map((item) =>
        item.id === caseId
          ? { ...item, status: "escalated", lastUpdate: "just now" }
          : item
      )
    );
    setToast("Case escalated");
  };

  const openReportBuilder = (caseItem) => {
    setReportCase(caseItem);
    setGeneratedReport("");
    setDoctorNotes("");
    setChatInput("");
    setReportChat([
      {
        id: makeId(),
        role: "assistant",
        content:
          "Write your technical clinical notes. I will convert them to a structured patient-safe report.",
      },
    ]);
  };

  const sendChatMessage = () => {
    const msg = chatInput.trim();
    if (!msg) return;

    setReportChat((prev) => [
      ...prev,
      {
        id: makeId(),
        role: "doctor",
        content: msg,
      },
    ]);
    setChatInput("");
  };

  const generateReport = async () => {
    if (!reportCase) return;
    setIsGeneratingReport(true);

    const ai = await doctorApi.generateStructuredReport({
      caseItem: reportCase,
      doctorNotes,
      chatMessages: reportChat,
    });

    setGeneratedReport(ai.report);
    setReportChat((prev) => [
      ...prev,
      {
        id: makeId(),
        role: "assistant",
        content: "Structured report generated. Please review before sending.",
      },
    ]);

    setQueueCases((prev) =>
      prev.map((item) =>
        item.id === reportCase.id
          ? { ...item, reportStatus: "generated", lastUpdate: "just now" }
          : item
      )
    );

    setIsGeneratingReport(false);
  };

  const sendReportToPatient = async () => {
    if (!reportCase) return;
    if (!generatedReport.trim()) {
      setToast("Generate report first");
      return;
    }
    if (!reportCase.patientEmail) {
      setToast("Patient email missing for this case");
      return;
    }

    const res = await reportApi.sendReportToPatient({
      caseId: reportCase.id,
      patientEmail: reportCase.patientEmail,
      patientName: reportCase.patientName,
      doctorName,
      report: generatedReport,
    });

    if (res?.ok) {
      setQueueCases((prev) =>
        prev.map((item) =>
          item.id === reportCase.id
            ? { ...item, reportStatus: "sent", lastUpdate: "just now" }
            : item
        )
      );
      setToast("Report sent to patient");
    } else {
      setToast("Failed to send report");
    }
  };

  const copyReport = async () => {
    if (!generatedReport) return;
    await navigator.clipboard.writeText(generatedReport);
    setToast("Report copied");
  };

  const menuItems = [
    { id: "Home", label: "Home", icon: Home },
    { id: "Overview", label: "Clinical Feed", icon: LayoutDashboard },
    { id: "Queue", label: "Triage Queue", icon: ClipboardList },
    { id: "Cases", label: "Case Summaries", icon: MessageSquareText },
    { id: "My Cases", label: "My Cases", icon: UserCheck },
  ];

  const handleMenuClick = (id) => {
    if (id === "Home") {
      navigate("/");
      return;
    }
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[1002] flex overflow-hidden bg-[linear-gradient(155deg,#eef6ff_0%,#f7fbff_42%,#edf8f6_100%)] text-slate-900">
      {/* Background Orbs */}
      <motion.div
        style={{ y: orbY }}
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#2f78d9]/18 blur-[110px]"
      />
      <motion.div
        style={{ y: orbY2 }}
        className="pointer-events-none absolute right-[-80px] top-[-30px] h-80 w-80 rounded-full bg-[#68b2a0]/16 blur-[120px]"
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#2f78d9_1px,transparent_1px)] [background-size:26px_26px]" />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[1004] w-[84vw] max-w-xs border-r border-white/60 bg-white/50 p-5 backdrop-blur-2xl transition-transform lg:relative lg:w-72 lg:max-w-none lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2f78d9,#68b2a0)] text-white font-bold shadow-[0_12px_28px_-16px_rgba(47,120,217,0.55)]">
            V
          </div>
          <div className="min-w-0">
            <p className="font-semibold tracking-tight truncate">VedaAI</p>
            <p className="text-xs text-slate-500 truncate">Doctor Console</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04, ease: easeSmooth }}
              onClick={() => handleMenuClick(item.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                activeTab === item.id
                  ? "bg-slate-900 text-white shadow-[0_15px_28px_-18px_rgba(15,23,42,0.8)]"
                  : "text-slate-600 hover:bg-white/70"
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </motion.button>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-[1003] bg-black/35 lg:hidden"
            aria-label="Close sidebar"
          />
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-x-hidden">
        {/* Header */}
        <header className="relative z-40 flex h-16 items-center justify-between border-b border-white/50 bg-white/45 px-4 backdrop-blur-2xl sm:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-600 hover:bg-white/70 lg:hidden"
            >
              <Menu size={18} />
            </button>

            <div className="hidden items-center gap-2 rounded-xl border border-white/70 bg-white/70 px-3 py-2 sm:flex w-full max-w-sm">
              <Search size={15} className="text-slate-400 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search case, patient, complaint..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className="relative rounded-xl p-2 text-slate-600 hover:bg-white/70"
              >
                <Bell size={18} />
                {notifications.some((n) => n.unread) && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 z-[1400] mt-2 w-[90vw] max-w-sm sm:w-80 rounded-2xl border border-white/70 bg-white/95 p-3 shadow-xl backdrop-blur-xl"
                  >
                    {notifications.map((n) => (
                      <div key={n.id} className="rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        {n.text}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu((v) => !v)}
                className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-2 py-1.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                  {(doctorName || "D").charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={14} className="text-slate-500" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 z-[1400] mt-2 w-[90vw] max-w-xs sm:w-56 rounded-2xl border border-white/70 bg-white/95 p-2 shadow-xl backdrop-blur-xl"
                  >
                    <div className="px-3 py-2 overflow-hidden">
                      <p className="text-sm font-semibold truncate">Dr. {doctorName}</p>
                      <p className="text-xs text-slate-500 truncate">{doctorEmail}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Mobile Search Bar */}
        <div className="border-b border-white/40 bg-white/35 px-4 py-3 sm:hidden shrink-0 z-30 relative">
          <div className="flex w-full items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-3 py-2">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search case, patient..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <section ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 w-full max-w-[100vw]">
          
          {/* TOAST NOTIFICATION */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed bottom-4 left-1/2 z-[2000] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg"
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === "Overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard title="Queued Cases" value={stats.queued} icon={Clock} index={0} />
                <MetricCard title="Critical Alerts" value={stats.highRisk} icon={Siren} danger index={1} />
                <MetricCard title="My Assigned" value={stats.assigned} icon={UserCheck} index={2} />
                <MetricCard title="Completed" value={stats.completed} icon={CheckCircle2} index={3} />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, ease: easeSmooth }}
                className="rounded-3xl border border-white/70 bg-white/75 p-4 backdrop-blur-xl"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  High-Risk Priority Feed
                </p>
                {queueCases.filter((c) => c.risk === "high").map((c) => (
                  <div key={c.id} className="mb-2 rounded-2xl border border-rose-200/80 bg-rose-50/70 p-3 sm:p-4">
                    <p className="font-medium text-rose-700">
                      {c.patientName} <span className="mx-1">•</span> {c.complaint}
                    </p>
                    <p className="mt-1 text-sm text-rose-600 line-clamp-2 sm:line-clamp-none">{c.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => assignToMe(c.id)}
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                      >
                        Assign to me
                      </button>
                      <button
                        onClick={() => escalateCase(c.id)}
                        className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        Escalate
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          )}

          {activeTab === "Queue" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {["all", "high", "medium", "low"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRiskFilter(r)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                      riskFilter === r
                        ? "bg-slate-900 text-white"
                        : "border border-white/70 bg-white/75 text-slate-600 hover:bg-white"
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl md:block w-full">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-slate-100 text-left text-xs uppercase tracking-[0.18em] text-slate-500 bg-white/50">
                    <tr>
                      <th className="px-4 py-4 font-medium">Case</th>
                      <th className="px-4 py-4 font-medium">Complaint</th>
                      <th className="px-4 py-4 font-medium">Risk</th>
                      <th className="px-4 py-4 font-medium">Wait</th>
                      <th className="px-4 py-4 font-medium">Assigned</th>
                      <th className="px-4 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQueue.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 last:border-b-0 hover:bg-white/40 transition-colors">
                        <td className="px-4 py-3 font-medium align-top">
                          {item.patientName}
                          <div className="text-xs text-slate-400 mt-0.5">{item.id}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-xs truncate align-top">{item.complaint}</td>
                        <td className="px-4 py-3 align-top">
                          <span className={`inline-flex items-center justify-center rounded-full border px-2 py-1 text-xs whitespace-nowrap ${riskClass(item.risk)}`}>
                            {item.risk}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap align-top">{item.waitMins}m</td>
                        <td className="px-4 py-3 text-slate-600 align-top">
                          {item.assignedDoctor || "Unassigned"}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => assignToMe(item.id)}
                              className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                            >
                              Assign
                            </button>
                            <button
                              onClick={() => setSelectedCase(item)}
                              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => escalateCase(item.id)}
                              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              Escalate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filteredQueue.length && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                          No cases found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="grid gap-3 md:hidden">
                {filteredQueue.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.45, delay: index * 0.03 }}
                    className="rounded-2xl border border-white/70 bg-white/85 p-4 backdrop-blur-xl shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-semibold truncate text-base">{item.patientName}</p>
                        <p className="text-xs text-slate-400">{item.id}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${riskClass(item.risk)}`}>
                        {item.risk}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{item.complaint}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>Wait: {item.waitMins}m</span>
                      <span>{item.assignedDoctor ? 'Assigned' : 'Unassigned'}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => assignToMe(item.id)} className="flex-1 min-w-[80px] rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                        Assign
                      </button>
                      <button onClick={() => setSelectedCase(item)} className="flex-1 min-w-[80px] rounded-lg border border-slate-200 py-2 text-xs font-semibold bg-white hover:bg-slate-50">
                        Open
                      </button>
                      <button onClick={() => escalateCase(item.id)} className="flex-1 min-w-[80px] rounded-lg border border-rose-200 bg-rose-50 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100">
                        Escalate
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Cases" && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {queueCases.map((item, index) => (
                <CaseCard
                  key={item.id}
                  item={item}
                  index={index}
                  isAssignedToCurrent={item.assignedDoctor === doctorName}
                  onOpen={() => setSelectedCase(item)}
                  onAssign={() => assignToMe(item.id)}
                  onUnassign={() => unassignCase(item.id)}
                  onGenerate={() => openReportBuilder(item)}
                  onReviewed={() => markReviewed(item.id)}
                  onEscalate={() => escalateCase(item.id)}
                />
              ))}
            </div>
          )}

          {activeTab === "My Cases" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 bg-white/50 inline-block px-3 py-1.5 rounded-lg border border-white/60">
                Cases assigned to <span className="font-semibold text-slate-900">Dr. {doctorName}</span>
              </p>

              {!myCases.length ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/40 p-8 text-center text-slate-500 backdrop-blur-xl">
                  No assigned cases yet. Use "Assign to me" in the Triage Queue.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {myCases.map((item, index) => (
                    <CaseCard
                      key={item.id}
                      item={item}
                      index={index}
                      isAssignedToCurrent
                      onOpen={() => setSelectedCase(item)}
                      onAssign={() => assignToMe(item.id)}
                      onUnassign={() => unassignCase(item.id)}
                      onGenerate={() => openReportBuilder(item)}
                      onReviewed={() => markReviewed(item.id)}
                      onEscalate={() => escalateCase(item.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {selectedCase && (
          <ModalShell title={`Case Detail • ${selectedCase.id}`} onClose={() => setSelectedCase(null)}>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedCase.patientName}</h3>
                <p className="text-sm text-slate-500">{selectedCase.patientEmail}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Primary Complaint</p>
                <p className="text-sm font-medium text-slate-800">{selectedCase.complaint}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 shadow-inner">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">AI Summary Assessment</p>
                <p className="text-sm leading-relaxed text-slate-700">
                  {selectedCase.summary}
                </p>
              </div>
              <div className="pt-4 flex flex-wrap gap-2 border-t border-slate-100">
                <button
                  onClick={() => { assignToMe(selectedCase.id); setSelectedCase(null); }}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Assign to me
                </button>
                <button
                  onClick={() => { openReportBuilder(selectedCase); setSelectedCase(null); }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Generate AI Report
                </button>
              </div>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reportCase && (
          <ModalShell title={`AI Report Assistant • ${reportCase.id}`} onClose={() => setReportCase(null)} wide>
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] h-full">
              
              {/* Left Column: Chat Area */}
              <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/50 p-2 sm:p-4 h-[50vh] lg:h-[70vh]">
                <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  AI Context Chat
                </p>

                {/* Chat Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-white p-3 sm:p-4 shadow-inner border border-slate-100">
                  {reportChat.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.role === 'doctor' 
                          ? 'bg-blue-600 text-white ml-auto rounded-tr-sm' 
                          : 'bg-slate-100 text-slate-700 mr-auto rounded-tl-sm'
                      }`}
                    >
                      {m.content}
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                    placeholder="Type clinical notes..."
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  />
                  <button 
                    onClick={sendChatMessage}
                    className="flex shrink-0 items-center justify-center rounded-xl bg-blue-600 p-2 text-white hover:bg-blue-700 transition-colors w-10 h-10"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>

              {/* Right Column: Report Viewer */}
              <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 h-[50vh] lg:h-[70vh]">
                 <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      Generated Report
                    </p>
                    {generatedReport && (
                      <button onClick={copyReport} className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Copy Report">
                        <Copy size={16} />
                      </button>
                    )}
                 </div>

                 <div className="flex-1 overflow-y-auto rounded-xl bg-slate-50 border border-slate-100 p-4">
                    {isGeneratingReport ? (
                      <div className="flex h-full flex-col items-center justify-center text-slate-400 space-y-3">
                        <Sparkles size={24} className="animate-pulse text-blue-500" />
                        <p className="text-sm font-medium animate-pulse">Synthesizing clinical data...</p>
                      </div>
                    ) : generatedReport ? (
                      <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-700">
                        {generatedReport}
                      </pre>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-slate-400 text-center px-4 space-y-2">
                        <FileText size={24} className="opacity-30" />
                        <p className="text-xs">Provide notes in the chat, then click generate below.</p>
                      </div>
                    )}
                 </div>

                 <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={generateReport}
                      disabled={isGeneratingReport}
                      className="flex-1 rounded-xl bg-slate-900 py-3 text-xs font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      {generatedReport ? "Regenerate" : "Generate Report"}
                    </button>
                    {generatedReport && (
                      <button
                        onClick={sendReportToPatient}
                        className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                      >
                        Send to Patient
                      </button>
                    )}
                 </div>
              </div>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <ModalShell title="Confirm Logout" onClose={() => setShowLogoutConfirm(false)}>
            <div className="py-4 text-center">
              <ShieldAlert size={40} className="mx-auto mb-4 text-rose-500" />
              <p className="text-base font-medium text-slate-800">Are you sure you want to end your session?</p>
              <p className="mt-2 text-sm text-slate-500 px-4">You will need to re-authenticate to access patient triage data.</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={onLogout} className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition-colors">
                Yes, Sign Out
              </button>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- MISSING CHILD COMPONENTS ADDED BELOW ---

function MetricCard({ title, value, icon: Icon, danger, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="flex flex-col justify-between rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl sm:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl ${danger ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
          <Icon size={20} className="sm:w-6 sm:h-6" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">{title}</p>
      </div>
    </motion.div>
  );
}

function CaseCard({ item, index, isAssignedToCurrent, onOpen, onAssign, onUnassign, onGenerate, onReviewed, onEscalate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-sm backdrop-blur-xl transition-all hover:shadow-md"
    >
      <div className="border-b border-slate-100 p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="font-semibold text-slate-900 truncate">{item.patientName}</h4>
            <p className="text-xs text-slate-500">{item.id}</p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${riskClass(item.risk)}`}>
            {item.risk}
          </span>
        </div>
        <p className="text-sm text-slate-700 line-clamp-2">{item.complaint}</p>
      </div>
      
      <div className="bg-slate-50/50 p-4 sm:p-5 flex-1 flex flex-col justify-end">
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1"><Clock size={12}/> {item.waitMins}m wait</span>
          <span className="font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200">{item.status.replace('_', ' ')}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {isAssignedToCurrent ? (
            <>
              <button onClick={onGenerate} className="col-span-2 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
                AI Assistant
              </button>
              <button onClick={onOpen} className="rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                Details
              </button>
              <button onClick={onReviewed} className="rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                Done
              </button>
            </>
          ) : (
            <>
              <button onClick={onAssign} className="col-span-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors">
                Assign to me
              </button>
              <button onClick={onOpen} className="rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                Preview
              </button>
              <button onClick={onEscalate} className="rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100">
                Escalate
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ModalShell({ title, onClose, wide, children }) {
  return (
    <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm sm:backdrop-blur-md">
       <motion.div
         initial={{ opacity: 0, y: "100%", scale: 0.95 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         exit={{ opacity: 0, y: "100%", scale: 0.95 }}
         transition={{ type: "spring", bounce: 0, duration: 0.4 }}
         className={`bg-white/95 backdrop-blur-2xl shadow-2xl rounded-t-3xl sm:rounded-3xl border border-white/70 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] w-full ${wide ? 'max-w-4xl' : 'max-w-md'}`}
       >
         <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-100 bg-white/50 shrink-0">
            <h2 className="font-semibold text-slate-800 text-sm sm:text-base">{title}</h2>
            <button onClick={onClose} className="p-2 text-slate-400 bg-slate-50 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <X size={18}/>
            </button>
         </div>
         <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
            {children}
         </div>
       </motion.div>
    </div>
  )
}
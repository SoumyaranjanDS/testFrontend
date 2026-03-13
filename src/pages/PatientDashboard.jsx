import { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  X,
  Search,
  Bell,
  LogOut,
  Activity,
  HeartPulse,
  FileText,
  CalendarDays,
  BookOpen,
  LineChart,
  Download,
  Eye,
  RefreshCw,
  ChevronDown,
  Home,
  Plus,
  CheckCircle2,
  Clock3,
  Droplets,
  Footprints,
  Moon,
  Video,
  Trash2,
  ArrowUpRight,
  Upload,
  Sparkles,
  Stethoscope,
  ShieldAlert,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import { reportApi } from "../api/reportApi";

const easeSmooth = [0.22, 1, 0.36, 1];
const DOC_HISTORY_KEY = "veda_document_checker_history";

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now());

const canUseStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readLocal = (key, fallback = []) => {
  if (!canUseStorage()) return fallback;
  try {
    const val = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    return Array.isArray(val) ? val : fallback;
  } catch {
    return fallback;
  }
};

const writeLocal = (key, value) => {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
};

const mockNotifications = [
  { id: "n1", text: "Your latest doctor report is available." },
  { id: "n2", text: "Follow-up consultation tomorrow at 10:30 AM." },
  { id: "n3", text: "Daily health tracker reminder is active." },
];

const mockAppointments = [
  {
    id: "a1",
    doctor: "Dr. Mehta",
    department: "General Medicine",
    date: "Tomorrow",
    time: "10:30 AM",
    mode: "video",
    status: "confirmed",
  },
  {
    id: "a2",
    doctor: "Dr. Ananya",
    department: "Gynecology",
    date: "Mar 19",
    time: "05:00 PM",
    mode: "in-person",
    status: "pending",
  },
];

const mockResources = [
  {
    id: "r1",
    title: "Managing stress-related symptoms",
    type: "Article",
    duration: "6 min read",
    category: "Mental Wellness",
    url: "#",
  },
  {
    id: "r2",
    title: "Understanding blood pressure trends",
    type: "Guide",
    duration: "9 min read",
    category: "Cardio Care",
    url: "#",
  },
  {
    id: "r3",
    title: "Nutrition basics for recovery",
    type: "Video",
    duration: "12 min",
    category: "Diet & Recovery",
    url: "#",
  },
];

function analyzeDocumentMock({ fileName, extractedText }) {
  const corpus = `${fileName} ${extractedText}`.toLowerCase();

  const conditionRules = [
    {
      key: "diabetes",
      keywords: ["glucose", "hba1c", "sugar", "insulin", "diabetic"],
      doctor: "Endocrinologist",
      simple: "Sugar-related values look important. Diabetes review is recommended.",
    },
    {
      key: "thyroid",
      keywords: ["thyroid", "tsh", "t3", "t4"],
      doctor: "Endocrinologist",
      simple: "Thyroid markers may need a specialist check.",
    },
    {
      key: "cardio",
      keywords: ["cholesterol", "ldl", "hdl", "triglyceride", "bp", "hypertension", "ecg"],
      doctor: "Cardiologist",
      simple: "Heart-risk markers appear in the report and should be reviewed.",
    },
    {
      key: "kidney",
      keywords: ["creatinine", "urea", "egfr", "kidney", "renal"],
      doctor: "Nephrologist",
      simple: "Kidney-related values are present and need proper interpretation.",
    },
    {
      key: "liver",
      keywords: ["sgpt", "sgot", "bilirubin", "liver", "alt", "ast"],
      doctor: "Gastroenterologist",
      simple: "Liver function markers are noted and may need specialist advice.",
    },
    {
      key: "infection",
      keywords: ["wbc", "crp", "infection", "fever", "esr"],
      doctor: "General Physician",
      simple: "Inflammation/infection indicators may be present.",
    },
  ];

  const matched = conditionRules.filter((r) =>
    r.keywords.some((kw) => corpus.includes(kw))
  );

  const confidence = Math.min(
    95,
    Math.max(55, 55 + matched.length * 10 + Math.min(extractedText.length / 80, 15))
  );

  const findings =
    matched.length > 0
      ? matched.map((m) => m.simple)
      : [
          "Document uploaded successfully.",
          "No strong condition keywords were detected in local analysis.",
          "A doctor should still review the original report for accurate diagnosis.",
        ];

  const recommendedDoctors =
    matched.length > 0
      ? [...new Set(matched.map((m) => m.doctor))]
      : ["General Physician"];

  const severity =
    matched.some((m) => m.key === "cardio" || m.key === "kidney")
      ? "moderate"
      : matched.length >= 3
      ? "moderate"
      : "low";

  const nextSteps = [
    "Share this report with a doctor for final clinical interpretation.",
    "Do not self-medicate based only on AI summary.",
    "If you have chest pain, breathing issues, severe weakness, or bleeding, seek urgent care.",
  ];

  return {
    id: makeId(),
    fileName,
    analyzedAt: new Date().toISOString(),
    confidence: Math.round(confidence),
    severity,
    summary:
      matched.length > 0
        ? `We found ${matched.length} important health pattern(s). This is a simplified explanation, not a diagnosis.`
        : "Your file was analyzed. We could not detect strong condition patterns from local text parsing.",
    findings,
    recommendedDoctors,
    nextSteps,
    extractedPreview: extractedText.slice(0, 320),
  };
}

export default function PatientDashboard({ session, onLogout }) {
  const navigate = useNavigate();
  const patientName = session?.name || "Patient";
  const patientEmail = session?.email || "";

  const [activeTab, setActiveTab] = useState("Overview");
  const [menuOpen, setMenuOpen] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [query, setQuery] = useState("");
  const [reportQuery, setReportQuery] = useState("");

  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingReports, setLoadingReports] = useState(false);

  const [appointments, setAppointments] = useState(mockAppointments);

  const [symptomForm, setSymptomForm] = useState({
    symptom: "",
    duration: "1-2 days",
    severity: 5,
    isPrivate: true,
    notes: "",
  });
  const [symptomEntries, setSymptomEntries] = useState([]);
  const [triageMessage, setTriageMessage] = useState("");

  const [resourceCategory, setResourceCategory] = useState("All");
  const [resourceQuery, setResourceQuery] = useState("");

  const [tracker, setTracker] = useState({
    water: 6,
    steps: 4200,
    sleep: 6.7,
    mood: "Balanced",
  });
  const [trackerLogs, setTrackerLogs] = useState([
    { id: "t1", date: "Today", water: 6, steps: 4200, sleep: 6.7, mood: "Balanced" },
    { id: "t2", date: "Yesterday", water: 7, steps: 5100, sleep: 7.1, mood: "Good" },
  ]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [docAnalyzing, setDocAnalyzing] = useState(false);
  const [docError, setDocError] = useState("");
  const [docResult, setDocResult] = useState(null);
  const [docHistory, setDocHistory] = useState(() => readLocal(DOC_HISTORY_KEY, []));

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const scrollRef = useRef(null);

  const { scrollYProgress } = useScroll({ container: scrollRef });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -120]);

  const menuItems = [
    { id: "Home", label: "Home", icon: Home },
    { id: "Overview", label: "Overview", icon: Activity },
    { id: "Symptom Checker", label: "Symptom Checker", icon: HeartPulse },
    { id: "Document Checker", label: "Document Checker", icon: FileText },
    { id: "Health Reports", label: "Health Reports", icon: FileText },
    { id: "Appointments", label: "Appointments", icon: CalendarDays },
    { id: "Learning Resources", label: "Learning Resources", icon: BookOpen },
    { id: "Health Tracker", label: "Health Tracker", icon: LineChart },
  ];

  const unreadCount = useMemo(
    () => reports.filter((r) => !r.isRead).length,
    [reports]
  );

  const reportFiltered = useMemo(() => {
    const q = (reportQuery || query).trim().toLowerCase();
    if (!q) return reports;
    return reports.filter(
      (r) =>
        (r.caseId || "").toLowerCase().includes(q) ||
        (r.doctorName || "").toLowerCase().includes(q) ||
        (r.patientName || "").toLowerCase().includes(q)
    );
  }, [reports, reportQuery, query]);

  const resourceFiltered = useMemo(() => {
    const q = (resourceQuery || query).trim().toLowerCase();
    return mockResources.filter((r) => {
      const catMatch = resourceCategory === "All" || r.category === resourceCategory;
      const qMatch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
  }, [resourceCategory, resourceQuery, query]);

  const healthScore = useMemo(() => {
    const waterScore = Math.min((tracker.water / 8) * 25, 25);
    const stepScore = Math.min((tracker.steps / 7000) * 35, 35);
    const sleepScore = Math.min((tracker.sleep / 8) * 30, 30);
    const moodScore = tracker.mood === "Good" ? 10 : tracker.mood === "Balanced" ? 7 : 4;
    return Math.round(waterScore + stepScore + sleepScore + moodScore);
  }, [tracker]);

  useEffect(() => {
    loadReports();
  }, [patientEmail]);

  useEffect(() => {
    writeLocal(DOC_HISTORY_KEY, docHistory);
  }, [docHistory]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const loadReports = async () => {
    if (!patientEmail) return;
    setLoadingReports(true);
    // TODO(BACKEND): secure API call with auth session/token
    const res = await reportApi.getPatientReports({ patientEmail });
    setReports(res?.ok ? res.data || [] : []);
    setLoadingReports(false);
  };

  const openReport = async (report) => {
    setSelectedReport(report);
    if (!report.isRead) {
      // TODO(BACKEND): PATCH report read status
      await reportApi.markReportRead({ reportId: report.id });
      await loadReports();
    }
  };

  const downloadTxt = (report) => {
    const blob = new Blob([report.report || ""], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veda-report-${report.caseId || "report"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleMenuClick = (id) => {
    if (id === "Home") {
      navigate("/");
      return;
    }
    setActiveTab(id);
    setMenuOpen(false);
  };

  const submitSymptom = () => {
    if (!symptomForm.symptom.trim()) return;

    const entry = {
      id: makeId(),
      symptom: symptomForm.symptom.trim(),
      duration: symptomForm.duration,
      severity: symptomForm.severity,
      isPrivate: symptomForm.isPrivate,
      notes: symptomForm.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setSymptomEntries((prev) => [entry, ...prev]);

    const riskText =
      symptomForm.severity >= 8
        ? "High priority. Please connect with doctor immediately."
        : symptomForm.severity >= 5
        ? "Moderate priority. Doctor review recommended within 24 hours."
        : "Low priority. Track symptoms and consult if they persist.";
    setTriageMessage(riskText);

    // TODO(BACKEND): POST /api/patient/symptom-entry for doctor queue + AI triage
    setSymptomForm({
      symptom: "",
      duration: "1-2 days",
      severity: 5,
      isPrivate: true,
      notes: "",
    });
  };

  const removeSymptom = (id) => {
    // TODO(BACKEND): DELETE /api/patient/symptom-entry/:id
    setSymptomEntries((prev) => prev.filter((s) => s.id !== id));
  };

  const updateAppointmentStatus = (id, status) => {
    // TODO(BACKEND): PATCH /api/patient/appointments/:id
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const saveTracker = () => {
    const today = new Date().toLocaleDateString();
    const row = { id: makeId(), date: today, ...tracker };
    setTrackerLogs((prev) => [row, ...prev.slice(0, 6)]);
    // TODO(BACKEND): POST /api/patient/tracker-log
  };

  const analyzeDocument = async () => {
    setDocError("");
    setDocResult(null);

    if (!selectedFile) {
      setDocError("Please upload a file first.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setDocError("File is too large. Please upload a file under 10MB.");
      return;
    }

    setDocAnalyzing(true);

    try {
      let extractedText = "";

      const name = selectedFile.name.toLowerCase();
      const isTextLike =
        selectedFile.type.startsWith("text/") ||
        name.endsWith(".txt") ||
        name.endsWith(".csv") ||
        name.endsWith(".md");

      if (isTextLike && selectedFile.text) {
        extractedText = await selectedFile.text();
      }

      // TODO(BACKEND): send FormData(file) to AI document pipeline:
      // POST /api/ai/document-checker
      // Backend should do OCR/PDF parsing + clinical LLM summarization + doctor recommendation.
      const result = analyzeDocumentMock({
        fileName: selectedFile.name,
        extractedText,
      });

      setDocResult(result);
      setDocHistory((prev) => [result, ...prev].slice(0, 20));
    } catch {
      setDocError("Failed to analyze this file. Please try another document.");
    } finally {
      setDocAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1002] flex overflow-hidden bg-[linear-gradient(155deg,#eef6ff_0%,#f7fbff_42%,#edf8f6_100%)] text-slate-900">
      <motion.div
        style={{ y: orbY }}
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#2f78d9]/18 blur-[110px]"
      />
      <motion.div
        style={{ y: orbY2 }}
        className="pointer-events-none absolute right-[-80px] top-[-30px] h-80 w-80 rounded-full bg-[#68b2a0]/16 blur-[120px]"
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#2f78d9_1px,transparent_1px)] [background-size:26px_26px]" />

      <aside
        className={`fixed inset-y-0 left-0 z-[1004] w-[84vw] max-w-xs border-r border-white/60 bg-white/50 p-5 backdrop-blur-2xl transition-transform lg:relative lg:w-72 lg:max-w-none lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2f78d9,#68b2a0)] text-white font-bold shadow-[0_12px_28px_-16px_rgba(47,120,217,0.55)]">
            V
          </div>
          <div>
            <p className="font-semibold tracking-tight">VedaAI</p>
            <p className="text-xs text-slate-500">Patient Portal</p>
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

      <AnimatePresence>
        {menuOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-[1003] bg-black/35 lg:hidden"
            aria-label="Close sidebar"
          />
        )}
      </AnimatePresence>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="relative z-40 flex h-16 items-center justify-between border-b border-white/50 bg-white/45 px-4 backdrop-blur-2xl sm:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-xl p-2 text-slate-600 hover:bg-white/70 lg:hidden"
            >
              <Menu size={18} />
            </button>

            <div className="hidden items-center gap-2 rounded-xl border border-white/70 bg-white/70 px-3 py-2 sm:flex">
              <Search size={15} className="text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dashboard..."
                className="w-[18rem] bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className="relative rounded-xl p-2 text-slate-600 hover:bg-white/70"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 z-1400 mt-2 w-80 rounded-2xl border border-white/70 bg-white/95 p-3 shadow-xl backdrop-blur-xl"
                  >
                    {mockNotifications.map((n) => (
                      <div key={n.id} className="rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        {n.text}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu((v) => !v)}
                className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-2 py-1.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                  {(patientName || "P").charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={14} className="text-slate-500" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 z-1400 mt-2 w-56 rounded-2xl border border-white/70 bg-white/95 p-2 shadow-xl backdrop-blur-xl"
                  >
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold">{patientName}</p>
                      <p className="text-xs text-slate-500">{patientEmail || "patient@vedaai.com"}</p>
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

        <div className="border-b border-white/40 bg-white/35 px-4 py-3 sm:hidden">
          <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-3 py-2">
            <Search size={15} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dashboard..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <section ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === "Overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard title="Health Score" value={`${healthScore}/100`} subtitle="Personalized trend" index={0} />
                <MetricCard title="AI Health Check" value="2 alerts" subtitle="1 needs follow-up" index={1} />
                <MetricCard title="Reports" value={String(reports.length)} subtitle={`${unreadCount} unread`} index={2} />
                <MetricCard title="Next Visit" value="Tomorrow" subtitle="10:30 AM" index={3} />
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                <OverviewCard
                  title="Appointments"
                  lines={[
                    `${appointments[0]?.doctor || "Dr."} • ${appointments[0]?.department || "General"}`,
                    `${appointments[0]?.date || "Soon"}, ${appointments[0]?.time || ""}`,
                  ]}
                  action="Open Appointments"
                  onAction={() => setActiveTab("Appointments")}
                />
                <OverviewCard
                  title="Medication Reminders"
                  lines={["08:00 AM • BP tablet", "02:00 PM • Vitamin D", "09:00 PM • Sleep dose"]}
                />
                <OverviewCard
                  title="Recent Reports"
                  lines={[reports[0] ? `Latest: Case ${reports[0].caseId}` : "No report yet"]}
                  action="Open reports"
                  onAction={() => setActiveTab("Health Reports")}
                />
              </div>
            </div>
          )}

          {activeTab === "Symptom Checker" && (
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <SectionCard title="Log Symptoms">
                <div className="mt-3 space-y-3">
                  <input
                    value={symptomForm.symptom}
                    onChange={(e) => setSymptomForm((p) => ({ ...p, symptom: e.target.value }))}
                    placeholder="Enter primary symptom"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={symptomForm.duration}
                      onChange={(e) => setSymptomForm((p) => ({ ...p, duration: e.target.value }))}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                    >
                      <option>Less than 24h</option>
                      <option>1-2 days</option>
                      <option>3-7 days</option>
                      <option>1+ weeks</option>
                    </select>

                    <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                      Severity <span className="font-semibold">{symptomForm.severity}/10</span>
                    </label>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={symptomForm.severity}
                    onChange={(e) => setSymptomForm((p) => ({ ...p, severity: Number(e.target.value) }))}
                    className="w-full"
                  />

                  <textarea
                    value={symptomForm.notes}
                    onChange={(e) => setSymptomForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Additional context (optional)"
                    className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  />

                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={symptomForm.isPrivate}
                      onChange={(e) => setSymptomForm((p) => ({ ...p, isPrivate: e.target.checked }))}
                    />
                    Mark as sensitive/private
                  </label>

                  <button
                    onClick={submitSymptom}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    <Plus size={14} />
                    Submit for AI triage
                  </button>
                </div>

                {triageMessage ? (
                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                    {triageMessage}
                  </div>
                ) : null}
              </SectionCard>

              <SectionCard title="Recent Submissions">
                <div className="mt-3 space-y-2">
                  {!symptomEntries.length ? (
                    <p className="text-sm text-slate-500">No symptom submissions yet.</p>
                  ) : (
                    symptomEntries.map((s) => (
                      <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{s.symptom}</p>
                            <p className="text-xs text-slate-500">
                              {s.duration} • Severity {s.severity}/10 {s.isPrivate ? "• Private" : ""}
                            </p>
                          </div>
                          <button
                            onClick={() => removeSymptom(s.id)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {s.notes ? <p className="mt-2 text-sm text-slate-600">{s.notes}</p> : null}
                      </div>
                    ))
                  )}
                </div>
              </SectionCard>
            </div>
          )}

          {activeTab === "Document Checker" && (
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <SectionCard title="AI Document Checker">
                <p className="text-sm text-slate-600">
                  Upload your medical document. AI will generate a simple-language summary and suggest the right doctor type.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  TODO(BACKEND): send file to OCR + LLM pipeline for real clinical parsing.
                </p>

                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                    <Upload size={14} />
                    Upload Document
                    <input
                      type="file"
                      accept=".txt,.csv,.md,.pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </label>

                  {selectedFile ? (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                      Selected: <span className="font-semibold">{selectedFile.name}</span>
                    </div>
                  ) : null}

                  {docError ? (
                    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {docError}
                    </div>
                  ) : null}

                  <button
                    onClick={analyzeDocument}
                    disabled={docAnalyzing}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    <Sparkles size={14} />
                    {docAnalyzing ? "Analyzing..." : "Analyze with AI"}
                  </button>
                </div>

                {docHistory.length ? (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Recent Analyses</p>
                    <div className="mt-2 space-y-2">
                      {docHistory.slice(0, 4).map((h) => (
                        <button
                          key={h.id}
                          onClick={() => setDocResult(h)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <p className="font-semibold">{h.fileName}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(h.analyzedAt).toLocaleString()} • Confidence {h.confidence}%
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </SectionCard>

              <SectionCard title="Analysis Output">
                {!docResult ? (
                  <p className="text-sm text-slate-500">
                    Upload and analyze a document to see AI output.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-sm font-semibold text-slate-900">{docResult.fileName}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(docResult.analyzedAt).toLocaleString()} • Confidence {docResult.confidence}%
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Simple Summary</p>
                      <p className="mt-1 text-sm text-slate-700">{docResult.summary}</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Key Findings</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {docResult.findings.map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="mt-0.5 text-emerald-600" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Recommended Doctor</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {docResult.recommendedDoctors.map((d) => (
                          <span
                            key={d}
                            className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
                          >
                            <Stethoscope size={12} />
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Next Steps</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {docResult.nextSteps.map((s) => (
                          <li key={s} className="flex items-start gap-2">
                            <ArrowUpRight size={13} className="mt-0.5 text-slate-500" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {docResult.severity === "moderate" ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        <ShieldAlert size={14} className="mr-1 inline" />
                        Moderate concern detected. Please consult a doctor soon.
                      </div>
                    ) : null}

                    <button
                      onClick={() => setActiveTab("Appointments")}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Book Recommended Doctor
                    </button>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {activeTab === "Health Reports" && (
            <div className="space-y-4">
              <SectionCard title="Doctor Reports">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-slate-700">Documents sent by your doctor.</p>
                  <div className="flex gap-2">
                    <input
                      value={reportQuery}
                      onChange={(e) => setReportQuery(e.target.value)}
                      placeholder="Filter reports..."
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                    />
                    <button
                      onClick={loadReports}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      <RefreshCw size={13} />
                      Refresh
                    </button>
                  </div>
                </div>
              </SectionCard>

              {loadingReports ? (
                <SectionCard title="Status">
                  <p className="text-sm text-slate-500">Loading reports...</p>
                </SectionCard>
              ) : !reportFiltered.length ? (
                <SectionCard title="Status">
                  <p className="text-sm text-slate-500">
                    No reports yet. Your doctor-generated reports will appear here.
                  </p>
                </SectionCard>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {reportFiltered.map((r, index) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.45, delay: index * 0.03 }}
                      className="rounded-2xl border border-white/70 bg-white/85 p-4 backdrop-blur-xl"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">Case {r.caseId}</p>
                          <p className="text-xs text-slate-500">By Dr. {r.doctorName || "Doctor"}</p>
                        </div>
                        {!r.isRead ? (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700">
                            New
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                            Read
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400">
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-3 text-sm text-slate-600 line-clamp-3">{r.report}</p>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => openReport(r)}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                        >
                          <Eye size={13} />
                          Open
                        </button>
                        <button
                          onClick={() => downloadTxt(r)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                        >
                          <Download size={13} />
                          Download
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "Appointments" && (
            <div className="grid gap-3 md:grid-cols-2">
              {appointments.map((a, index) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.03 }}
                  className="rounded-2xl border border-white/70 bg-white/85 p-4 backdrop-blur-xl"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {a.doctor} • {a.department}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {a.date}, {a.time} • {a.mode === "video" ? "Video Consult" : "In-person"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Status: <span className="font-semibold">{a.status}</span>
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.mode === "video" ? (
                      <button
                        onClick={() => updateAppointmentStatus(a.id, "joined")}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                      >
                        <Video size={13} />
                        Join
                      </button>
                    ) : null}
                    <button
                      onClick={() => updateAppointmentStatus(a.id, "confirmed")}
                      className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
                    >
                      <CheckCircle2 size={13} />
                      Confirm
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(a.id, "rescheduled")}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      <Clock3 size={13} />
                      Reschedule
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "Learning Resources" && (
            <div className="space-y-4">
              <SectionCard title="Learning Library">
                <div className="flex flex-wrap gap-2">
                  {["All", "Mental Wellness", "Cardio Care", "Diet & Recovery"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setResourceCategory(c)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        resourceCategory === c
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  value={resourceQuery}
                  onChange={(e) => setResourceQuery(e.target.value)}
                  placeholder="Search resources..."
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                />
              </SectionCard>

              <div className="grid gap-3 md:grid-cols-2">
                {resourceFiltered.map((r, index) => (
                  <motion.a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.03 }}
                    className="rounded-2xl border border-white/70 bg-white/85 p-4 backdrop-blur-xl"
                  >
                    <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {r.type} • {r.duration} • {r.category}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                      Open resource <ArrowUpRight size={12} />
                    </p>
                  </motion.a>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Health Tracker" && (
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <SectionCard title="Daily Tracker">
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TrackerInput
                    icon={Droplets}
                    label="Water (glasses)"
                    value={tracker.water}
                    onChange={(v) => setTracker((p) => ({ ...p, water: Number(v) }))}
                  />
                  <TrackerInput
                    icon={Footprints}
                    label="Steps"
                    value={tracker.steps}
                    onChange={(v) => setTracker((p) => ({ ...p, steps: Number(v) }))}
                  />
                  <TrackerInput
                    icon={Moon}
                    label="Sleep (hours)"
                    value={tracker.sleep}
                    step="0.1"
                    onChange={(v) => setTracker((p) => ({ ...p, sleep: Number(v) }))}
                  />
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <p className="text-xs text-slate-500">Mood</p>
                    <select
                      value={tracker.mood}
                      onChange={(e) => setTracker((p) => ({ ...p, mood: e.target.value }))}
                      className="mt-1 w-full bg-transparent text-sm outline-none"
                    >
                      <option>Good</option>
                      <option>Balanced</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={saveTracker}
                  className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Save Today’s Log
                </button>
              </SectionCard>

              <SectionCard title="Recent Logs">
                <div className="mt-3 space-y-2">
                  {trackerLogs.map((log) => (
                    <div key={log.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                      <p className="font-semibold">{log.date}</p>
                      <p className="text-xs text-slate-500">
                        Water {log.water} • Steps {log.steps} • Sleep {log.sleep}h • Mood {log.mood}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-1450 grid place-items-center bg-black/40 p-4"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: easeSmooth }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl rounded-3xl border border-white/60 bg-white/90 p-4 shadow-2xl backdrop-blur-2xl sm:p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">Report • Case {selectedReport.caseId}</p>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">
                  Doctor: {selectedReport.doctorName || "Doctor"} •{" "}
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </p>
                <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {selectedReport.report}
                </pre>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => downloadTxt(selectedReport)}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                >
                  <Download size={13} />
                  Download TXT
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-1500 grid place-items-center bg-black/45 p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-white/60 bg-white/95 p-5 shadow-2xl backdrop-blur-2xl"
            >
              <p className="text-lg font-semibold text-slate-900">Confirm Logout</p>
              <p className="mt-1 text-sm text-slate-600">
                Are you sure you want to end this session?
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={onLogout}
                  className="flex-1 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ title, value, subtitle, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: easeSmooth }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur-xl"
    >
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </motion.div>
  );
}

function OverviewCard({ title, lines, action, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      className="rounded-2xl border border-white/70 bg-white/85 p-4 backdrop-blur-xl"
    >
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <div className="mt-2 space-y-1 text-sm text-slate-700">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      {action ? (
        <button
          onClick={onAction}
          className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
        >
          {action}
        </button>
      ) : null}
    </motion.div>
  );
}

function SectionCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      className="rounded-2xl border border-white/70 bg-white/85 p-4 backdrop-blur-xl"
    >
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{title}</p>
      {children}
    </motion.div>
  );
}

function TrackerInput({ icon: Icon, label, value, onChange, step = "1" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <p className="inline-flex items-center gap-1 text-xs text-slate-500">
        <Icon size={12} />
        {label}
      </p>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent text-sm outline-none"
      />
    </div>
  );
}

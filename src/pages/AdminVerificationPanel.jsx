// src/pages/AdminVerificationPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ShieldX, Clock3, Filter, Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DOCTORS_KEY = "veda_doctors";
const VERIFICATIONS_KEY = "veda_doctor_verifications";

const DOC_FIELDS = [
  { key: "licenseDocument", label: "Medical License" },
  { key: "degreeDocument", label: "Degree Certificate" },
  { key: "idDocument", label: "Government ID" },
  { key: "selfieDocument", label: "Profile Photo / Selfie" },
];

const readList = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const writeList = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const parseDoc = (value) => {
  if (!value) return { name: "", url: "", type: "" };
  if (typeof value === "string") return { name: value, url: "", type: "" };
  return { name: value.name || "", url: value.url || "", type: value.type || "" };
};

const isImage = (doc) => {
  const s = `${doc.type} ${doc.name} ${doc.url}`.toLowerCase();
  return s.includes("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(s);
};

const isPdf = (doc) => {
  const s = `${doc.type} ${doc.name} ${doc.url}`.toLowerCase();
  return s.includes("application/pdf") || /\.pdf$/.test(s);
};

export default function AdminVerificationPanel() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [reviewReasonMap, setReviewReasonMap] = useState({});
  const [toast, setToast] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);

  const loadData = () => {
    const allDoctors = readList(DOCTORS_KEY).filter((d) => d.role === "doctor");
    const allApps = readList(VERIFICATIONS_KEY);
    setDoctors(allDoctors);
    setApplications(allApps);
  };

  useEffect(() => {
    loadData();
    const onUpdate = () => loadData();
    window.addEventListener("veda:doctor-updated", onUpdate);
    return () => window.removeEventListener("veda:doctor-updated", onUpdate);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const rows = useMemo(() => {
    const merged = doctors.map((doctor) => {
      const application = applications.find((a) => a.doctorId === doctor.id) || null;
      return { doctor, application, status: doctor.verificationStatus || "not_submitted" };
    });

    const filtered = filter === "all" ? merged : merged.filter((r) => r.status === filter);
    const order = { pending: 0, rejected: 1, not_submitted: 2, verified: 3 };
    return filtered.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  }, [doctors, applications, filter]);

  const persist = (nextDoctors, nextApps, message) => {
    writeList(DOCTORS_KEY, nextDoctors);
    writeList(VERIFICATIONS_KEY, nextApps);
    setDoctors(nextDoctors);
    setApplications(nextApps);
    setToast(message);
    window.dispatchEvent(new Event("veda:doctor-updated"));
  };

  const approve = (row) => {
    if (!row.application) return;
    const nextDoctors = doctors.map((d) =>
      d.id === row.doctor.id ? { ...d, verificationStatus: "verified", verificationReviewReason: "" } : d
    );
    const nextApps = applications.map((a) =>
      a.doctorId === row.doctor.id
        ? { ...a, status: "verified", reviewReason: "", reviewedAt: new Date().toISOString() }
        : a
    );
    persist(nextDoctors, nextApps, "Doctor approved");
  };

  const reject = (row) => {
    if (!row.application) return;
    const reason = (reviewReasonMap[row.doctor.id] || "").trim();
    if (!reason) return setToast("Enter rejection reason first");

    const nextDoctors = doctors.map((d) =>
      d.id === row.doctor.id ? { ...d, verificationStatus: "rejected", verificationReviewReason: reason } : d
    );
    const nextApps = applications.map((a) =>
      a.doctorId === row.doctor.id
        ? { ...a, status: "rejected", reviewReason: reason, reviewedAt: new Date().toISOString() }
        : a
    );
    persist(nextDoctors, nextApps, "Doctor rejected");
  };

  return (
    <main className="min-h-[calc(100vh-6rem)] w-full overflow-x-hidden bg-[linear-gradient(160deg,#f6fbff_0%,#f8fcff_45%,#f4fff8_100%)] px-3 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-7xl min-w-0">
        <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Admin</p>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Doctor Verification Panel
            </h1>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:items-center">
            <button
              onClick={() => navigate("/")}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
            >
              Go Home
            </button>
            <div className="col-span-1 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <Filter size={14} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold outline-none"
              >
                <option value="all">All</option>
                <option value="not_submitted">Not Submitted</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {rows.map((row) => (
            <article
              key={row.doctor.id}
              className="w-full min-w-0 rounded-2xl border border-white/70 bg-white/90 p-4 backdrop-blur-xl sm:rounded-3xl sm:p-5"
            >
              <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{row.doctor.fullName}</h2>
                  <p className="break-all text-xs text-slate-500 sm:text-sm">{row.doctor.email}</p>
                </div>
                <StatusPill status={row.status} />
              </div>

              <div className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Signup Data</h3>
                  <Item label="Phone" value={row.doctor.phone} />
                  <Item label="Specialization" value={row.doctor.specialization} />
                  <Item label="License No." value={row.doctor.licenseNumber} />
                  <Item label="Hospital" value={row.doctor.hospitalName} />
                  <Item label="Experience" value={`${row.doctor.experienceYears} years`} />
                  <Item label="City" value={row.doctor.city} />
                  <Item label="Address" value={row.doctor.clinicAddress} />
                </div>

                <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Verification Data</h3>
                  {!row.application ? (
                    <p className="text-sm text-slate-500">Not submitted yet.</p>
                  ) : (
                    <>
                      <Item label="Council" value={row.application.section3?.registrationCouncil} />
                      <Item label="Reg. No." value={row.application.section3?.registrationNumber} />
                      <Item label="Reg. Year" value={row.application.section3?.registrationYear} />
                      <Item label="Degree" value={row.application.section3?.highestDegree} />
                      <Item label="University" value={row.application.section3?.universityName} />
                      <Item label="Govt ID" value={`${row.application.section3?.govtIdType} • ${row.application.section3?.govtIdNumber}`} />
                    </>
                  )}
                </div>

                <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 md:col-span-2 xl:col-span-1">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Documents & Decision</h3>

                  {!row.application ? (
                    <p className="text-sm text-slate-500">Waiting for doctor submission.</p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {DOC_FIELDS.map((field) => {
                          const doc = parseDoc(row.application.documents?.[field.key]);
                          const canPreview = Boolean(doc.url);
                          return (
                            <div key={field.key} className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                              <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{field.label}</p>
                                <p className="truncate text-xs text-slate-700">{doc.name || "Not provided"}</p>
                              </div>
                              <button
                                type="button"
                                disabled={!canPreview}
                                onClick={() => canPreview && setPreviewDoc({ label: field.label, ...doc })}
                                className={`shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${
                                  canPreview ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500 cursor-not-allowed"
                                }`}
                              >
                                <Eye size={12} /> View
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {(row.status === "pending" || row.status === "rejected") && (
                        <div className="mt-3 space-y-2">
                          <textarea
                            value={reviewReasonMap[row.doctor.id] || ""}
                            onChange={(e) => setReviewReasonMap((prev) => ({ ...prev, [row.doctor.id]: e.target.value }))}
                            placeholder="Reason (required for rejection)"
                            className="min-h-[86px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => approve(row)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
                              Approve
                            </button>
                            <button onClick={() => reject(row)} className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white">
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {row.status === "verified" && (
                        <p className="mt-3 text-sm font-medium text-emerald-700">Approved. Dashboard unlocked.</p>
                      )}

                      {row.status === "rejected" && (
                        <p className="mt-3 text-sm font-medium text-rose-700 break-words">
                          Current reason: {row.doctor.verificationReviewReason || row.application.reviewReason}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}

          {!rows.length && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              No applications for selected filter.
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {previewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewDoc(null)}
            className="fixed inset-0 z-[3000] grid place-items-center bg-black/70 p-3 backdrop-blur-sm sm:p-5"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl rounded-2xl border border-white/20 bg-[#0b1220] text-white"
            >
              <div className="flex min-w-0 items-center justify-between border-b border-white/10 p-3 sm:p-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">{previewDoc.label}</p>
                  <p className="truncate text-sm font-semibold">{previewDoc.name || "Preview"}</p>
                </div>
                <button onClick={() => setPreviewDoc(null)} className="rounded-lg bg-white/10 p-2 hover:bg-white/20">
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 sm:p-4">
                <div className="max-h-[72vh] min-h-[320px] overflow-auto rounded-xl border border-white/15 bg-black/30 p-2">
                  {isImage(previewDoc) ? (
                    <img src={previewDoc.url} alt={previewDoc.name || "doc"} className="mx-auto max-h-[66vh] w-auto rounded-lg" />
                  ) : isPdf(previewDoc) ? (
                    <iframe title={previewDoc.name || "pdf"} src={previewDoc.url} className="h-[66vh] w-full rounded-lg bg-white" />
                  ) : (
                    <div className="grid h-[280px] place-items-center text-center text-white/80">
                      <div>
                        <p className="mb-2">Preview not supported for this file type.</p>
                        <a href={previewDoc.url} target="_blank" rel="noreferrer" className="inline-flex rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white">
                          Open File
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <div className="fixed bottom-4 right-4 z-[1500] rounded-xl bg-slate-900 px-4 py-2 text-sm text-white">
          {toast}
        </div>
      )}
    </main>
  );
}

function Item({ label, value }) {
  return (
    <div className="mb-2 min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="break-words text-sm text-slate-800">{value || "-"}</p>
    </div>
  );
}

function StatusPill({ status }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-700">
        <CheckCircle2 size={14} /> verified
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-bold uppercase text-rose-700">
        <ShieldX size={14} /> rejected
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-700">
        <Clock3 size={14} /> pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
      <Clock3 size={14} /> not submitted
    </span>
  );
}

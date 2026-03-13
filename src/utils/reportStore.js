// src/utils/reportStore.js
const REPORTS_KEY = "veda_patient_reports";

const readSafe = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

export const reportStore = {
  getAll() {
    return readSafe(REPORTS_KEY);
  },

  getByPatientEmail(email) {
    if (!email) return [];
    return readSafe(REPORTS_KEY)
      .filter((r) => (r.patientEmail || "").toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  save(report) {
    const all = readSafe(REPORTS_KEY);
    localStorage.setItem(REPORTS_KEY, JSON.stringify([report, ...all]));
    return report;
  },

  markRead(reportId) {
    const all = readSafe(REPORTS_KEY).map((r) =>
      r.id === reportId ? { ...r, isRead: true } : r
    );
    localStorage.setItem(REPORTS_KEY, JSON.stringify(all));
  },
};

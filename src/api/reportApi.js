// src/api/reportApi.js
import { reportStore } from "../utils/reportStore";

const USE_LOCAL_MOCK = true; // TODO(BACKEND): set false when API is ready

export const reportApi = {
  async sendReportToPatient({
    caseId,
    patientEmail,
    patientName,
    doctorName,
    report,
  }) {
    if (USE_LOCAL_MOCK) {
      const item = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        caseId,
        patientEmail,
        patientName,
        doctorName,
        report,
        createdAt: new Date().toISOString(),
        isRead: false,
        deliveryStatus: "delivered",
      };
      reportStore.save(item);
      return { ok: true, data: item };
    }

    // TODO(BACKEND): POST /api/reports/send
    // return fetch(...)

    return { ok: false };
  },

  async getPatientReports({ patientEmail }) {
    if (USE_LOCAL_MOCK) {
      return { ok: true, data: reportStore.getByPatientEmail(patientEmail) };
    }

    // TODO(BACKEND): GET /api/patient/reports?email=...
    // return fetch(...)

    return { ok: false, data: [] };
  },

  async markReportRead({ reportId }) {
    if (USE_LOCAL_MOCK) {
      reportStore.markRead(reportId);
      return { ok: true };
    }

    // TODO(BACKEND): PATCH /api/reports/:reportId/read
    // return fetch(...)

    return { ok: false };
  },
};

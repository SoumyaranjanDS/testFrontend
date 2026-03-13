import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const DOCTORS_KEY = "veda_doctors";
const PATIENTS_KEY = "veda_patients";
const SESSION_KEY = "veda_session";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const licenseRegex = /^[A-Za-z0-9-]{6,}$/;

const readList = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function DoctorSignup({ onSignup }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    licenseNumber: "",
    hospitalName: "",
    experienceYears: "",
    clinicAddress: "",
    city: "",
    consent: false,
  });

  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};

    if (form.fullName.trim().length < 3) next.fullName = "Enter full name.";
    if (!emailRegex.test(form.email.trim())) next.email = "Enter valid email.";
    if (!phoneRegex.test(form.phone.trim())) next.phone = "Enter 10 digit phone number.";
    if (!passwordRegex.test(form.password)) {
      next.password = "8+ chars with uppercase, lowercase and number.";
    }
    if (form.confirmPassword !== form.password) {
      next.confirmPassword = "Passwords do not match.";
    }
    if (!form.specialization.trim()) next.specialization = "Enter specialization.";
    if (!licenseRegex.test(form.licenseNumber.trim())) {
      next.licenseNumber = "License number must be at least 6 characters.";
    }
    if (!form.hospitalName.trim()) next.hospitalName = "Enter hospital/clinic name.";

    const years = Number(form.experienceYears);
    if (!Number.isFinite(years) || years < 0 || years > 60) {
      next.experienceYears = "Experience must be between 0 and 60.";
    }

    if (form.clinicAddress.trim().length < 8) {
      next.clinicAddress = "Enter full clinic address.";
    }
    if (form.city.trim().length < 2) next.city = "Enter city.";
    if (!form.consent) next.consent = "Consent is required.";

    const allEmails = [
      ...readList(DOCTORS_KEY).map((u) => u.email.toLowerCase()),
      ...readList(PATIENTS_KEY).map((u) => u.email.toLowerCase()),
    ];
    if (allEmails.includes(form.email.trim().toLowerCase())) {
      next.email = "Email already registered.";
    }

    return next;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const doctor = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      role: "doctor",
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password, // demo only
      specialization: form.specialization.trim(),
      licenseNumber: form.licenseNumber.trim(),
      hospitalName: form.hospitalName.trim(),
      experienceYears: Number(form.experienceYears),
      clinicAddress: form.clinicAddress.trim(),
      city: form.city.trim(),
      verificationStatus: "pending",
      createdAt: new Date().toISOString(),
    };

    // TODO(BACKEND): Replace with POST /api/auth/signup/doctor
    const doctors = readList(DOCTORS_KEY);
    localStorage.setItem(DOCTORS_KEY, JSON.stringify([doctor, ...doctors]));

    const session = {
      id: doctor.id,
      role: doctor.role,
      name: doctor.fullName,
      email: doctor.email,
      loggedInAt: new Date().toISOString(),
    };

    // TODO(BACKEND): Replace localStorage session with server token/session response
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    onSignup?.(session);
    navigate("/dashboard/doctor");
  };

  const inputClass =
    "w-full rounded-full border border-slate-200 bg-white/75 px-5 py-4 text-sm text-slate-700 placeholder:text-slate-400 shadow-[0_8px_30px_rgba(15,23,42,0.05)] outline-none transition-all duration-300 focus:-translate-y-[1px] focus:border-cyan-300 focus:bg-white focus:shadow-[0_10px_35px_rgba(34,211,238,0.14)]";

  const labelClass = "mb-2 block text-sm font-medium text-slate-600";
  const errorClass = "mt-2 pl-2 text-xs text-rose-500";

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      {/* background */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 14, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-[-80px] top-[-40px] h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 25, 0], x: [0, -18, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-[-80px] top-[20%] h-80 w-80 rounded-full bg-sky-200/40 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-[-80px] left-[22%] h-72 w-72 rounded-full bg-blue-100/60 blur-3xl"
      />

      <section className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        {/* left content */}
        <motion.div
          initial={{ opacity: 0, x: -50, filter: "blur(12px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="pt-4 lg:sticky lg:top-10"
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-4 inline-flex rounded-full border border-cyan-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700 shadow-sm backdrop-blur"
          >
            Doctor Signup
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.7 }}
            className="max-w-xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl"
          >
            Join Veda with a calm, clean onboarding experience.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.7 }}
            className="mt-5 max-w-lg text-base leading-7 text-slate-600"
          >
            Create your doctor account, submit your professional details, and get ready
            for verification. The layout is kept simple, soft, and distraction-free for a
            better signup flow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.7 }}
            className="mt-8 space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />
              <p className="text-sm text-slate-600">Professional verification-ready form</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
              <p className="text-sm text-slate-600">Minimal design with soft interactions</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
              <p className="text-sm text-slate-600">Same logic, upgraded visual feel</p>
            </div>
          </motion.div>
        </motion.div>

        {/* form */}
        <motion.section
          initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2.2rem] border border-white/70 bg-white/65 p-5 shadow-[0_30px_100px_-30px_rgba(15,23,42,0.18)] backdrop-blur-2xl sm:p-8 lg:p-10"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />

          <motion.form
            onSubmit={onSubmit}
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.08 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2"
          >
            <motion.div variants={itemVariants}>
              <label className={labelClass}>Full name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                placeholder="Dr. Your full name"
                className={inputClass}
              />
              {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className={labelClass}>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="doctor@example.com"
                className={inputClass}
              />
              {errors.email && <p className={errorClass}>{errors.email}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className={labelClass}>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="10 digit phone number"
                className={inputClass}
              />
              {errors.phone && <p className={errorClass}>{errors.phone}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className={labelClass}>Specialization</label>
              <input
                name="specialization"
                value={form.specialization}
                onChange={onChange}
                placeholder="Cardiology, Dermatology..."
                className={inputClass}
              />
              {errors.specialization && <p className={errorClass}>{errors.specialization}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className={labelClass}>Medical license number</label>
              <input
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={onChange}
                placeholder="Enter your license number"
                className={inputClass}
              />
              {errors.licenseNumber && <p className={errorClass}>{errors.licenseNumber}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className={labelClass}>Hospital / Clinic name</label>
              <input
                name="hospitalName"
                value={form.hospitalName}
                onChange={onChange}
                placeholder="Hospital or clinic"
                className={inputClass}
              />
              {errors.hospitalName && <p className={errorClass}>{errors.hospitalName}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className={labelClass}>Years of experience</label>
              <input
                name="experienceYears"
                type="number"
                min="0"
                max="60"
                value={form.experienceYears}
                onChange={onChange}
                placeholder="Years of experience"
                className={inputClass}
              />
              {errors.experienceYears && <p className={errorClass}>{errors.experienceYears}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className={labelClass}>City</label>
              <input
                name="city"
                value={form.city}
                onChange={onChange}
                placeholder="City"
                className={inputClass}
              />
              {errors.city && <p className={errorClass}>{errors.city}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="sm:col-span-2">
              <label className={labelClass}>Clinic address</label>
              <input
                name="clinicAddress"
                value={form.clinicAddress}
                onChange={onChange}
                placeholder="Enter clinic address"
                className={inputClass}
              />
              {errors.clinicAddress && <p className={errorClass}>{errors.clinicAddress}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className={labelClass}>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="Create password"
                className={inputClass}
              />
              {errors.password && <p className={errorClass}>{errors.password}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className={labelClass}>Confirm password</label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={onChange}
                placeholder="Confirm password"
                className={inputClass}
              />
              {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="sm:col-span-2 pt-1">
              <label className="flex items-start gap-3 rounded-3xl border border-slate-200/80 bg-slate-50/70 px-4 py-4 text-sm text-slate-600 shadow-sm">
                <input
                  type="checkbox"
                  name="consent"
                  checked={form.consent}
                  onChange={onChange}
                  className="mt-1 h-4 w-4 rounded accent-cyan-500"
                />
                <span>
                  I confirm these details are correct and consent to verification.
                </span>
              </label>
              {errors.consent && <p className={errorClass}>{errors.consent}</p>}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="sm:col-span-2 mt-2 flex flex-col gap-3 sm:flex-row"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                className="rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 px-6 py-4 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(14,165,233,0.28)] transition-all duration-300"
              >
                Create Doctor Account
              </motion.button>

              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.985 }}>
                <Link
                  to="/signup"
                  className="block rounded-full border border-slate-200 bg-white px-6 py-4 text-center text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-cyan-300 hover:text-cyan-700"
                >
                  Back to role selection
                </Link>
              </motion.div>
            </motion.div>
          </motion.form>
        </motion.section>
      </section>
    </main>
  );
}
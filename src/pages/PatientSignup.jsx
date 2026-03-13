import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const DOCTORS_KEY = "veda_doctors";
const PATIENTS_KEY = "veda_patients";
const SESSION_KEY = "veda_session";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const readList = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

// --- Reusable Minimal Line Input Component ---
const LineInput = ({ label, name, type = "text", value, onChange, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || value?.toString().trim().length > 0;

  return (
    <motion.div layout className="relative flex w-full flex-col pt-6">
      <motion.label
        layout
        className={`absolute left-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          isActive ? "top-0 text-xs font-semibold tracking-widest text-slate-500 uppercase" : "top-6 text-lg text-slate-400"
        }`}
      >
        {label}
      </motion.label>
      
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="peer w-full resize-none border-b-2 border-slate-200 bg-transparent py-2 text-xl font-medium text-slate-900 transition-colors duration-300 focus:border-slate-900 focus:outline-none min-h-[40px]"
          {...props}
        />
      ) : type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`peer w-full appearance-none border-b-2 border-slate-200 bg-transparent py-2 text-xl font-medium transition-colors duration-300 focus:border-slate-900 focus:outline-none cursor-pointer ${value ? "text-slate-900" : "text-transparent"}`}
          {...props}
        >
          <option value="" disabled className="text-slate-400">Select...</option>
          {props.options.map(opt => (
            <option key={opt.value} value={opt.value} className="text-slate-900">{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="peer w-full border-b-2 border-slate-200 bg-transparent py-2 text-xl font-medium text-slate-900 transition-colors duration-300 focus:border-slate-900 focus:outline-none"
          {...props}
        />
      )}

      {/* Smooth Error Reveal */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-2 text-sm text-red-500 font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function PatientSignup({ onSignup }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "", confirmPassword: "",
    age: "", height: "", weight: "", gender: "", bloodGroup: "", city: "",
    emergencyName: "", emergencyPhone: "", primaryConcern: "",
    knownConditions: "", allergies: "", consent: false,
  });

  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (form.fullName.trim().length < 3) next.fullName = "Full name required.";
    if (!emailRegex.test(form.email.trim())) next.email = "Valid email required.";
    if (!phoneRegex.test(form.phone.trim())) next.phone = "10-digit number required.";
    if (!passwordRegex.test(form.password)) next.password = "8+ chars, 1 uppercase, 1 number.";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords must match.";
    
    const age = Number(form.age);
    if (!Number.isFinite(age) || age < 1 || age > 120) next.age = "Valid age required.";
    
    // Validating new fields
    const height = Number(form.height);
    if (!Number.isFinite(height) || height < 50 || height > 300) next.height = "Valid height (cm) required.";
    const weight = Number(form.weight);
    if (!Number.isFinite(weight) || weight < 2 || weight > 500) next.weight = "Valid weight (kg) required.";

    if (!form.gender) next.gender = "Selection required.";
    if (!form.bloodGroup) next.bloodGroup = "Selection required.";
    if (form.city.trim().length < 2) next.city = "City required.";
    if (form.emergencyName.trim().length < 3) next.emergencyName = "Contact name required.";
    if (!phoneRegex.test(form.emergencyPhone.trim())) next.emergencyPhone = "10-digit number required.";
    if (form.primaryConcern.trim().length < 8) next.primaryConcern = "Please provide more detail.";
    if (!form.consent) next.consent = "Required to proceed.";

    return next;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const patient = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      role: "patient",
      ...form,
      age: Number(form.age),
      height: Number(form.height),
      weight: Number(form.weight),
      createdAt: new Date().toISOString(),
    };

    const patients = readList(PATIENTS_KEY);
    localStorage.setItem(PATIENTS_KEY, JSON.stringify([patient, ...patients]));

    const session = { id: patient.id, role: patient.role, name: patient.fullName, email: patient.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    onSignup?.(session);
    navigate("/dashboard/patient");
  };

  // Staggered animation for form rows
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 100 } }
  };

  return (
    <main className="relative min-h-screen bg-[#F5F5F7] px-6 py-20 selection:bg-slate-300 sm:px-12 lg:px-24">
      {/* Ultra Minimal Background - Just an off-white canvas with a subtle grain */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.04] [background-image:url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        
        {/* Simple, interactive greeting instead of a massive bold header */}
        <motion.div 
          whileTap={{ scale: 0.98 }} 
          className="mb-20 inline-block cursor-default"
        >
          <p className="text-sm font-medium tracking-widest text-slate-500 uppercase mb-2">Patient Intake</p>
          <h1 className="text-3xl font-light text-slate-900 sm:text-4xl tracking-tight">
            Tell us about <span className="italic text-slate-500 hover:text-slate-900 transition-colors duration-500">yourself.</span>
          </h1>
        </motion.div>

        <motion.form 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          onSubmit={onSubmit} 
          className="flex flex-col gap-10"
        >
          {/* Basics */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            <LineInput label="Legal Name" name="fullName" value={form.fullName} onChange={onChange} error={errors.fullName} />
            <LineInput label="Email Address" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
          </motion.div>

          {/* Biometrics & New Fields */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-10 sm:grid-cols-4">
            <LineInput label="Age" name="age" type="number" value={form.age} onChange={onChange} error={errors.age} />
            <LineInput label="Height (cm)" name="height" type="number" value={form.height} onChange={onChange} error={errors.height} />
            <LineInput label="Weight (kg)" name="weight" type="number" value={form.weight} onChange={onChange} error={errors.weight} />
            <LineInput label="Blood Type" name="bloodGroup" type="select" value={form.bloodGroup} onChange={onChange} error={errors.bloodGroup} options={[
              { value: "A+", label: "A+" }, { value: "A-", label: "A-" }, { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
              { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" }, { value: "O+", label: "O+" }, { value: "O-", label: "O-" }
            ]} />
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            <LineInput label="Gender Identity" name="gender" type="select" value={form.gender} onChange={onChange} error={errors.gender} options={[
              { value: "female", label: "Female" }, { value: "male", label: "Male" }, 
              { value: "non-binary", label: "Non-binary" }, { value: "prefer-not-to-say", label: "Prefer not to say" }
            ]} />
            <LineInput label="Phone Number" name="phone" value={form.phone} onChange={onChange} error={errors.phone} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <LineInput label="City of Residence" name="city" value={form.city} onChange={onChange} error={errors.city} />
          </motion.div>

          {/* Emergency Contact */}
          <motion.div variants={itemVariants} className="mt-8 border-t border-slate-200 pt-8 grid grid-cols-1 gap-10 sm:grid-cols-2">
            <LineInput label="Emergency Contact Name" name="emergencyName" value={form.emergencyName} onChange={onChange} error={errors.emergencyName} />
            <LineInput label="Emergency Phone" name="emergencyPhone" value={form.emergencyPhone} onChange={onChange} error={errors.emergencyPhone} />
          </motion.div>

          {/* Medical Info */}
          <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 gap-10">
            <LineInput label="What is your primary health concern?" name="primaryConcern" type="textarea" value={form.primaryConcern} onChange={onChange} error={errors.primaryConcern} />
            <LineInput label="Any known medical conditions?" name="knownConditions" type="textarea" value={form.knownConditions} onChange={onChange} />
            <LineInput label="List any allergies" name="allergies" type="textarea" value={form.allergies} onChange={onChange} />
          </motion.div>

          {/* Security */}
          <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2">
            <LineInput label="Create Password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} />
            <LineInput label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={onChange} error={errors.confirmPassword} />
          </motion.div>

          {/* Minimal Consent & Submit */}
          <motion.div variants={itemVariants} className="mt-16 flex flex-col gap-8">
            <motion.label layout className="group flex cursor-pointer items-start gap-4">
              <div className="relative mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 border-slate-300 transition-colors group-hover:border-slate-900">
                <input type="checkbox" name="consent" checked={form.consent} onChange={onChange} className="peer absolute h-full w-full cursor-pointer opacity-0" />
                <motion.svg 
                  initial={false}
                  animate={{ scale: form.consent ? 1 : 0, opacity: form.consent ? 1 : 0 }}
                  className="pointer-events-none h-3 w-3 fill-slate-900" 
                  viewBox="0 0 12 12"
                >
                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                </motion.svg>
              </div>
              <span className="text-lg text-slate-500 transition-colors group-hover:text-slate-900">
                I agree to the secure processing of my health data.
              </span>
            </motion.label>
            <AnimatePresence>
              {errors.consent && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-red-500">{errors.consent}</motion.p>}
            </AnimatePresence>

            <div className="flex items-center justify-between border-t border-slate-200 pt-8">
              <Link to="/signup" className="text-sm font-semibold tracking-widest text-slate-400 uppercase transition-colors hover:text-slate-900">
                Cancel
              </Link>
              <button type="submit" className="group relative overflow-hidden rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold tracking-widest text-white uppercase transition-all hover:bg-black active:scale-95">
                <span className="relative z-10 flex items-center gap-3">
                  Submit <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </button>
            </div>
          </motion.div>
        </motion.form>
      </div>
    </main>
  );
}
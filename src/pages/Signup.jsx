import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#fbfcfd] px-6 py-12">
      {/* Soft Texture & Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(at_top_right,rgba(206,233,252,0.4),transparent_50%),radial-gradient(at_top_left,rgba(235,232,255,0.4),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.02] [background-image:url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <section className="w-full max-w-sm">
        {/* Simple Minimal Header */}
        <div className="mb-12 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign up as</h1>
          <p className="mt-1 text-sm text-slate-500 text-pretty">Choose an option to continue</p>
        </div>

        {/* Clean, Non-Boxy Option Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/signup/doctor")}
            className="group flex w-full items-center justify-between rounded-full border border-slate-200 bg-white/60 p-2 pl-8 pr-2 transition-all hover:border-cyan-200 hover:bg-cyan-50/50 hover:shadow-lg hover:shadow-cyan-500/5 active:scale-[0.98]"
          >
            <span className="text-base font-medium text-slate-700">Doctor</span>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white transition-colors group-hover:bg-cyan-600">
              <span className="text-lg">→</span>
            </div>
          </button>

          <button
            onClick={() => navigate("/signup/patient")}
            className="group flex w-full items-center justify-between rounded-full border border-slate-200 bg-white/60 p-2 pl-8 pr-2 transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-lg hover:shadow-blue-500/5 active:scale-[0.98]"
          >
            <span className="text-base font-medium text-slate-700">Patient</span>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white transition-colors group-hover:bg-blue-600">
              <span className="text-lg">→</span>
            </div>
          </button>
        </div>

        {/* Simple Footer Link (Optional) */}
        <p className="mt-12 text-center text-xs text-slate-400">
          Already have an account? <span className="cursor-pointer font-medium text-slate-600 underline underline-offset-4">Log in</span>
        </p>
      </section>
    </main>
  );
}
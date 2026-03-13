import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const avatars = [
  { name: "Aarav", initials: "AR", image: "" },
  { name: "Riya", initials: "RI", image: "" },
  { name: "Kabir", initials: "KA", image: "" },
  { name: "Meera", initials: "ME", image: "" },
  { name: "Diya", initials: "DI", image: "" },
  { name: "Ishaan", initials: "IS", image: "" },
];

const easeSmooth = [0.22, 1, 0.36, 1];
const helperText =
  "Some patients find it difficult to talk openly about sensitive health concerns. VedaAI helps them express symptoms more comfortably.";
const mobileHelperText = "Private support for sensitive symptoms.";

export default function Hero({
  onOpenLogin = () => {},
  onOpenSignup = () => {},
}) {
  const [showMessage, setShowMessage] = useState(false);
  const [typedText, setTypedText] = useState("");

  const handleMobileLogin = () => {
    onOpenLogin?.();
  };

  const handleMobileSignup = () => {
    onOpenSignup?.();
  };

  useEffect(() => {
    const revealTimer = setTimeout(() => {
      setShowMessage(true);
    }, 900);

    return () => clearTimeout(revealTimer);
  }, []);

  useEffect(() => {
    if (!showMessage) return;

    let index = 0;
    const typeTimer = setInterval(() => {
      index += 1;
      setTypedText(helperText.slice(0, index));

      if (index >= helperText.length) {
        clearInterval(typeTimer);
      }
    }, 18);

    return () => clearInterval(typeTimer);
  }, [showMessage]);

  return (
    <section
      id="home"
      className="relative isolate min-h-screen overflow-hidden pt-28 sm:pt-32"
    >
      <div className="hero-futuristic-bg" />
      <div className="hero-vignette-light" />

      <div className="section-shell relative flex min-h-[calc(100vh-7rem)] items-center justify-center pb-32 pt-12 sm:pb-28">
        <div className="w-full max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, ease: easeSmooth }}
            className="glass-panel mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--color-primary)] sm:text-sm"
          >
            <span className="h-2 w-2 rounded-full bg-[#5b9fff]" />
            AI healthcare for everyone
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, delay: 0.06, ease: easeSmooth }}
            className="mx-auto mt-8 max-w-3xl text-[3rem] font-semibold leading-[0.9] tracking-[-0.09em] text-[var(--color-text)] sm:text-[4.8rem] lg:text-[6rem]"
          >
            Better care.
            <br />
            Less confusion.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, delay: 0.14, ease: easeSmooth }}
            className="mx-auto mt-6 max-w-lg px-2 text-[0.95rem] leading-7 text-[var(--color-text-muted)] sm:text-[1.05rem]"
          >
            VedaAI helps patients understand symptoms, organize reports, and
            reach the right care path with clarity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.22, ease: easeSmooth }}
            className="mt-8 flex items-center justify-center gap-3 lg:hidden"
          >
            <button
              type="button"
              onClick={handleMobileLogin}
              className="btn-secondary px-5 py-3 text-sm font-semibold"
            >
              Login
            </button>
            <button
              type="button"
              onClick={handleMobileSignup}
              className="btn-primary px-5 py-3 text-sm font-semibold"
            >
              Sign up
            </button>
          </motion.div>
        </div>

        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: easeSmooth }}
            className="absolute bottom-30 left-1/2 w-full max-w-[260px] -translate-x-1/2 lg:hidden"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0.46))] px-4 py-3 shadow-[0_18px_42px_-28px_rgba(47,120,217,0.35)] backdrop-blur-xl">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ff8e8e] shadow-[0_0_8px_rgba(255,124,124,0.8)]" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5f4a3f]">
                  Sensitive Care
                </p>
              </div>
              <p className="text-[12px] leading-5 text-[#4f433b]">
                {mobileHelperText}
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.28, ease: easeSmooth }}
          className="absolute bottom-14 right-0 flex w-full items-end justify-center px-2 sm:bottom-8 sm:justify-end sm:px-0"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {avatars.map((avatar, index) => (
                <motion.div
                  key={avatar.name}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.34 + index * 0.04,
                    ease: easeSmooth,
                  }}
                  className="avatar-ring relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#d9ede3,#9fd3c5)] text-[11px] font-semibold text-[#234d55] sm:h-11 sm:w-11"
                >
                  {avatar.image ? (
                    <img
                      src={avatar.image}
                      alt={avatar.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatar.initials
                  )}
                </motion.div>
              ))}
            </div>

            <p className="text-sm font-semibold text-[var(--color-text)] sm:text-base">
              100+ happy clients
            </p>
          </div>
        </motion.div>

        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, ease: easeSmooth }}
            className="absolute left-0 top-90 hidden w-full max-w-[290px] lg:block"
          >
            <div className="relative overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.58)] bg-[linear-gradient(135deg,rgba(108,86,71,0.18),rgba(255,255,255,0.34))] px-5 py-5 shadow-[0_22px_55px_-30px_rgba(76,54,40,0.22)] backdrop-blur-[22px]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_30%)]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.88),transparent)]" />

              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inset-0 rounded-full bg-[#ff7c7c] blur-[4px] opacity-90" />
                    <span className="relative h-2.5 w-2.5 rounded-full bg-[#ff8e8e]" />
                  </span>

                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6a5143]/80">
                    Sensitive
                  </p>
                </div>

                <p className="text-[13px] leading-6 text-[#4f433b]">
                  {typedText}
                  <span className="ml-0.5 inline-block h-4 w-[1px] animate-pulse bg-[#7b5f49] align-middle" />
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  FilePenLine,
  LockKeyhole,
  Route,
  Stethoscope,
} from "lucide-react";

const easeSmooth = [0.22, 1, 0.36, 1];

const featureDetails = {
  guided: {
    title: "Guided Symptom Input",
    detail:
      "VedaAI helps patients explain symptoms step by step instead of expecting them to describe everything perfectly at once. That makes the first healthcare interaction calmer, clearer, and more useful.",
  },
  private: {
    title: "Private-first Experience",
    detail:
      "Many patients hesitate when the concern feels personal or embarrassing. VedaAI creates a more private and guided first step so sensitive symptoms can be expressed with more comfort and less fear of judgment.",
  },
  direction: {
    title: "Clear Next Direction",
    detail:
      "After symptoms and records are understood, VedaAI helps reduce uncertainty by pointing patients toward a clearer next step instead of leaving them confused about what to do next.",
  },
  doctor: {
    title: "Doctor-ready Context",
    detail:
      "Important case details are organized into a cleaner summary so doctors can begin with stronger context and patients can have more focused consultations.",
  },
  everyday: {
    title: "Everyday symptoms",
    detail:
      "Many health journeys begin with symptoms that feel small but unclear. VedaAI helps patients make sense of those signals early, before confusion grows into delay.",
  },
  chronic: {
    title: "Ongoing conditions",
    detail:
      "Recurring symptoms and long-term conditions need better continuity. VedaAI helps bring old reports, recurring symptoms, and patient context into one clearer flow.",
  },
  followup: {
    title: "Follow-up guidance",
    detail:
      "After reports, prescriptions, or previous consultations, patients still need clarity. VedaAI helps turn that material into a more understandable next step.",
  },
};

function DetailModal({ item, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(20,16,14,0.34)] px-4 backdrop-blur-md sm:px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.35, ease: easeSmooth }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl bg-[linear-gradient(180deg,#f8f2ea_0%,#eee4d8_100%)] px-5 py-6 shadow-[0_30px_80px_-28px_rgba(40,28,22,0.24)] sm:px-7 sm:py-8"
      >
        <div className="mb-5 h-px w-24 bg-[linear-gradient(90deg,#7b5f49,transparent)]" />
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#7b5f49]">
          VedaAI Detail
        </p>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[#1d1815] sm:text-3xl">
          {item.title}
        </h3>
        <p className="mt-4 text-sm leading-7 text-[#675952] sm:text-base">
          {item.detail}
        </p>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-[#7b5f49]">Tap outside to close</p>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#2f241d] px-4 py-2 text-sm font-semibold text-[#f7efe6]"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SweepRevealImage({
  src,
  alt,
  label,
  direction = "left",
  className = "",
  dark = false,
}) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "start 38%"],
  });

  const coverRaw = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "left" ? ["0%", "104%"] : ["0%", "-104%"]
  );

  const scaleRaw = useTransform(scrollYProgress, [0, 1], [1.14, 1]);
  const opacityRaw = useTransform(scrollYProgress, [0, 1], [0.58, 1]);

  const cover = useSpring(coverRaw, { stiffness: 90, damping: 22, mass: 0.9 });
  const scale = useSpring(scaleRaw, { stiffness: 100, damping: 22, mass: 0.9 });
  const opacity = useSpring(opacityRaw, { stiffness: 85, damping: 22, mass: 0.9 });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ scale, opacity }}
        className="h-full w-full object-cover grayscale"
      />

      <motion.div
        style={{ x: cover }}
        className={`absolute inset-0 ${
          dark
            ? "bg-[linear-gradient(135deg,#261d18_0%,#4b392d_52%,#866b58_100%)]"
            : "bg-[linear-gradient(135deg,#2c241f_0%,#6d5848_56%,#b69d84_100%)]"
        }`}
      />

      <div className="absolute left-4 top-4 bg-[rgba(255,255,255,0.78)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1f1b18] backdrop-blur-md sm:left-5 sm:top-5">
        {label}
      </div>
    </div>
  );
}

function SmallCard({ title, text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#f8f2ea] px-5 py-6 text-left transition hover:bg-[#f2e8dc]"
    >
      <h4 className="text-lg font-semibold tracking-[-0.04em] text-[#1d1815]">
        {title}
      </h4>
      <p className="mt-3 text-sm leading-7 text-[#675952]">{text}</p>
      <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#7b5f49]">
        <span>Tap to explore</span>
        <ArrowUpRight size={16} strokeWidth={1.8} />
      </div>
    </button>
  );
}

export default function Features() {
  const introRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const { scrollYProgress } = useScroll({
    target: introRef,
    offset: ["start 90%", "start 40%"],
  });

  const titleYRaw = useTransform(scrollYProgress, [0, 1], [34, 0]);
  const titleOpacityRaw = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const titleY = useSpring(titleYRaw, { stiffness: 100, damping: 22, mass: 0.9 });
  const titleOpacity = useSpring(titleOpacityRaw, {
    stiffness: 85,
    damping: 22,
    mass: 0.85,
  });

  return (
    <>
      <section
        id="features"
        className="relative overflow-hidden bg-[linear-gradient(180deg,#f4efe8_0%,#eee6dc_36%,#f7f2eb_100%)] py-20 sm:py-24 lg:py-28"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-20 h-56 w-56 bg-[radial-gradient(circle,rgba(123,95,73,0.12),transparent_70%)] blur-3xl" />
          <div className="absolute right-[10%] bottom-10 h-64 w-64 bg-[radial-gradient(circle,rgba(184,159,132,0.12),transparent_72%)] blur-3xl" />
        </div>

        <div className="section-shell relative px-4 sm:px-5 lg:px-0">
          <div
            ref={introRef}
            className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-start"
          >
            <motion.div style={{ y: titleY, opacity: titleOpacity }}>
              <div className="mb-4 h-px w-24 bg-[linear-gradient(90deg,#7b5f49,transparent)]" />
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#7b5f49] sm:text-sm">
                A Real Patient Problem
              </p>

              <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.06em] text-[#1d1815] sm:text-4xl lg:text-5xl">
                Some health concerns are hardest to say out loud.
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-7 text-[#675952] sm:text-base">
                In India, many people hesitate when they need to speak about
                sensitive health concerns. Social discomfort, privacy anxiety,
                and fear of judgment often make the first healthcare conversation
                harder than it should be.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.8, delay: 0.08, ease: easeSmooth }}
              className="grid gap-5"
            >
              <p className="max-w-md text-sm leading-7 text-[#675952] sm:text-base">
                VedaAI reduces that barrier through a calmer, more guided way to
                describe symptoms, organize context, and move toward the right
                care path with more dignity and confidence.
              </p>

              <div className="grid gap-4 sm:grid-cols-[0.95fr_1.05fr]">
                <div className="overflow-hidden bg-[#ddd3c6]">
                  {/* Put image in public/img3.jpg */}
                  <img
                    src="/img3.jpg"
                    alt="Private guided support"
                    className="aspect-[4/3] w-full object-cover grayscale"
                  />
                </div>

                <div className="flex flex-col justify-between bg-[#f8f2ea] px-5 py-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b5f49]">
                      Why it matters
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#675952]">
                      A private digital first step gives patients time, comfort,
                      and structure before speaking to a doctor directly.
                    </p>
                  </div>

                  <div className="mt-5 h-px w-16 bg-[linear-gradient(90deg,#7b5f49,transparent)]" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-[1.08fr_0.64fr_0.82fr] lg:items-end">
            <SweepRevealImage
              src="/img1.jpg"
              alt="Patient discussion"
              label="Safe expression"
              direction="left"
              className="aspect-[4/3] bg-[#d9dfdf]"
            />

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.75, delay: 0.1, ease: easeSmooth }}
              className="bg-[#3b2d24] px-6 py-8 text-[#f6efe8]"
            >
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/52">
                Key Insight
              </p>
              <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.04em]">
                Privacy changes how honestly people explain their symptoms.
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/72">
                A guided digital experience can help patients express sensitive
                symptoms with more comfort than an immediate face-to-face conversation.
              </p>
            </motion.div>

            <SweepRevealImage
              src="/img2.jpg"
              alt="Guided care support"
              label="Guided support"
              direction="right"
              className="aspect-[4/3] bg-[#d9dfdf] lg:max-w-[300px] lg:justify-self-end"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.14 }}
            transition={{ duration: 0.8, delay: 0.08, ease: easeSmooth }}
            className="mt-16"
          >
            <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="grid gap-5">
                <div className="bg-[#f8f2ea] px-5 py-6 sm:px-6 sm:py-7">
                  <div className="mb-4 h-px w-24 bg-[linear-gradient(90deg,#7b5f49,transparent)]" />
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#7b5f49] sm:text-sm">
                    Core Capability
                  </p>

                  <h3 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.05em] text-[#1d1815] sm:text-4xl">
                    Built to support many kinds of health concerns, not just one.
                  </h3>

                  <p className="mt-4 max-w-lg text-sm leading-7 text-[#675952] sm:text-base">
                    VedaAI is designed to work across everyday symptoms,
                    sensitive conversations, ongoing conditions, and follow-up
                    guidance.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedItem(featureDetails.private)}
                  className="grid gap-0 bg-[#2f241d] text-left text-[#f7efe6] lg:grid-cols-[0.88fr_1.12fr]"
                >
                  <SweepRevealImage
                    src="/img4.jpg"
                    alt="Sensitive concerns"
                    label="Sensitive concerns"
                    direction="left"
                    dark
                    className="aspect-[16/11] bg-[#2f241d]"
                  />

                  <div className="px-5 py-6 sm:px-6 sm:py-7">
                    <div className="flex h-11 w-11 items-center justify-center bg-white/10 text-[#e5c8a8]">
                      <LockKeyhole size={20} strokeWidth={1.9} />
                    </div>

                    <h4 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
                      Private-first Experience
                    </h4>

                    <p className="mt-3 text-sm leading-7 text-white/72">
                      Sensitive concerns can be expressed with more comfort,
                      less hesitation, and greater privacy.
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#e5c8a8]">
                      <span>Tap to explore</span>
                      <ArrowUpRight size={16} strokeWidth={1.8} />
                    </div>
                  </div>
                </button>
              </div>

              <div className="grid gap-5">
                <SmallCard
                  title="Everyday symptoms"
                  text="VedaAI helps patients make sense of common symptoms before confusion grows into delay."
                  onClick={() => setSelectedItem(featureDetails.everyday)}
                />

                <SmallCard
                  title="Ongoing conditions"
                  text="Recurring symptoms and long-term conditions become easier to organize and carry forward."
                  onClick={() => setSelectedItem(featureDetails.chronic)}
                />

                <SmallCard
                  title="Follow-up guidance"
                  text="Reports, prescriptions, and previous notes become easier to understand and act on."
                  onClick={() => setSelectedItem(featureDetails.followup)}
                />

                <div className="grid gap-4 bg-[#e7ddd1] px-5 py-6 sm:grid-cols-2 sm:px-6">
                  {[
                    {
                      key: "guided",
                      icon: FilePenLine,
                      title: "Guided Symptom Input",
                      text: "Step-by-step expression instead of pressure.",
                    },
                    {
                      key: "direction",
                      icon: Route,
                      title: "Clear Next Direction",
                      text: "A calmer path toward the right care step.",
                    },
                    {
                      key: "doctor",
                      icon: Stethoscope,
                      title: "Doctor-ready Context",
                      text: "Better summaries for better conversations.",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSelectedItem(featureDetails[item.key])}
                        className="text-left sm:col-span-1"
                      >
                        <div className="flex h-10 w-10 items-center justify-center bg-[rgba(123,95,73,0.1)] text-[#7b5f49]">
                          <Icon size={18} strokeWidth={1.9} />
                        </div>

                        <h5 className="mt-4 text-base font-semibold tracking-[-0.03em] text-[#1d1815]">
                          {item.title}
                        </h5>

                        <p className="mt-2 text-sm leading-6 text-[#675952]">
                          {item.text}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {selectedItem ? (
        <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      ) : null}
    </>
  );
}

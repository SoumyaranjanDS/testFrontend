import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  FileUp,
  MessageSquareText,
  Route,
  Stethoscope,
  ArrowUpRight,
} from "lucide-react";

const easeSmooth = [0.22, 1, 0.36, 1];

const steps = [
  {
    number: "01",
    title: "Share symptoms",
    description:
      "Start with a guided flow that makes it easier to describe symptoms clearly and without pressure.",
    icon: MessageSquareText,
    size: "lg:col-span-2 lg:row-span-1",
    bg: "from-[#e7f4ec] via-[#edf8f1] to-[#f6fcf8]",
    accent: "#3B8F72",
  },
  {
    number: "02",
    title: "Add reports",
    description:
      "Upload medical reports and notes to create better context.",
    icon: FileUp,
    size: "lg:col-span-1 lg:row-span-1",
    bg: "from-[#e3f1e8] via-[#eaf7ef] to-[#f5fbf7]",
    accent: "#5CA287",
  },
  {
    number: "03",
    title: "Get direction",
    description:
      "VedaAI organizes data to point you toward the next care step.",
    icon: Route,
    size: "lg:col-span-1 lg:row-span-1",
    bg: "from-[#e8f5ed] via-[#eef9f3] to-[#f8fcfa]",
    accent: "#4C967A",
  },
  {
    number: "04",
    title: "Continue care",
    description:
      "Get a structured summary for your next doctor conversation.",
    icon: Stethoscope,
    size: "lg:col-span-2 lg:row-span-1",
    bg: "from-[#e7f4ec] via-[#edf8f1] to-[#f6fcf8]",
    accent: "#3B8F72",
  },
];

export default function HowToUse() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 88%", "end 20%"],
  });

  const headingY = useSpring(
    useTransform(scrollYProgress, [0, 1], [42, -20]),
    { stiffness: 80, damping: 24, mass: 1 }
  );

  const headingOpacity = useSpring(
    useTransform(scrollYProgress, [0, 0.28], [0, 1]),
    { stiffness: 75, damping: 22, mass: 1 }
  );

  const bgY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -48]),
    { stiffness: 60, damping: 22, mass: 1.2 }
  );

  const pathProgress = useSpring(
    useTransform(scrollYProgress, [0.1, 0.6], [0, 1]),
    { stiffness: 70, damping: 20, mass: 1.1 }
  );

  const pathGlow = useSpring(
    useTransform(scrollYProgress, [0.1, 0.6], [0.15, 1]),
    { stiffness: 70, damping: 20, mass: 1.1 }
  );

  return (
    <section
      id="how-to-use"
      ref={sectionRef}
      className="relative overflow-hidden py-20 lg:py-32"
      style={{
        background:
          "radial-gradient(circle at 18% 18%, rgba(59,143,114,0.14), transparent 24%), radial-gradient(circle at 82% 22%, rgba(104,178,160,0.18), transparent 24%), radial-gradient(circle at 50% 85%, rgba(255,255,255,0.85), transparent 30%), linear-gradient(180deg, #eaf5ef 0%, #e2f1e8 34%, #edf7f1 68%, #f7fcf9 100%)",
      }}
    >
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#3B8F72_1px,transparent_1px),linear-gradient(to_bottom,#3B8F72_1px,transparent_1px)] [background-size:4rem_4rem]" />

        <div className="absolute left-[8%] top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(59,143,114,0.22),transparent_72%)] blur-3xl" />
        <div className="absolute right-[10%] top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(104,178,160,0.2),transparent_72%)] blur-3xl" />
        <div className="absolute left-1/2 bottom-8 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9),transparent_74%)] blur-3xl" />
      </motion.div>

      <div className="section-shell relative px-5 sm:px-10">
        <motion.header
          style={{ y: headingY, opacity: headingOpacity }}
          className="mb-16 max-w-2xl"
        >
          <div className="flex items-center gap-3 text-[#3B8F72]">
            <div className="h-px w-8 bg-current" />
            <span className="text-xs font-bold uppercase tracking-[0.3em]">
              Process
            </span>
          </div>

          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-[#17362B] sm:text-5xl">
            A healthcare journey
            <br />
            <span className="text-[#3B8F72]/60">reimagined.</span>
          </h2>
        </motion.header>

        <div className="relative">
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <svg
              viewBox="0 0 1200 640"
              className="h-full w-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="vedaPathStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(59,143,114,0.18)" />
                  <stop offset="50%" stopColor="rgba(59,143,114,0.7)" />
                  <stop offset="100%" stopColor="rgba(104,178,160,0.18)" />
                </linearGradient>
                <filter id="vedaGlow">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <motion.path
                d="M110 150 C 320 120, 390 220, 610 210 S 900 120, 1080 170"
                fill="none"
                stroke="url(#vedaPathStroke)"
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="url(#vedaGlow)"
                style={{ pathLength: pathProgress, opacity: pathGlow }}
              />
              <motion.path
                d="M150 420 C 330 390, 470 470, 650 445 S 910 360, 1060 430"
                fill="none"
                stroke="url(#vedaPathStroke)"
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="url(#vedaGlow)"
                style={{ pathLength: pathProgress, opacity: pathGlow }}
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            {steps.map((step, index) => (
              <StepCard
                key={step.number}
                step={step}
                index={index}
                progress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index, progress }) {
  const Icon = step.icon;

  const ranges = [
    [0.04, 0.28],
    [0.14, 0.4],
    [0.24, 0.5],
    [0.34, 0.62],
  ];

  const [start, end] = ranges[index];
  const mid = start + (end - start) * 0.58;

  const yOffset = [70, 98, 78, 106][index];
  const xOffset = [-34, 30, -26, 30][index];
  const rotateStart = [-2.8, 2.2, -2, 2][index];

  const xRaw = useTransform(progress, [start, end], [xOffset, 0]);
  const yRaw = useTransform(progress, [start, end], [yOffset, 0]);
  const scaleRaw = useTransform(progress, [start, mid, end], [0.9, 1.06, 0.99]);
  const opacityRaw = useTransform(progress, [start, end], [0, 1]);
  const rotateRaw = useTransform(progress, [start, end], [rotateStart, 0]);

  const x = useSpring(xRaw, { stiffness: 95, damping: 24, mass: 1 });
  const y = useSpring(yRaw, { stiffness: 95, damping: 24, mass: 1 });
  const scale = useSpring(scaleRaw, { stiffness: 85, damping: 20, mass: 1 });
  const opacity = useSpring(opacityRaw, { stiffness: 80, damping: 22, mass: 1 });
  const rotate = useSpring(rotateRaw, { stiffness: 85, damping: 20, mass: 1 });

  const driftY = useSpring(
    useTransform(progress, [0, 1], [0, index % 2 === 0 ? -10 : 10]),
    { stiffness: 55, damping: 20, mass: 1.2 }
  );

  return (
    <motion.article
      layout
      style={{ x, y, scale, opacity, rotate }}
      className={`group relative overflow-hidden rounded-[32px] border border-white/80 bg-white/55 p-8 shadow-[0_22px_56px_-24px_rgba(59,143,114,0.14)] backdrop-blur-xl transition-colors ${step.size} max-sm:p-6`}
    >
      <motion.div
        style={{ y: driftY }}
        className={`pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,var(--tw-gradient-stops))] ${step.bg} opacity-95`}
      />

      <div
        className="pointer-events-none absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full blur-3xl"
        style={{ background: `${step.accent}18` }}
      />

      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${step.accent}88, transparent)`,
        }}
      />

      <div
        className="pointer-events-none absolute inset-y-10 left-8 w-px"
        style={{
          background: `linear-gradient(180deg, transparent, ${step.accent}35, transparent)`,
        }}
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <Icon style={{ color: step.accent }} size={24} />
          </div>

          <span
            className="select-none text-4xl font-black italic"
            style={{ color: `${step.accent}14` }}
          >
            {step.number}
          </span>
        </div>

        <div className="mt-12">
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: `${step.accent}12`,
              color: step.accent,
              border: `1px solid ${step.accent}1f`,
            }}
          >
            <div
              className="h-1 w-1 rounded-full animate-pulse"
              style={{ background: step.accent }}
            />
            Step {step.number}
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-[#17362B]">
            {step.title}
          </h3>

          <p className="mt-3 max-w-[280px] text-base leading-relaxed text-[#5E756B] sm:max-w-none">
            {step.description}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-black/5 pt-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7C8F86]">
            VedaAI Flow
          </span>

          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-white"
            style={{ background: step.accent }}
          >
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

import { useMemo, useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { Quote, ShieldCheck } from "lucide-react";

const easeSmooth = [0.22, 1, 0.36, 1];

const testimonials = [
  {
    id: "t1",
    name: "Riya Sen",
    role: "Early user",
    quote:
      "The guided flow feels much less intimidating than trying to explain everything from scratch.",
    avatar: "/Timg1.png",
    initials: "RS",
    tag: "Clarity",
    accentColor: "#2F78D9",
    bgAccent: "rgba(47,120,217,0.08)",
  },
  {
    id: "t2",
    name: "Arjun Patel",
    role: "Pilot feedback",
    quote:
      "This feels safer for people who hesitate to talk openly about sensitive symptoms.",
    avatar: "/Timg2.png",
    initials: "AP",
    tag: "Privacy",
    accentColor: "#68B2A0",
    bgAccent: "rgba(104,178,160,0.08)",
  },
  {
    id: "t3",
    name: "Meera Das",
    role: "Prototype review",
    quote:
      "The summary makes the next doctor conversation feel far more prepared.",
    avatar: "/Timg3.png",
    initials: "MD",
    tag: "Prepared",
    accentColor: "#5B9FFF",
    bgAccent: "rgba(91,159,255,0.08)",
  },
  {
    id: "t4",
    name: "Kabir Roy",
    role: "Mentor reaction",
    quote:
      "It reduces hesitation before care even begins, and that is what makes it different.",
    avatar: "/Timg4.png",
    initials: "KR",
    tag: "Trust",
    accentColor: "#2F78D9",
    bgAccent: "rgba(47,120,217,0.08)",
  },
  {
    id: "t5",
    name: "Sneha Paul",
    role: "Demo feedback",
    quote:
      "A private-first experience can completely change how honestly patients respond.",
    avatar: "/Timg1.png",
    initials: "SP",
    tag: "Comfort",
    accentColor: "#68B2A0",
    bgAccent: "rgba(104,178,160,0.08)",
  },
  {
    id: "t6",
    name: "Rahul Nair",
    role: "Usability note",
    quote:
      "The product feels calm and structured instead of overwhelming or clinical.",
    avatar: "/Timg2.png",
    initials: "RN",
    tag: "Calm",
    accentColor: "#5B9FFF",
    bgAccent: "rgba(91,159,255,0.08)",
  },
];

const tagIcons = {
  Clarity: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  Privacy: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Prepared: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  Trust: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  Comfort: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  ),
  Calm: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
};

function Avatar({ avatar, initials, name, accentColor }) {
  return (
    <div
      className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full"
      style={{
        background: `linear-gradient(135deg, ${accentColor}22, #ffffff)`,
        border: `1.5px solid ${accentColor}22`,
        boxShadow: `0 4px 12px ${accentColor}14`,
      }}
    >
      <img
        src={avatar}
        alt={name}
        className="h-full w-full rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fb = e.currentTarget.nextElementSibling;
          if (fb) fb.style.display = "flex";
        }}
      />
      <div
        className="hidden h-full w-full items-center justify-center rounded-full text-[10px] font-bold tracking-wide"
        style={{ color: accentColor }}
      >
        {initials}
      </div>
    </div>
  );
}

function TestimonialCard({ item }) {
  return (
    <motion.article
      whileHover={{
        y: -6,
        boxShadow: `0 28px 72px -20px ${item.accentColor}1f, 0 10px 24px -10px rgba(20,40,60,0.08)`,
      }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.3, ease: easeSmooth }}
      className="testimonial-card relative overflow-hidden"
      style={{
        width: 300,
        minHeight: 220,
        flexShrink: 0,
        borderRadius: 28,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.84) 0%, rgba(255,255,255,0.58) 100%)",
        border: "1px solid rgba(255,255,255,0.88)",
        boxShadow: "0 10px 30px -16px rgba(47,120,217,0.12), 0 2px 8px rgba(20,40,60,0.04)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        cursor: "default",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 24,
          right: 24,
          height: 2,
          borderRadius: "0 0 4px 4px",
          background: `linear-gradient(90deg, ${item.accentColor}, ${item.accentColor}33)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at top right, ${item.bgAccent}, transparent 62%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.14), transparent 28%)",
          pointerEvents: "none",
        }}
      />

      <div className="relative flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{
              background: `${item.accentColor}10`,
              color: item.accentColor,
              border: `1px solid ${item.accentColor}22`,
            }}
          >
            {tagIcons[item.tag]}
            {item.tag}
          </span>

          <div
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              background: `${item.accentColor}10`,
              color: item.accentColor,
            }}
          >
            <Quote size={13} strokeWidth={2} />
          </div>
        </div>

        <p
          style={{
            fontSize: 15,
            fontWeight: 500,
            lineHeight: 1.75,
            color: "#445864",
            letterSpacing: "-0.01em",
            flex: 1,
          }}
        >
          "{item.quote}"
        </p>

        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, ${item.accentColor}18, transparent)`,
            margin: "16px 0 14px",
          }}
        />

        <div className="flex items-center gap-2.5">
          <Avatar
            avatar={item.avatar}
            initials={item.initials}
            name={item.name}
            accentColor={item.accentColor}
          />
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#1B2A33",
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
              }}
            >
              {item.name}
            </p>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#7A8A95",
                marginTop: 2,
              }}
            >
              {item.role}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function Testimonials() {
  const sectionRef = useRef(null);

  const topRow = useMemo(() => [...testimonials, ...testimonials], []);
  const bottomRow = useMemo(
    () => [...testimonials.slice().reverse(), ...testimonials.slice().reverse()],
    []
  );

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 88%", "end 20%"],
  });

  const introOpacity = useSpring(
    useTransform(scrollYProgress, [0, 0.22], [0, 1]),
    { stiffness: 90, damping: 22, mass: 0.9 }
  );
  const introY = useSpring(
    useTransform(scrollYProgress, [0, 0.22], [40, 0]),
    { stiffness: 100, damping: 22, mass: 0.9 }
  );
  const wallOpacity = useSpring(
    useTransform(scrollYProgress, [0.08, 0.32], [0, 1]),
    { stiffness: 90, damping: 22, mass: 0.9 }
  );
  const wallY = useSpring(
    useTransform(scrollYProgress, [0.08, 0.32], [56, 0]),
    { stiffness: 90, damping: 22, mass: 0.95 }
  );
  const topParallax = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -24]),
    { stiffness: 80, damping: 24, mass: 1 }
  );
  const bottomParallax = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 24]),
    { stiffness: 80, damping: 24, mass: 1 }
  );

  return (
    <>
      <style>{`
        .testimonials-track-wrap {
          overflow: hidden;
          width: 100%;
        }

        .testimonial-track {
          display: flex;
          gap: 16px;
          width: max-content;
        }

        .track-scroll-right {
          animation: scrollRight 48s linear infinite;
        }

        .track-scroll-left {
          animation: scrollLeft 44s linear infinite;
        }

        .track-scroll-right:hover,
        .track-scroll-left:hover {
          animation-play-state: paused;
        }

        @keyframes scrollRight {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes scrollLeft {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }

        .fade-edges {
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
        }

        .grain-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.022;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          z-index: 0;
        }

        .section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #2F78D9;
        }

        .heading-display {
          font-weight: 600;
          color: #17363D;
          letter-spacing: -0.06em;
          line-height: 1.02;
        }

        .body-text {
          font-weight: 400;
          color: #667D86;
          line-height: 1.78;
          letter-spacing: -0.01em;
        }

        @media (max-width: 767px) {
          .testimonial-card {
            width: 220px !important;
            min-height: 190px !important;
            padding: 18px !important;
            border-radius: 22px !important;
          }

          .testimonial-track {
            gap: 12px;
          }
        }
      `}</style>

      <section
        id="reviews"
        ref={sectionRef}
        className="grain-overlay relative overflow-hidden py-24 sm:py-28 lg:py-32"
        style={{
          background:
            "linear-gradient(180deg, #F8FCFF 0%, #EEF6FF 42%, #F7FBFF 100%)",
          minHeight: "100vh",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: "absolute",
              top: "-4%",
              left: "10%",
              width: 460,
              height: 460,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(91,159,255,0.14), transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "4%",
              right: "8%",
              width: 380,
              height: 380,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(104,178,160,0.12), transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "34%",
              right: "26%",
              width: 280,
              height: 280,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(47,120,217,0.06), transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <motion.div
            style={{ opacity: introOpacity, y: introY }}
            className="mb-16 lg:mb-20"
          >
            <div className="mb-8 flex items-center gap-4">
              <div
                style={{
                  height: 1,
                  width: 40,
                  background: "linear-gradient(90deg, #2F78D9, transparent)",
                }}
              />
              <span className="section-label">Testimonials</span>
            </div>

            <div className="grid items-end gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
              <div>
                <h2
                  className="heading-display"
                  style={{ fontSize: "clamp(2.4rem, 4.5vw, 4rem)" }}
                >
                  Real trust starts
                  <br />
                  before the consultation.
                </h2>
              </div>

              <div className="lg:pb-2">
                <p
                  className="body-text"
                  style={{ fontSize: "clamp(14px, 1.1vw, 16px)", maxWidth: 460 }}
                >
                  What stands out most is not only the guidance, but how the
                  experience feels calmer, safer, and easier to trust from the very first step.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  {[
                    { label: "Users interviewed", value: "40+" },
                    { label: "Avg. satisfaction", value: "4.8/5" },
                    { label: "Pilot rounds", value: "3" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "rgba(255,255,255,0.72)",
                        border: "1px solid rgba(255,255,255,0.86)",
                        borderRadius: 100,
                        padding: "6px 14px 6px 10px",
                        boxShadow: "0 6px 18px -12px rgba(47,120,217,0.18)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: "#2F78D9",
                          letterSpacing: "-0.03em",
                          lineHeight: 1,
                        }}
                      >
                        {s.value}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "#7A8A95",
                          letterSpacing: "0.01em",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 40,
                height: 1,
                background:
                  "linear-gradient(90deg, rgba(47,120,217,0.08) 0%, rgba(47,120,217,0.02) 60%, transparent 100%)",
              }}
            />
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: wallOpacity, y: wallY }}
          className="relative"
        >
          <motion.div style={{ y: topParallax }} className="testimonials-track-wrap fade-edges">
            <div className="testimonial-track track-scroll-right py-2">
              {topRow.map((item, index) => (
                <TestimonialCard key={`${item.id}-top-${index}`} item={item} />
              ))}
            </div>
          </motion.div>

          <motion.div
            style={{ y: bottomParallax }}
            className="testimonials-track-wrap fade-edges mt-4"
          >
            <div className="testimonial-track track-scroll-left py-2">
              {bottomRow.map((item, index) => (
                <TestimonialCard key={`${item.id}-bottom-${index}`} item={item} />
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ opacity: introOpacity }}
          className="relative mx-auto mt-16 max-w-7xl px-6 sm:px-10 lg:px-16"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "rgba(47,120,217,0.08)",
                border: "1px solid rgba(47,120,217,0.16)",
                borderRadius: 100,
                padding: "5px 12px",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2F78D9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#2F78D9",
                  letterSpacing: "0.01em",
                }}
              >
                All feedback is anonymised and shared with consent
              </span>
            </div>
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(247,251,255,0)_0%,rgba(18,32,40,0.18)_45%,rgba(7,18,24,0.9)_100%)]" />
      </section>
    </>
  );
}

import { motion, useScroll, useTransform } from "framer-motion";
import { Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { useRef } from "react";

const footerLinks = {
  Product: ["How it works", "Features", "Privacy-first flow", "Doctor summary"],
  Resources: ["Documentation", "Project deck", "Roadmap", "FAQ"],
  Company: ["About", "Contact", "Team", "Vision"],
  Legal: ["Privacy Policy", "Terms of Service", "Disclaimer"],
};

export default function Footer() {
  const footerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [28, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [0.4, 1]);

  return (
    <footer
      id="footer"
      ref={footerRef}
      className="relative overflow-hidden bg-[linear-gradient(180deg,#071218_0%,#040a0e_38%,#020608_100%)] text-white"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(91,159,255,0.12),transparent_72%)] blur-3xl" />
        <div className="absolute right-[10%] bottom-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(104,178,160,0.1),transparent_72%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:58px_58px]" />
      </div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16"
      >
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1.95fr]">
          <div>
            <p className="text-base font-semibold tracking-[-0.03em] text-white sm:text-lg">
              VedaAI
            </p>

            <div className="mt-5 space-y-3 text-xs text-white/58 sm:text-sm">
              <div className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 text-[#8bc2ff]" />
                <span>India-first healthcare support experience</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={15} className="text-[#8bc2ff]" />
                <span>team@vedaai.health</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={15} className="text-[#8bc2ff]" />
                <span>Hackathon prototype</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/72 transition hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
              >
                <Instagram size={15} />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/72 transition hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
              >
                <Linkedin size={15} />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/72 transition hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
              >
                <Mail size={15} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-[11px] font-semibold text-white sm:text-sm">
                  {title}
                </h3>

                <div className="mt-4 space-y-3">
                  {links.map((link, index) => (
                    <a
                      key={link}
                      href="#"
                      className={`block text-[10px] text-white/56 transition hover:text-white sm:text-sm ${
                        index > 1 ? "hidden sm:block" : ""
                      }`}
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/8 pt-6 text-xs text-white/42 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <p>© 2026 VedaAI. Built for clearer first healthcare conversations.</p>
          <p>Private-first. Guided. Human-centered.</p>
        </div>
      </motion.div>
    </footer>
  );
}

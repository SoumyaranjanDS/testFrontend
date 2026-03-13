import { motion } from "framer-motion";

export default function About() {
  return (
    <motion.section
      id="about"
      className="relative min-h-[100svh] overflow-hidden"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover object-center"
      >
        {/* Put your video inside your public folder and replace the path below.
            Example: /about-video.mp4 or /videos/about-video.mp4 */}
        <source src="/About-video.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,18,34,0.28)_0%,rgba(7,24,42,0.18)_26%,rgba(6,24,46,0.52)_100%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(120,186,255,0.14),transparent_24%),radial-gradient(circle_at_bottom,rgba(4,22,42,0.44),transparent_42%)]" />

      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,transparent,black_16%,black_84%,transparent)]" />

      <div className="section-shell relative flex min-h-[100svh] flex-col justify-between px-2 py-14 sm:px-4 sm:py-18 lg:px-0 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <div className="text-xs font-medium text-white/70 sm:text-sm">
              Home / About Us
            </div>

            <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
              About Us
            </h2>
          </div>

          <div className="lg:pt-16">
            <p className="max-w-md text-sm leading-7 text-white/78 sm:text-base">
              VedaAI is built to make the first step into healthcare feel more
              understandable, guided, and less overwhelming for every patient.
            </p>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/72 sm:text-base">
              We bring symptom understanding, health record clarity, and smarter
              care direction into one simple experience so people can move
              toward the right support with more confidence and less delay.
            </p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <h3 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">
              We believe that healthcare guidance should feel simple, human, and clear.
            </h3>
          </div>

          <div className="lg:justify-self-end">
            <div className="max-w-md text-sm leading-7 text-white/70 sm:text-base">
              VedaAI helps reduce confusion before treatment begins by giving
              people a clearer sense of what they are feeling, what matters in
              their records, and what step should come next.
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

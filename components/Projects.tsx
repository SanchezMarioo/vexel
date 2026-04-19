"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import DoubleBezel from "@/components/ui/DoubleBezel";
import EyebrowTag from "@/components/ui/EyebrowTag";

const projects = [
  {
    id: "01",
    name: "Luna Studio",
    category: "Beauty & Wellness",
    year: "2026",
    image:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "02",
    name: "Brava Dental",
    category: "Clinica Local",
    year: "2026",
    image:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "03",
    name: "Astra Atelier",
    category: "Creative Services",
    year: "2025",
    image:
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "04",
    name: "Hotel Nube",
    category: "Hospitality",
    year: "2025",
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const desktopTrackRef = useRef<HTMLDivElement>(null);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let mounted = true;
    let cleanup = () => {};

    const init = async () => {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");

      if (!mounted) {
        return;
      }

      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);
      (window as Window & { ScrollTrigger?: typeof ScrollTrigger }).ScrollTrigger =
        ScrollTrigger;

      const section = sectionRef.current;
      const desktopTrack = desktopTrackRef.current;
      const mobileTrack = mobileTrackRef.current;
      const counter = counterRef.current;

      if (!section || !desktopTrack || !mobileTrack || !counter) {
        return;
      }

      const total = projects.length;
      const format = (value: number) => String(value).padStart(2, "0");
      const setCounter = (current: number) => {
        counter.textContent = `${format(current)} / ${format(total)}`;
      };

      setCounter(1);

      let cleanupMatchMedia = () => {};

      const context = gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
          setCounter(1);

          const getDistance = () => {
            const viewport = desktopTrack.parentElement?.clientWidth ?? window.innerWidth;
            return Math.max(desktopTrack.scrollWidth - viewport, 0);
          };

          const updateCounterFromX = () => {
            const distance = getDistance();
            const currentX = Math.abs(Number(gsap.getProperty(desktopTrack, "x")));
            const progress = distance <= 1 ? 0 : Math.min(1, currentX / distance);

            const current = Math.min(
              total,
              Math.max(1, Math.round(progress * (total - 1)) + 1)
            );

            setCounter(current);
          };

          const tween = gsap.to(desktopTrack, {
            x: () => `${-getDistance()}px`,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              scrub: true,
              start: "top top",
              end: () => `+=${Math.max(getDistance(), 1)}`,
              invalidateOnRefresh: true,
              fastScrollEnd: true,
              onUpdate: updateCounterFromX,
              onRefresh: updateCounterFromX,
            },
          });

          updateCounterFromX();

          return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
            gsap.set(desktopTrack, { clearProps: "transform" });
          };
        });

        mm.add("(max-width: 767px)", () => {
          setCounter(1);

          const cards = Array.from(
            mobileTrack.querySelectorAll<HTMLElement>("[data-project-card='true']")
          );

          let frame = 0;

          const syncMobileCounter = () => {
            if (!cards.length) {
              return;
            }

            const containerCenter = mobileTrack.scrollLeft + mobileTrack.clientWidth / 2;

            let active = 1;
            let minDistance = Number.POSITIVE_INFINITY;

            cards.forEach((card, index) => {
              const center = card.offsetLeft + card.offsetWidth / 2;
              const distance = Math.abs(center - containerCenter);

              if (distance < minDistance) {
                minDistance = distance;
                active = index + 1;
              }
            });

            setCounter(active);
          };

          const onMobileScroll = () => {
            if (frame) {
              return;
            }

            frame = window.requestAnimationFrame(() => {
              syncMobileCounter();
              frame = 0;
            });
          };

          syncMobileCounter();
          mobileTrack.addEventListener("scroll", onMobileScroll, { passive: true });
          window.addEventListener("resize", syncMobileCounter);

          return () => {
            if (frame) {
              window.cancelAnimationFrame(frame);
            }
            mobileTrack.removeEventListener("scroll", onMobileScroll);
            window.removeEventListener("resize", syncMobileCounter);
          };
        });

        cleanupMatchMedia = () => mm.revert();
      }, section);

      ScrollTrigger.refresh();

      cleanup = () => {
        cleanupMatchMedia();
        context.revert();
      };
    };

    init();

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="projects-section relative z-10 bg-[#050505]"
    >
      <div className="relative h-[100svh] overflow-hidden md:h-screen">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(123,97,255,0.1)_0%,transparent_72%)]" />

        <div className="absolute inset-x-0 top-24 z-20 bg-[linear-gradient(to_bottom,rgba(5,5,5,0.95),rgba(5,5,5,0.72),transparent)] px-4 pb-5 pt-2 backdrop-blur-xl md:px-[10vw]">
          <div className="mx-auto flex w-full max-w-[1600px] items-end justify-between">
            <div>
              <EyebrowTag className="border border-white/14 bg-white/8 text-white/80">
                Proyectos seleccionados
              </EyebrowTag>
              <h2 className="mt-4 font-display text-4xl font-semibold text-white md:text-5xl">
                Trabajo que convierte.
              </h2>
            </div>
            <span ref={counterRef} className="font-display text-lg text-white/60 md:text-xl">
              01 / 04
            </span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-8 md:bottom-12">
          <div className="mx-auto w-full max-w-[1600px]">
            <div className="hidden md:block overflow-hidden">
              <div
                ref={desktopTrackRef}
                className="projects-track flex gap-6 px-[10vw] will-change-transform"
              >
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>

            <div className="md:hidden">
              <div
                ref={mobileTrackRef}
                data-lenis-prevent
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4"
              >
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} mobile />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  mobile = false,
}: {
  project: (typeof projects)[number];
  mobile?: boolean;
}) {
  return (
    <article
      data-project-card="true"
      className={`project-card group shrink-0 snap-start ${
        mobile ? "h-[68vh] w-[85vw]" : "h-[34rem] w-[28rem]"
      }`}
    >
      <DoubleBezel className="h-full w-full">
        <div className="h-full overflow-hidden rounded-3xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.02]">
          <div className="relative h-[60%] overflow-hidden">
            <Image
              src={project.image}
              alt={project.name}
              fill
              sizes={mobile ? "85vw" : "448px"}
              className="object-cover"
            />

            <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/80 opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100">
              {project.category}
            </span>
          </div>

          <div className="flex h-[40%] flex-col justify-between p-6">
            <div>
              <h3 className="font-display text-2xl font-medium text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-2">
                {project.name}
              </h3>
              <p className="mt-2 text-xs uppercase tracking-widest text-white/40">
                {project.category}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-white/50">Caso destacado</span>
              <span className="font-display text-sm text-white/70">{project.year}</span>
            </div>
          </div>
        </div>
      </DoubleBezel>
    </article>
  );
}

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
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let mounted = true;
    let cleanupMatchMedia = () => {};

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
      const track = trackRef.current;
      const counter = counterRef.current;

      if (!section || !track || !counter) {
        return;
      }

      const total = projects.length;
      counter.textContent = `01 / ${String(total).padStart(2, "0")}`;

      const updateCounter = (progress: number) => {
        const current = Math.min(
          total,
          Math.max(1, Math.round(progress * (total - 1)) + 1)
        );

        counter.textContent = `${String(current).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
      };

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const tween = gsap.to(track, {
          x: () => {
            const distance = Math.max(track.scrollWidth - window.innerWidth, 0);
            return `${-distance}px`;
          },
          ease: "none",
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${Math.max(track.scrollWidth - window.innerWidth, 0)}`,
            invalidateOnRefresh: true,
            onUpdate: (self) => updateCounter(self.progress),
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });

      cleanupMatchMedia = () => {
        mm.revert();
      };
    };

    init();

    return () => {
      mounted = false;
      cleanupMatchMedia();
    };
  }, []);

  return (
    <section id="projects" ref={sectionRef} className="projects-section vx-section relative">
      <div className="mx-auto w-full max-w-400">
        <div className="sticky top-28 z-20 mb-8 flex items-end justify-between px-[10vw]">
          <div>
            <EyebrowTag className="border border-white/10 bg-white/5 text-white/70">
              Proyectos seleccionados
            </EyebrowTag>
            <h2 className="mt-4 font-display text-5xl font-semibold text-white">
              Trabajo que convierte.
            </h2>
          </div>
          <span ref={counterRef} className="font-display text-xl text-white/60">
            01 / 04
          </span>
        </div>

        <div className="hidden md:block">
          <div ref={trackRef} className="projects-track flex gap-6 px-[10vw] pb-8 will-change-transform">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        <div className="md:hidden">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} mobile />
            ))}
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
      className={`project-card group shrink-0 snap-start ${
        mobile ? "h-135 w-[85vw]" : "h-140 w-105"
      }`}
    >
      <DoubleBezel className="h-full w-full">
        <div className="h-full overflow-hidden rounded-3xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.02]">
          <div className="relative h-[60%] overflow-hidden">
            <Image
              src={project.image}
              alt={project.name}
              fill
              sizes={mobile ? "85vw" : "420px"}
              className="object-cover"
            />
            <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              {project.category}
            </span>
          </div>

          <div className="flex h-[40%] flex-col justify-between p-6">
            <div>
              <h3 className="font-display text-xl font-medium text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-2">
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

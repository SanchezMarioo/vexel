"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Metric = {
  value: number;
  label: string;
  suffix: string;
  decimals?: number;
};

const metrics: Metric[] = [
  { value: 40, label: "Proyectos entregados", suffix: "+" },
  { value: 14, label: "Tiempo medio de entrega", suffix: " dias" },
  { value: 3.2, label: "Media de incremento en conversion", suffix: "x", decimals: 1 },
  { value: 100, label: "Clientes que repiten", suffix: "%" },
];

function useCountUp(active: boolean, value: number, decimals: number) {
  const [display, setDisplay] = useState(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!active || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    const duration = 1300;
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);

      if (progress < 1) {
        frame = window.requestAnimationFrame(step);
      }
    };

    frame = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [active, value]);

  return useMemo(() => {
    if (decimals > 0) {
      return display.toFixed(decimals);
    }

    return Math.round(display).toString();
  }, [decimals, display]);
}

export default function Metrics() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section id="stats" ref={sectionRef} className="vx-section px-4 md:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-2 gap-y-14 md:grid-cols-4 md:gap-y-0">
          {metrics.map((metric, index) => (
            <MetricCell
              key={metric.label}
              metric={metric}
              active={isVisible}
              withDivider={index > 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricCell({
  metric,
  active,
  withDivider,
}: {
  metric: Metric;
  active: boolean;
  withDivider: boolean;
}) {
  const value = useCountUp(active, metric.value, metric.decimals ?? 0);

  return (
    <div className={`text-center ${withDivider ? "md:border-l md:border-white/10" : ""}`}>
      <p className="font-display text-5xl font-semibold text-white">
        {value}
        {metric.suffix}
      </p>
      <p className="mt-3 px-4 text-sm uppercase tracking-widest text-white/40">
        {metric.label}
      </p>
    </div>
  );
}

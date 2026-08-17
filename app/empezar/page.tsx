import type { Metadata } from "next";
import Link from "next/link";
import Funnel from "@/components/funnel/Funnel";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import { identity } from "@/lib/portfolio/content";
import { siteUrl } from "@/lib/site-url";
import { getOgImageMetadata } from "@/lib/seo/getOgImage";

const title = "Cuéntanos tu proyecto";
const description =
  "Dos minutos para contarnos qué necesitas: una pregunta cada vez, sin compromiso. Al terminar, decides si reservamos una llamada.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/empezar" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: `${siteUrl}/empezar`,
    siteName: identity.name,
    title: `${title} | ${identity.name}`,
    description,
    images: [getOgImageMetadata(undefined, title)],
  },
};

export default function EmpezarPage() {
  return (
    <PortfolioShell>
      <div className="flex min-h-dvh flex-col">
        {/*
          DIRECTION CONTRACT — /empezar funnel (seed 60f4d22f)
          THESIS: a conversion funnel as a guided conversation, not a form: one
          question at a time, and the growing transcript of answers is the only
          progress signal. Refuses the multi-field grid and the SaaS progress bar.
          OWN-WORLD: inherited pf-* Swiss system — chroma-0 white/black, hairlines,
          Bricolage Grotesque questions, Geist Mono wayfinding, inverted black close.
          STORY: a convinced founder answers six or seven questions in under two
          minutes, feels heard (everything said stays visible and editable), and
          books a call on the inverted summary.
          FIRST VIEWPORT: white, narrow column, display-size opening line, one solid
          start action, direct-email escape hatch; nothing else.
          FORM: accumulated transcript — candidate 3 of 7 — seed 60f4d22f.
          FINISH: unreviewed and undocumented is unfinished; this build ends with
          the finish review, the verdict, and DESIGN.md.
        */}
        <header className="border-b border-pf-line">
          <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
            <Link href="/" className="pf-display text-lg leading-none text-pf-ink">
              {identity.name}
              <span className="text-pf-ink">.</span>
            </Link>
            <a
              href={`mailto:${identity.email}`}
              className="pf-mono text-xs text-pf-muted transition-colors duration-200 hover:text-pf-ink"
            >
              {identity.email}
            </a>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          aria-label="Cuéntanos tu proyecto"
          className="flex flex-1 flex-col outline-none"
        >
          <Funnel />
        </main>
      </div>
    </PortfolioShell>
  );
}

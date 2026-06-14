import { identity, navLinks } from "@/lib/portfolio/content";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-pf-ink text-pf-bg">
      <div className="pf-container py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="pf-display text-2xl">
              {identity.name}
              <span className="text-pf-violet">.</span>
            </p>
            <p className="mt-3 max-w-sm text-pf-bg/60">{identity.headline}</p>
            <a
              href={`mailto:${identity.email}`}
              className="mt-6 inline-block text-lg text-pf-bg underline-offset-4 hover:text-[oklch(0.8_0.12_290)] hover:underline"
            >
              {identity.email}
            </a>
          </div>

          <nav aria-label="Pie de página" className="md:col-span-3 md:col-start-7">
            <p className="pf-mono text-xs uppercase tracking-wide text-pf-bg/45">Navegación</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-pf-bg/75 transition-colors hover:text-pf-bg"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="pf-mono text-xs uppercase tracking-wide text-pf-bg/45">Sígueme</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {identity.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-pf-bg/75 transition-colors hover:text-pf-bg"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-pf-bg/15 pt-6 text-sm text-pf-bg/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {identity.name}. Todos los derechos reservados.
          </p>
          <p>{identity.availability}</p>
        </div>
      </div>
    </footer>
  );
}

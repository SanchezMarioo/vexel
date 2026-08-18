import Link from "next/link";
import { identity, isRealUrl, navLinks } from "@/lib/portfolio/content";

export default function Footer() {
  const year = new Date().getFullYear();
  const socials = identity.socials.filter((social) => isRealUrl(social.href));

  return (
    <footer className="pf-invert">
      <div className="pf-container py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="pf-display text-2xl">
              {identity.name}
              <span className="text-pf-inverse-ink">.</span>
            </p>
            <p className="mt-3 max-w-sm text-pf-inverse-ink/60">{identity.headline}</p>
            <a
              href={`mailto:${identity.email}`}
              className="mt-6 inline-block text-lg text-pf-inverse-ink underline-offset-4 hover:underline"
            >
              {identity.email}
            </a>
            <p className="mt-4 text-sm text-pf-inverse-ink/55">
              {identity.location} · España
            </p>
          </div>

          <nav aria-label="Pie de página" className="md:col-span-3 md:col-start-7">
            <p className="pf-mono text-xs uppercase tracking-wide text-pf-bg/70">Navegación</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    // Prefijamos "/" a las anclas para que el enlace lleve a la
                    // home + sección desde cualquier ruta (también en subpáginas).
                    href={link.href.startsWith("#") ? `/${link.href}` : link.href}
                    className="text-pf-bg/80 transition-colors hover:text-pf-bg"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {socials.length > 0 ? (
            <div className="md:col-span-3">
              <p className="pf-mono text-xs uppercase tracking-wide text-pf-bg/70">Sígueme</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-pf-bg/80 transition-colors hover:text-pf-bg"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-pf-bg/15 pt-6 text-sm text-pf-bg/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {identity.name}. Todos los derechos reservados.
          </p>
          <nav aria-label="Enlaces legales" className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/aviso-legal" className="transition-colors hover:text-pf-bg">
              Aviso legal
            </Link>
            <Link href="/privacidad" className="transition-colors hover:text-pf-bg">
              Privacidad
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-pf-bg">
              Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

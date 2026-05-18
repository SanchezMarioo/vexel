"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const accountNavItems = [
  { href: "/cuenta", label: "Resumen" },
  { href: "/cuenta/solicitudes", label: "Solicitudes" },
  { href: "/cuenta/proyectos", label: "Proyectos" },
  { href: "/cuenta/perfil", label: "Perfil" },
];

export default function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegacion del area personal" className="space-y-2">
      {accountNavItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/cuenta" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-2xl border px-4 py-3 text-sm transition ${
              isActive
                ? "border-[#8f7aff] bg-[#7B61FF]/20 text-white"
                : "border-white/12 bg-white/2 text-white/75 hover:border-white/25 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
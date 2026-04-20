"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

interface LogoutButtonProps {
  callbackUrl?: string;
}

export default function LogoutButton({ callbackUrl = "/" }: LogoutButtonProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);
    await signOut({ callbackUrl });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:border-white/35 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Saliendo..." : "Salir"}
    </button>
  );
}
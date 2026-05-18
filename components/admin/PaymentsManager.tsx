"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import type { AppPayment } from "@/lib/data/payments";

interface PaymentsManagerProps {
  projectId: string;
  payments: AppPayment[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(value + "T00:00:00"));
}

export default function PaymentsManager({ projectId, payments: initialPayments }: PaymentsManagerProps) {
  const router = useRouter();
  const [payments, setPayments] = useState<AppPayment[]>(initialPayments);
  const [isAdding, setIsAdding] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleMarkPaid(paymentId: string) {
    setLoadingId(paymentId);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/projects/${projectId}/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message ?? "No se pudo actualizar el pago.");
        return;
      }

      setPayments((prev) => prev.map((p) => (p.id === paymentId ? data.payment : p)));
      router.refresh();
    } catch {
      setErrorMessage("Error de conexion.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(paymentId: string) {
    setLoadingId(paymentId);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/projects/${projectId}/payments/${paymentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.message ?? "No se pudo eliminar el pago.");
        return;
      }

      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      router.refresh();
    } catch {
      setErrorMessage("Error de conexion.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleAddPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAdding(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      description: String(formData.get("description") ?? "").trim(),
      amount: parseFloat(String(formData.get("amount") ?? "0")),
      dueDate: String(formData.get("dueDate") ?? "").trim() || null,
    };

    try {
      const res = await fetch(`/api/admin/projects/${projectId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message ?? "No se pudo crear el pago.");
        setIsAdding(false);
        return;
      }

      setPayments((prev) => [...prev, data.payment]);
      event.currentTarget.reset();
      router.refresh();
    } catch {
      setErrorMessage("Error de conexion.");
    } finally {
      setIsAdding(false);
    }
  }

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const paid = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const pending = total - paid;

  return (
    <section className="space-y-4 rounded-2xl border border-white/12 bg-black/25 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl text-white">Plan de pagos</h3>
        {payments.length > 0 && (
          <div className="flex gap-4 text-xs text-white/55">
            <span>Total: <span className="text-white">{formatCurrency(total)}</span></span>
            <span>Cobrado: <span className="text-emerald-300">{formatCurrency(paid)}</span></span>
            <span>Pendiente: <span className="text-yellow-200">{formatCurrency(pending)}</span></span>
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100" role="alert">
          {errorMessage}
        </p>
      )}

      {payments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-white/50">
          No hay pagos definidos todavia.
        </p>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate text-sm font-medium text-white">{payment.description}</p>
                <p className="text-xs text-white/50">
                  {formatCurrency(payment.amount)}
                  {payment.dueDate && ` · Vence el ${formatDate(payment.dueDate)}`}
                  {payment.paidAt && ` · Pagado el ${formatDate(payment.paidAt.slice(0, 10))}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    payment.status === "paid"
                      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                      : "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
                  }`}
                >
                  {payment.status === "paid" ? "Pagado" : "Pendiente"}
                </span>

                {payment.status === "pending" && (
                  <button
                    type="button"
                    disabled={loadingId === payment.id}
                    onClick={() => handleMarkPaid(payment.id)}
                    className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200 transition hover:bg-emerald-500/25 disabled:opacity-50"
                  >
                    Marcar pagado
                  </button>
                )}

                <button
                  type="button"
                  disabled={loadingId === payment.id}
                  onClick={() => handleDelete(payment.id)}
                  className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAddPayment} className="space-y-3 border-t border-white/10 pt-4">
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">Nuevo pago</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block space-y-1.5">
            <span className="text-xs text-white/65">Descripcion</span>
            <input
              type="text"
              name="description"
              required
              maxLength={200}
              placeholder="Ej: Primer pago — 50%"
              className="w-full rounded-2xl border border-white/20 bg-black/45 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs text-white/65">Importe (€)</span>
            <input
              type="number"
              name="amount"
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-2xl border border-white/20 bg-black/45 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs text-white/65">
              Fecha limite <span className="text-white/35">(opcional)</span>
            </span>
            <input
              type="date"
              name="dueDate"
              className="w-full rounded-2xl border border-white/20 bg-black/45 px-3 py-2.5 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isAdding}
          className="rounded-2xl border border-white/20 bg-white/5 px-5 py-2 text-sm font-medium text-white transition hover:border-white/35 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAdding ? "Añadiendo..." : "+ Añadir pago"}
        </button>
      </form>
    </section>
  );
}

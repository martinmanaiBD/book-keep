import Link from "next/link";

import { PaymentForm } from "@/app/payment-form";
import {
  DEFAULT_PAYMENT_AMOUNT,
  getCurrentPaymentDate,
  formatMonthLabel,
  getCurrentPaymentMonth,
} from "@/lib/payments";

export const dynamic = "force-dynamic";

export default function Home() {
  const currentMonth = getCurrentPaymentMonth();
  const currentDate = getCurrentPaymentDate();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10 sm:px-10 lg:py-16">
      <section className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Book-Keep
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-6xl">
              Track family payments.
            </h1>
          </div>
        </div>

        <aside className="rounded-[2rem] bg-emerald-950 p-6 text-white shadow-2xl shadow-emerald-950/10">
          <p className="text-sm text-emerald-100">Current collection month</p>
          <p className="mt-3 text-4xl font-semibold">
            {formatMonthLabel(currentMonth)}
          </p>
          <Link
            href={`/status?month=${currentMonth}`}
            className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-white/30"
          >
            View monthly status
          </Link>
        </aside>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 space-y-2">
          <h2 className="text-2xl font-semibold text-stone-950">
            Record a payment
          </h2>
        </div>
        <PaymentForm currentDate={currentDate} />
      </section>
    </main>
  );
}

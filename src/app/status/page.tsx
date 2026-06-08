import Link from "next/link";
import { cookies } from "next/headers";

import { logoutFromStatus } from "@/app/actions";
import { StatusLoginForm } from "@/app/status/login-form";
import {
  DEFAULT_PAYMENT_AMOUNT,
  formatCurrency,
  formatDateLabel,
  formatMonthLabel,
  getCurrentPaymentMonth,
  getPaymentMonthOptions,
  normalizePaymentMonth,
} from "@/lib/payments";
import { getPaymentsForMonth } from "@/lib/payment-store";
import {
  STATUS_AUTH_COOKIE,
  getStatusAuthConfigError,
  isValidStatusSession,
} from "@/lib/status-auth";

export const dynamic = "force-dynamic";

type StatusPageProps = {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
};

export default async function StatusPage({ searchParams }: StatusPageProps) {
  const cookieStore = await cookies();
  const isAuthenticated = isValidStatusSession(
    cookieStore.get(STATUS_AUTH_COOKIE)?.value,
  );

  if (!isAuthenticated) {
    return <StatusLoginPage configError={getStatusAuthConfigError()} />;
  }

  const params = await searchParams;
  const monthOptions = getPaymentMonthOptions();
  const selectedMonth = getSelectedMonth(params, monthOptions);
  const selectedYear = selectedMonth.slice(0, 4);
  const selectedMonthNumber = selectedMonth.slice(5, 7);
  const yearOptions = Array.from(
    new Set(monthOptions.map((month) => month.slice(0, 4))),
  );
  const monthsForSelectedYear = monthOptions.filter((month) =>
    month.startsWith(`${selectedYear}-`),
  );
  const result = await getPaymentsForMonth(selectedMonth);

  const status = result.ok ? result.data.status : [];
  const paid = status.filter((entry) => entry.record);
  const unpaid = status.filter((entry) => !entry.record);
  const collected = paid.reduce(
    (total, entry) => total + (entry.record?.amount ?? 0),
    0,
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10 sm:px-10 lg:py-16">
      <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex text-sm font-semibold text-emerald-700 transition hover:text-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            >
              Back to payment form
            </Link>
            <form action={logoutFromStatus}>
              <button
                type="submit"
                className="rounded-full border border-stone-200 bg-white px-3 py-1 text-sm font-semibold text-stone-600 transition hover:border-stone-300 hover:text-stone-950 focus:outline-none focus:ring-4 focus:ring-stone-100"
              >
                Log out
              </button>
            </form>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Monthly Status
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 sm:text-6xl">
              {formatMonthLabel(selectedMonth)}
            </h1>
          </div>
        </div>

        <form className="rounded-[2rem] border border-stone-200 bg-white/90 p-3 shadow-xl shadow-stone-950/5 backdrop-blur">
          <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
            <label className="space-y-2">
              <span className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Month
              </span>
              <select
                name="month"
                defaultValue={selectedMonthNumber}
                className="h-14 w-full rounded-3xl border border-stone-200 bg-stone-50 px-5 text-lg font-semibold text-stone-950 outline-none transition hover:bg-white focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              >
                {monthsForSelectedYear.map((month) => (
                  <option key={month} value={month.slice(5, 7)}>
                    {formatMonthName(month)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Year
              </span>
              <select
                name="year"
                defaultValue={selectedYear}
                className="h-14 w-full rounded-3xl border border-stone-200 bg-stone-50 px-5 text-lg font-semibold text-stone-950 outline-none transition hover:bg-white focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="h-14 rounded-full bg-stone-950 px-8 text-base font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-stone-200"
            >
              View
            </button>
          </div>
          <p className="px-2 pt-3 text-sm text-stone-500">
            Showing {formatMonthLabel(selectedMonth)}
          </p>
        </form>
      </section>

      {!result.ok ? (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-xl font-semibold">Supabase setup needed</h2>
          <p className="mt-2 text-sm leading-6">{result.message}</p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <SummaryStat label="Paid" value={`${paid.length}/${status.length}`} />
            <SummaryStat label="Not paid" value={`${unpaid.length}`} />
            <SummaryStat label="Collected" value={formatCurrency(collected)} />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <StatusPanel
              title="Paid"
              emptyText="No one has paid for this month yet."
              hasItems={paid.length > 0}
              tone="paid"
            >
              {paid.map((entry) => (
                <li
                  key={entry.payerName}
                  className="flex items-start justify-between gap-4 rounded-3xl bg-emerald-50 p-4"
                >
                  <div>
                    <p className="font-semibold text-emerald-950">
                      {entry.payerName}
                    </p>
                    <p className="mt-1 text-sm text-emerald-800">
                      Paid on {formatDateLabel(entry.record!.payment_date)}
                    </p>
                    {entry.record?.remarks ? (
                      <p className="mt-1 text-sm text-emerald-800">
                        {entry.record.remarks}
                      </p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-emerald-800">
                    {formatCurrency(entry.record?.amount ?? 0)}
                  </span>
                </li>
              ))}
            </StatusPanel>

            <StatusPanel
              title="Not paid"
              emptyText="Everyone is paid up for this month."
              hasItems={unpaid.length > 0}
              tone="unpaid"
            >
              {unpaid.map((entry) => (
                <li
                  key={entry.payerName}
                  className="flex items-center justify-between rounded-3xl bg-stone-100 p-4"
                >
                  <span className="font-semibold text-stone-950">
                    {entry.payerName}
                  </span>
                  <span className="text-sm font-medium text-stone-500">
                    Waiting for {formatCurrency(DEFAULT_PAYMENT_AMOUNT)}
                  </span>
                </li>
              ))}
            </StatusPanel>
          </section>
        </>
      )}
    </main>
  );
}

function StatusLoginPage({ configError }: { configError: string | null }) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:py-16">
      <div className="grid w-full gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
        <section className="max-w-2xl space-y-5">
          <Link
            href="/"
            className="inline-flex text-sm font-semibold text-emerald-700 transition hover:text-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          >
            Back to payment form
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Book-Keep
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-6xl">
            Monthly status is private.
          </h1>
          <p className="text-lg leading-8 text-stone-600">
            The payment form can stay simple, but the collection dashboard now
            needs the shared family username and password.
          </p>
          {configError ? (
            <p className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900">
              {configError} Add `STATUS_USERNAME`, `STATUS_PASSWORD`, and
              `STATUS_SESSION_SECRET` to your env file.
            </p>
          ) : null}
        </section>
        <StatusLoginForm />
      </div>
    </main>
  );
}

function getSelectedMonth(
  params: { month?: string; year?: string },
  monthOptions: string[],
) {
  const monthFromParts =
    params.year && params.month
      ? normalizePaymentMonth(`${params.year}-${params.month}-01`)
      : null;
  const monthFromLegacyParam = normalizePaymentMonth(params.month ?? "");
  const selectedMonth =
    monthFromParts ?? monthFromLegacyParam ?? getCurrentPaymentMonth();

  return monthOptions.includes(selectedMonth)
    ? selectedMonth
    : monthOptions.at(-1) ?? getCurrentPaymentMonth();
}

function formatMonthName(month: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${month}T00:00:00.000Z`));
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-stone-950">{value}</p>
    </article>
  );
}

function StatusPanel({
  title,
  emptyText,
  hasItems,
  tone,
  children,
}: {
  title: string;
  emptyText: string;
  hasItems: boolean;
  tone: "paid" | "unpaid";
  children: React.ReactNode;
}) {
  const borderClass =
    tone === "paid" ? "border-emerald-200" : "border-stone-200";

  return (
    <section
      className={`rounded-[2rem] border bg-white p-6 shadow-sm ${borderClass}`}
    >
      <h2 className="text-2xl font-semibold text-stone-950">{title}</h2>
      <ul className="mt-5 space-y-3">
        {hasItems ? children : <li className="text-stone-500">{emptyText}</li>}
      </ul>
    </section>
  );
}

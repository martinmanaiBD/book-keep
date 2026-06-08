"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { submitPayment, type PaymentActionState } from "@/app/actions";
import { DEFAULT_PAYMENT_AMOUNT, FIRST_PAYMENT_MONTH, PAYERS } from "@/lib/payments";

const initialState: PaymentActionState = {
  status: "idle",
  message: "",
};

type PaymentFormProps = {
  currentDate: string;
};

export function PaymentForm({ currentDate }: PaymentFormProps) {
  const [state, formAction] = useActionState(submitPayment, initialState);
  const initialDate = parseDateParts(currentDate);
  const [selectedYear, setSelectedYear] = useState(initialDate.year);
  const [selectedMonth, setSelectedMonth] = useState(initialDate.month);
  const [selectedDay, setSelectedDay] = useState(initialDate.day);

  const dateOptions = useMemo(
    () => getDateOptions(currentDate, selectedYear, selectedMonth),
    [currentDate, selectedMonth, selectedYear],
  );
  const safeDay = Math.min(selectedDay, dateOptions.days.at(-1) ?? selectedDay);
  const paymentDate = `${selectedYear}-${selectedMonth}-${String(safeDay).padStart(
    2,
    "0",
  )}`;

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">Who paid?</span>
          <select
            name="payerName"
            required
            className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-base text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="">Choose sibling</option>
            {PAYERS.map((payer) => (
              <option key={payer} value={payer}>
                {payer}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">
            Payment date
          </span>
          <input type="hidden" name="paymentDate" value={paymentDate} />
          <div className="grid grid-cols-[0.8fr_1.2fr_1fr] gap-2 rounded-3xl border border-stone-200 bg-white p-2 shadow-sm">
            <select
              aria-label="Payment day"
              value={safeDay}
              onChange={(event) => setSelectedDay(Number(event.target.value))}
              className="h-11 rounded-2xl border border-transparent bg-stone-50 px-3 text-base font-semibold text-stone-950 outline-none transition hover:bg-stone-100 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
              {dateOptions.days.map((day) => (
                <option key={day} value={day}>
                  {String(day).padStart(2, "0")}
                </option>
              ))}
            </select>

            <select
              aria-label="Payment month"
              value={selectedMonth}
              onChange={(event) => {
                setSelectedMonth(event.target.value);
                setSelectedDay(1);
              }}
              className="h-11 rounded-2xl border border-transparent bg-stone-50 px-3 text-base font-semibold text-stone-950 outline-none transition hover:bg-stone-100 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
              {dateOptions.months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            <select
              aria-label="Payment year"
              value={selectedYear}
              onChange={(event) => {
                const nextYear = event.target.value;
                const nextOptions = getDateOptions(
                  currentDate,
                  nextYear,
                  selectedMonth,
                );
                setSelectedYear(nextYear);
                setSelectedMonth(
                  nextOptions.months.some(
                    (month) => month.value === selectedMonth,
                  )
                    ? selectedMonth
                    : nextOptions.months[0].value,
                );
                setSelectedDay(1);
              }}
              className="h-11 rounded-2xl border border-transparent bg-stone-50 px-3 text-base font-semibold text-stone-950 outline-none transition hover:bg-stone-100 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
              {dateOptions.years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <p className="px-2 text-xs font-medium text-stone-500">
            Defaults to today. Pick the exact day the payment was made.
          </p>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">Amount</span>
          <input
            name="amount"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={DEFAULT_PAYMENT_AMOUNT}
            className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-base text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">
            Remarks optional
          </span>
          <input
            name="remarks"
            placeholder="Example: Done, bank transfer, receipt note"
            className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-base text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton />
        {state.message ? (
          <p
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              state.status === "success"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-900"
            }`}
            role="status"
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

function parseDateParts(dateValue: string) {
  const [year, month, day] = dateValue.split("-");

  return {
    year,
    month,
    day: Number(day),
  };
}

function getDateOptions(
  currentDate: string,
  selectedYear: string,
  selectedMonth: string,
) {
  const first = parseDateParts(FIRST_PAYMENT_MONTH);
  const current = parseDateParts(currentDate);
  const startYear = Number(first.year);
  const endYear = Number(current.year);
  const years = Array.from({ length: endYear - startYear + 1 }, (_, index) =>
    String(startYear + index),
  );
  const months = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    return {
      value: month,
      label: new Intl.DateTimeFormat("en", { month: "short" }).format(
        new Date(Date.UTC(2026, index, 1)),
      ),
    };
  }).filter(({ value }) => {
    if (selectedYear === first.year && value < first.month) {
      return false;
    }

    if (selectedYear === current.year && value > current.month) {
      return false;
    }

    return true;
  });
  const daysInMonth = new Date(
    Number(selectedYear),
    Number(selectedMonth),
    0,
  ).getDate();
  const maxDay =
    selectedYear === current.year && selectedMonth === current.month
      ? current.day
      : daysInMonth;
  const days = Array.from({ length: maxDay }, (_, index) => index + 1);

  return { years, months, days };
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 rounded-full bg-emerald-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-stone-400"
    >
      {pending ? "Recording..." : "Record payment"}
    </button>
  );
}

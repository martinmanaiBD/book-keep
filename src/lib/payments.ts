export const PAYERS = [
  "Felicia",
  "Michel",
  "Mark",
  "Martin",
  "Maurice",
] as const;

export type PayerName = (typeof PAYERS)[number];

export type PaymentRecord = {
  id: string;
  payer_name: PayerName;
  payment_date: string;
  payment_month: string;
  amount: number;
  paid_at: string;
  remarks: string | null;
  created_at: string;
};

export type PaymentInput = {
  payerName: string;
  paymentDate: string;
  amount: string;
  remarks?: string;
};

export type ValidPaymentInput = {
  payerName: PayerName;
  paymentDate: string;
  paymentMonth: string;
  amount: number;
  remarks: string | null;
};

export type PaymentStatus = {
  payerName: PayerName;
  record: PaymentRecord | null;
};

export const DEFAULT_PAYMENT_AMOUNT = 144;
export const FIRST_PAYMENT_MONTH = "2026-05-01";
export const MAX_REMARKS_LENGTH = 200;

const payerSet = new Set<string>(PAYERS);

export function isPayerName(value: string): value is PayerName {
  return payerSet.has(value);
}

export function normalizePaymentMonth(value: string): string | null {
  const match = value.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);

  if (!match) {
    return null;
  }

  const [, year, month] = match;
  const monthNumber = Number(month);

  if (monthNumber < 1 || monthNumber > 12) {
    return null;
  }

  const normalized = `${year}-${month}-01`;
  return normalized >= FIRST_PAYMENT_MONTH ? normalized : null;
}

export function getCurrentPaymentMonth(today = new Date()): string {
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const currentMonth = `${year}-${month}-01`;

  return currentMonth < FIRST_PAYMENT_MONTH ? FIRST_PAYMENT_MONTH : currentMonth;
}

export function getCurrentPaymentDate(today = new Date()): string {
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const currentDate = `${year}-${month}-${day}`;

  return currentDate < FIRST_PAYMENT_MONTH ? FIRST_PAYMENT_MONTH : currentDate;
}

export function getPaymentMonthOptions(today = new Date()): string[] {
  const options: string[] = [];
  const end = getCurrentPaymentMonth(today);
  let cursor = FIRST_PAYMENT_MONTH;

  while (cursor <= end) {
    options.push(cursor);
    cursor = addOneMonth(cursor);
  }

  return options;
}

export function normalizePaymentDate(value: string): string | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() + 1 !== Number(month) ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  const normalized = `${year}-${month}-${day}`;
  return normalized >= FIRST_PAYMENT_MONTH ? normalized : null;
}

export function paymentDateToMonth(paymentDate: string): string {
  return `${paymentDate.slice(0, 7)}-01`;
}

export function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1, 1));

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateLabel(dateValue: string): string {
  const [year, monthNumber, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1, day));

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function validatePaymentInput(
  input: PaymentInput,
  today = new Date(),
):
  | { ok: true; data: ValidPaymentInput }
  | { ok: false; message: string } {
  if (!isPayerName(input.payerName)) {
    return { ok: false, message: "Choose one of the family members." };
  }

  const paymentDate = normalizePaymentDate(input.paymentDate);

  if (!paymentDate) {
    return {
      ok: false,
      message: "Choose a valid payment date from May 1, 2026 onward.",
    };
  }

  if (paymentDate > getCurrentPaymentDate(today)) {
    return {
      ok: false,
      message: "Choose a payment date that has already arrived.",
    };
  }

  const paymentMonth = paymentDateToMonth(paymentDate);

  const amount = Number(input.amount);

  if (!Number.isFinite(amount) || amount < DEFAULT_PAYMENT_AMOUNT) {
    return {
      ok: false,
      message: `Enter at least RM${DEFAULT_PAYMENT_AMOUNT}.`,
    };
  }

  const remarks = input.remarks?.trim() || null;

  if (remarks && remarks.length > MAX_REMARKS_LENGTH) {
    return {
      ok: false,
      message: `Keep remarks under ${MAX_REMARKS_LENGTH} characters.`,
    };
  }

  return {
    ok: true,
    data: {
      payerName: input.payerName,
      paymentDate,
      paymentMonth,
      amount,
      remarks,
    },
  };
}

export function buildMonthlyStatus(records: PaymentRecord[]): PaymentStatus[] {
  const recordsByPayer = new Map<PayerName, PaymentRecord>();

  for (const record of records) {
    recordsByPayer.set(record.payer_name, record);
  }

  return PAYERS.map((payerName) => ({
    payerName,
    record: recordsByPayer.get(payerName) ?? null,
  }));
}

function addOneMonth(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1, 1));
  date.setUTCMonth(date.getUTCMonth() + 1);

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}-01`;
}

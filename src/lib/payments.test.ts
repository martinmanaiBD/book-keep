import { describe, expect, it } from "vitest";

import {
  FIRST_PAYMENT_MONTH,
  buildMonthlyStatus,
  getPaymentMonthOptions,
  normalizePaymentDate,
  normalizePaymentMonth,
  validatePaymentInput,
  type PaymentRecord,
} from "./payments";

describe("payment helpers", () => {
  it("normalizes valid payment months from May 2026 onward", () => {
    expect(normalizePaymentMonth("2026-05")).toBe(FIRST_PAYMENT_MONTH);
    expect(normalizePaymentMonth("2026-06-01")).toBe("2026-06-01");
  });

  it("normalizes valid payment dates from May 1, 2026 onward", () => {
    expect(normalizePaymentDate("2026-05-01")).toBe("2026-05-01");
    expect(normalizePaymentDate("2026-06-08")).toBe("2026-06-08");
  });

  it("rejects malformed, impossible, or too-early payment dates", () => {
    expect(normalizePaymentDate("2026-04-30")).toBeNull();
    expect(normalizePaymentDate("2026-02-31")).toBeNull();
    expect(normalizePaymentDate("2026-06")).toBeNull();
  });

  it("rejects malformed or too-early payment months", () => {
    expect(normalizePaymentMonth("2026-04")).toBeNull();
    expect(normalizePaymentMonth("2026-13")).toBeNull();
    expect(normalizePaymentMonth("June 2026")).toBeNull();
  });

  it("validates payment input with fixed payer names", () => {
    const valid = validatePaymentInput({
      payerName: "Martin",
      paymentDate: "2026-06-08",
      amount: "144",
      remarks: "Done",
    }, new Date("2026-06-08T00:00:00.000Z"));

    expect(valid).toEqual({
      ok: true,
      data: {
        payerName: "Martin",
        paymentDate: "2026-06-08",
        paymentMonth: "2026-06-01",
        amount: 144,
        remarks: "Done",
      },
    });
  });

  it("rejects unknown payers and underpayments", () => {
    expect(
      validatePaymentInput({
        payerName: "Someone else",
        paymentDate: "2026-06-08",
        amount: "144",
      }, new Date("2026-06-08T00:00:00.000Z")).ok,
    ).toBe(false);

    const underpayment = validatePaymentInput(
      {
        payerName: "Martin",
        paymentDate: "2026-06-08",
        amount: "1",
      },
      new Date("2026-06-08T00:00:00.000Z"),
    );

    expect(underpayment).toEqual({
      ok: false,
      message: "Enter at least RM144.",
    });
  });

  it("rejects future months and oversized remarks", () => {
    const futureMonth = validatePaymentInput(
      {
        payerName: "Martin",
        paymentDate: "2026-06-09",
        amount: "144",
      },
      new Date("2026-06-08T00:00:00.000Z"),
    );

    expect(futureMonth).toEqual({
      ok: false,
      message: "Choose a payment date that has already arrived.",
    });

    const longRemark = validatePaymentInput(
      {
        payerName: "Martin",
        paymentDate: "2026-06-08",
        amount: "144",
        remarks: "x".repeat(201),
      },
      new Date("2026-06-08T00:00:00.000Z"),
    );

    expect(longRemark).toEqual({
      ok: false,
      message: "Keep remarks under 200 characters.",
    });
  });

  it("builds a status row for every sibling", () => {
    const records: PaymentRecord[] = [
      {
        id: "payment-1",
        payer_name: "Felicia",
        payment_date: "2026-06-08",
        payment_month: "2026-06-01",
        amount: 144,
        paid_at: "2026-06-08T00:00:00.000Z",
        remarks: null,
        created_at: "2026-06-08T00:00:00.000Z",
      },
    ];

    const status = buildMonthlyStatus(records);

    expect(status).toHaveLength(5);
    expect(status.find((entry) => entry.payerName === "Felicia")?.record).toBe(
      records[0],
    );
    expect(status.find((entry) => entry.payerName === "Martin")?.record).toBeNull();
  });

  it("lists months from May 2026 through the current payment month", () => {
    expect(getPaymentMonthOptions(new Date("2026-06-08T00:00:00.000Z"))).toEqual([
      "2026-05-01",
      "2026-06-01",
    ]);
  });
});

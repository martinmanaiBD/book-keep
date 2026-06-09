import {
  type PaymentRecord,
  type ValidPaymentInput,
  buildMonthlyStatus,
} from "@/lib/payments";
import {
  createSupabaseServerClient,
  getSupabaseConfigError,
} from "@/lib/supabase/server";

export type StoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

export async function recordPayment(
  input: ValidPaymentInput,
): Promise<StoreResult<PaymentRecord>> {
  const configError = getSupabaseConfigError();

  if (configError) {
    return {
      ok: false,
      message: `${configError} Add Supabase environment variables before submitting payments.`,
    };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("payments")
    .insert({
      payer_name: input.payerName,
      payment_date: input.paymentDate,
      payment_month: input.paymentMonth,
      amount: input.amount,
      remarks: input.remarks,
    })
    .select()
    .single();

  if (error?.code === "23505") {
    return {
      ok: false,
      message: `${input.payerName} is already marked as paid for this month.`,
    };
  }

  if (error) {
    console.error("Failed to record payment", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    return {
      ok: false,
      message: `Could not save the payment. Supabase error: ${error.code} - ${error.message}`,
    };
  }

  return { ok: true, data };
}

export async function getPaymentsForMonth(month: string): Promise<
  StoreResult<{
    records: PaymentRecord[];
    status: ReturnType<typeof buildMonthlyStatus>;
  }>
> {
  const configError = getSupabaseConfigError();

  if (configError) {
    return {
      ok: false,
      message: `${configError} Add Supabase environment variables to view monthly status.`,
    };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("payment_month", month)
    .order("paid_at", { ascending: true });

  if (error) {
    console.error("Failed to load payments", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    return {
      ok: false,
      message: `Could not load payments for this month. Supabase error: ${error.code} - ${error.message}`,
    };
  }

  const records = data ?? [];

  return {
    ok: true,
    data: {
      records,
      status: buildMonthlyStatus(records),
    },
  };
}

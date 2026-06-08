"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { recordPayment } from "@/lib/payment-store";
import { formatMonthLabel, validatePaymentInput } from "@/lib/payments";
import {
  STATUS_AUTH_COOKIE,
  getStatusAuthCookieOptions,
  validateStatusCredentials,
} from "@/lib/status-auth";

export type PaymentActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type StatusLoginActionState = {
  status: "idle" | "error";
  message: string;
};

export async function submitPayment(
  _previousState: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const validated = validatePaymentInput({
    payerName: String(formData.get("payerName") ?? ""),
    paymentDate: String(formData.get("paymentDate") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    remarks: String(formData.get("remarks") ?? ""),
  });

  if (!validated.ok) {
    return { status: "error", message: validated.message };
  }

  const result = await recordPayment(validated.data);

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  revalidatePath("/");
  revalidatePath("/status");

  return {
    status: "success",
    message: `${validated.data.payerName} is marked paid for ${formatMonthLabel(
      validated.data.paymentMonth,
    )}.`,
  };
}

export async function loginToStatus(
  _previousState: StatusLoginActionState,
  formData: FormData,
): Promise<StatusLoginActionState> {
  const result = validateStatusCredentials(
    String(formData.get("username") ?? ""),
    String(formData.get("password") ?? ""),
  );

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  const cookieStore = await cookies();
  cookieStore.set(STATUS_AUTH_COOKIE, result.token, getStatusAuthCookieOptions());

  redirect("/status");
}

export async function logoutFromStatus() {
  const cookieStore = await cookies();
  cookieStore.delete(STATUS_AUTH_COOKIE);

  redirect("/");
}

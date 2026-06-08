"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  loginToStatus,
  type StatusLoginActionState,
} from "@/app/actions";

const initialState: StatusLoginActionState = {
  status: "idle",
  message: "",
};

export function StatusLoginForm() {
  const [state, formAction] = useActionState(loginToStatus, initialState);

  return (
    <form
      action={formAction}
      className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-6 shadow-xl shadow-stone-950/5"
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
          Protected Status
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
          Sign in to view monthly status
        </h1>
        <p className="text-sm leading-6 text-stone-600">
          Enter the shared family username and password to view payment
          collection status.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">Username</span>
          <input
            name="username"
            autoComplete="username"
            required
            className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-base text-stone-950 outline-none transition hover:bg-white focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-base text-stone-950 outline-none transition hover:bg-white focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <SubmitButton />
        {state.message ? (
          <p
            className="rounded-2xl bg-amber-100 px-4 py-3 text-sm font-medium text-amber-900"
            role="status"
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 rounded-full bg-emerald-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-stone-400"
    >
      {pending ? "Signing in..." : "Enter status page"}
    </button>
  );
}

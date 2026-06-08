create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  payer_name text not null check (
    payer_name in ('Felicia', 'Micheal', 'Mark', 'Martin', 'Maurice')
  ),
  payment_date date not null check (payment_date >= date '2026-05-01'),
  payment_month date not null check (
    payment_month >= date '2026-05-01'
    and payment_month = date_trunc('month', payment_month)::date
    and payment_month = date_trunc('month', payment_date)::date
  ),
  amount numeric(10, 2) not null check (amount >= 144),
  paid_at timestamptz not null default now(),
  remarks text check (char_length(coalesce(remarks, '')) <= 200),
  created_at timestamptz not null default now(),
  constraint payments_payer_month_unique unique (payer_name, payment_month)
);

create index if not exists payments_payment_month_idx
  on public.payments (payment_month);

alter table public.payments enable row level security;

create policy "payments_select_anon"
  on public.payments
  for select
  to anon
  using (true);

create policy "payments_insert_anon_current_months"
  on public.payments
  for insert
  to anon
  with check (
    payer_name in ('Felicia', 'Micheal', 'Mark', 'Martin', 'Maurice')
    and payment_date >= date '2026-05-01'
    and payment_date <= current_date
    and payment_month >= date '2026-05-01'
    and payment_month = date_trunc('month', payment_month)::date
    and payment_month = date_trunc('month', payment_date)::date
    and payment_month <= date_trunc('month', now())::date
    and amount >= 144
    and char_length(coalesce(remarks, '')) <= 200
  );

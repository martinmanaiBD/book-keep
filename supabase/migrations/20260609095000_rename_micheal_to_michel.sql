drop policy if exists "payments_insert_anon_current_months" on public.payments;

alter table public.payments
  drop constraint if exists payments_payer_name_check;

update public.payments
set payer_name = 'Michel'
where payer_name = 'Micheal';

alter table public.payments
  add constraint payments_payer_name_check
  check (payer_name in ('Felicia', 'Michel', 'Mark', 'Martin', 'Maurice'));

create policy "payments_insert_anon_current_months"
  on public.payments
  for insert
  to anon
  with check (
    payer_name in ('Felicia', 'Michel', 'Mark', 'Martin', 'Maurice')
    and payment_date >= date '2026-05-01'
    and payment_date <= current_date
    and payment_month >= date '2026-05-01'
    and payment_month = date_trunc('month', payment_month)::date
    and payment_month = date_trunc('month', payment_date)::date
    and payment_month <= date_trunc('month', now())::date
    and amount >= 144
    and char_length(coalesce(remarks, '')) <= 200
  );

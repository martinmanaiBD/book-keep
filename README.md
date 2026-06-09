# Book-Keep

Book-Keep is a small family payment tracker for monthly collections from
Felicia, Michel, Mark, Martin, and Maurice. It starts tracking from May 2026
and stores payment records in Supabase.

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local env file:

```bash
cp .env.example .env.local
```

Fill in:

```bash
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
STATUS_USERNAME="family"
STATUS_PASSWORD="change-this-password"
STATUS_SESSION_SECRET="replace-with-a-long-random-string"
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

1. Create a free Supabase project.
2. Open the SQL editor.
3. Run the SQL in `supabase/migrations/20260608134200_create_payments.sql`.
4. Copy the project URL and anon key into `.env.local`.

The app writes to Supabase from server actions only. Do not put the Supabase
service-role key in `.env.local` or Vercel for this app.

## Features

- `/` records a payment for a sibling, payment date, amount, and optional remarks.
- `/status` requires the shared username/password, then shows who has paid
  and who has not for the selected month.
- Each sibling can only be recorded once per month.
- The default payment amount is RM144.

## Verification

Run the automated checks:

```bash
npm test
npm run lint
npm run build
```

Manual flow to check after Supabase is configured:

1. Submit a May 2026 payment for one sibling.
2. Open `/status?month=2026-05-01`, sign in, and confirm that sibling appears under paid.
3. Submit the same sibling and month again and confirm the duplicate message.
4. Submit a June 2026 payment and confirm May and June status stay separate.

## Deploy

Deploy to Vercel and add the same Supabase and status-login environment
variables in the Vercel project settings.

# Put Wholesale System online, free

The app is set up for two free services:

- **Supabase** holds the database and handles sign-in.
- **Cloudflare Workers** hosts the app.

It takes about 20 minutes, and you never need to send anyone a key.

## 1. Supabase: the database

1. Go to supabase.com and create a project.
   - Name: `wholesale`.
   - Region: **Sydney**.
   - Choose a database password and keep it safe.
2. Open **SQL Editor**, then **New query**. Paste the whole of `supabase/schema.sql` and press **Run**. This creates the 16 tables.
3. Add your data. Make a new query for each file you use, then **Run**:
   - **Your Base44 CSV exports:** use the generated `supabase/import.sql`.
   - **No exports:** use `supabase/demo-seed.sql` for the demo catalogue (hubs, 10 categories, 24 suppliers, 31 products, sample units).

## 2. Supabase: sign-in

1. Open **Authentication → Sign In / Providers → Email**.
   - For a demo, turn **Confirm email** off, so new accounts can sign in straight away.
   - Supabase's built-in email sends only a few messages an hour.
2. Open **Authentication → URL Configuration**:
   - **Site URL**: your app's address from step 4, for example `https://wholesale.your-name.workers.dev`.
   - **Redirect URLs**: add the same address followed by `/**`.

## 3. Collect three values

Click **Connect** at the top of the Supabase project page and copy these:

- **Project URL**: `https://xxxx.supabase.co`.
- **Public key**: labelled **anon** or **publishable**.
- **Transaction pooler connection string**: it uses port `6543`. Put your database password into it where it says `[YOUR-PASSWORD]`.

## 4. Cloudflare: hosting

1. Go to dash.cloudflare.com and choose **Workers & Pages → Create → Import a repository**. Connect GitHub and pick `wholesale`.
2. Fill in **Build settings**:
   - Build command: `npm run build`.
   - Deploy command: `npx wrangler deploy`.
3. Under **Build variables**, add:
   - `VITE_SUPABASE_URL` = the Project URL;
   - `VITE_SUPABASE_ANON_KEY` = the public key.
4. Press **Deploy**.
5. When the deploy finishes, open the Worker's **Settings → Variables and Secrets** and add:
   - `DATABASE_URL`, as type **Secret** = the Transaction pooler connection string;
   - `ADMIN_EMAILS` = your email, plus your partner's, separated by a comma.
6. Click **Deployments → Retry deployment** (or push any commit) so the Worker picks up the new values.
7. Your app is at `https://wholesale.<your-subdomain>.workers.dev`. Open it on your phone, sign up with the email you put in `ADMIN_EMAILS`, and you're the admin.

## 5. Add it to the phone home screen

- **iPhone, in Safari**: tap Share → **Add to Home Screen**.
- **Android, in Chrome**: tap ⋮ → **Add to Home screen**.

## Good to know

- **Accounts.** People from the Base44 days create a new password once by signing up with the same email. Their role and hub carry over, matched by email.
- **Supabase pauses.** A free Supabase project pauses after a week with no visits. Press **Restore** in Supabase to wake it.
- **Cloudflare limits.** The free Cloudflare plan allows 100,000 requests a day and a short CPU time per request. If pages ever fail with "exceeded CPU" (error 1102), the $5/month Workers Paid plan removes that limit.
- **Daily sample checks.** These run automatically at 6 am Sydney time from the cron trigger in `wrangler.jsonc`. An admin can also run them on demand with `POST /api/sample-checks`.
- **Reminder emails.** These send once you add `RESEND_API_KEY` from resend.com, which is free for 3,000 a month. Until then the console says the email wasn't sent.

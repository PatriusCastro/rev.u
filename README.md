# rev.u
Rev.U is a review web app for the Civil Engineering licensure exam. It teaches each topic through lessons and step-by-step solutions, then brings back what a reviewer got wrong until it is cleared.

- Plan: [docs/build-plan.md](docs/build-plan.md)
- Design system and prototype: [docs/design-system/](docs/design-system/README.md)
- Content format: [content/README.md](content/README.md)

## Stack

Next.js 16 (TypeScript, Tailwind), Supabase (database, sign-in, storage, access rules), KaTeX, Lucide icons. No AI model.

## Run it locally

Needs Node 22 and Docker.

```sh
npm install
npx supabase start          # local database, auth and storage; applies supabase/migrations
npx supabase status -o env  # copy API_URL, ANON_KEY and SERVICE_ROLE_KEY into .env.local (see .env.example)
npm run import              # loads content/ into the database
npm run dev                 # http://localhost:3000
```

## Checks

```sh
npm test               # repeat interval rule, review-plan ranking, streak, content parser, math renderer
npm run check:content  # validates every content file without touching the database
npm run check:rls      # signs up two throwaway users and confirms neither can see the other's data
```

## Deploying

1. Create a Supabase project and run `npx supabase link` then `npx supabase db push`.
2. In Supabase Auth, set the Site URL to the app's address and change the "Confirm signup" email link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`.
3. Import content with the project's URL and service role key.
4. Deploy to Vercel with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The service role key is only for the import script; never give it to the app.

### Form Agent AI

GOV.UK‑styled Next.js app that renders Firmstep form definitions and pairs them with an AI assistant. The assistant can explain the form, ask questions conversationally, and update the form on the user's behalf.

**Live demo**: [forms-ai.lang.scot](https://forms-ai.lang.scot)

### Get started
1. Clone the repo
   - `git clone https://github.com/langscot/forms-ai && cd forms-ai`
2. Install dependencies
   - `pnpm install`
3. Create environment file
   - Copy `.env.example` to `.env.local`
4. (Optional) Disable Cloudflare Turnstile
   - Set `CLOUDFLARE_TURNSTILE_ENABLED=false` in `.env.local`
5. Set your OpenAI API key
   - `OPENAI_API_KEY=...`
   - If you want Turnstile enabled, also set `NEXT_PUBLIC_CF_SITE_KEY` and `CF_SECRET_KEY`
6. Add a Firmstep JSON form definition
   - Place your `.json` in `example_forms/`
   - Ensure the form's `formName` is unique among files in that directory
7. Run the dev server
   - `pnpm dev` then open `http://localhost:3000`

### Notes
- Example forms live in `example_forms/` and are auto‑loaded at startup.
- The assistant uses the current section's fields and can call a tool to update form state when you answer.


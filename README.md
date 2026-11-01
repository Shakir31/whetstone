<p align="center">
  <img src="public/email/whetstone-mark.png" width="72" height="72" alt="">
</p>

<h1 align="center">Whetstone</h1>

<p align="center">A journal that judges what you did each day and turns it into progress.</p>

<p align="center"><a href="https://whetstone-mauve.vercel.app/">whetstone-mauve.vercel.app</a></p>

---

You write down what you did today, and a game-inspired "System" reads the entry, scores it, and gives a short verdict. Over time your records turns into levels, skills and a class, in a dark style borrowed from games like Bloodborne and Dark Souls.

Nothing has to be set up by hand, and there are no quests to create and no rewards to assign yourself. You only write entries, and the System decides what each one is worth.

## How it works

### Body, Mind and Will

Every entry is scored on two stats, each from 0 to 1:

- **Body** for physical effort, such as training, running or manual work.
- **Mind** for deliberate mental effort, such as study, practice or solving a hard problem.

Specific entries score higher than vague ones. "5 sets of weighted pushups to failure" gives the System something to measure, while "worked out" does not. Although, writing more words does not raise the score on its own.

**Will** is not scored by the AI. It goes up by one for every three days in a row with an entry that gained at least 0.2 in Body or Mind.

Stats are shown as levels. A Body of 7.4 is shown as Lv. 7, 40% of the way to Lv. 8.

Body and Mind can each gain at most 1.5 in a day. Once you have a class, the limit will increase to 3.

### Skills

Doing the same kind of activity five days in a row turns it into a skill, and the System gives it a name (running might become "Iron Lungs"). A single missed day does not break the streak. Additionally, for physical activities in the Strength and Endurance paths, two missed days in a row are allowed, since training needs rest.

Each further streak of five days raises the skill one rank, up to Rank V. A week without the activity costs a rank, and a skill that drops below Rank I is Lost until another streak brings it back.

### Classes

Every activity is sorted into one of five paths: strength, endurance, knowledge, craft or discipline. When Will reaches level 5, you are given a class based on the path you have followed most, or the balanced Hunter class if no single path stands out. The System also writes you a personal title.

The class gains a rank for every 15 days spent on its path. At Rank III it evolves, shaped by your second strongest path. At Rank V it takes a final form, shaped by what you did after the first evolution and by how steadily you kept at it.

### Other features

- A weekly judgement for each calendar week, written once the week is over.
- Achievements, which stay hidden until earned, some of them granting a title you can wear.
- A Chronicle of every past entry, grouped by day.
- A Codex inside the app that explains the rules.
- Export of the whole journal as a text file, and account deletion, from Settings.

## Built with

- [React](https://react.dev) and [Vite](https://vite.dev) for the website, with React Router for pages.
- [Supabase](https://supabase.com) for sign-in, the database and three server functions.
- Google's [Gemini API](https://ai.google.dev) to judge entries and write names and summaries.
- [Vitest](https://vitest.dev) for tests.
- [Vercel](https://vercel.com) for hosting.

## Project layout

```
src/
  pages/        One file per page (Journal, Status, Chronicle, Settings, Codex, Landing, ...)
  components/   Pieces used across pages, such as the judgement screen and the panels
  lib/          The game rules (stats, skills, classes, achievements, weekly summaries)
                and the code that talks to Supabase. Each rule file has a .test.js beside it.
  ui/           Components from the Whetstone design system
  styles/       Design tokens, the design system styles and the page styles
supabase/
  migrations/       SQL to create the database tables, in order (001 to 005)
  functions/        Server functions: score-entry, weekly-judgement, delete-account
  email-templates/  HTML for the sign-up, password reset and email change emails
design/         Reference designs and the design system, made in Claude Design
public/         Static files, including the logo
```

Most of the app is worked out in the browser from your entries, so changing a rule in `src/lib` applies to your whole history. The server functions handle the parts that need the AI or must not be faked: scoring entries, naming skills and classes, and writing the weekly judgement.

A few rules exist in two places, in `src/lib` and again in `supabase/functions/score-entry`, because the server needs them to decide when to name a skill or evolve a class. If you change one of these, change both. The comments in both files point at each other.

## Running it yourself

You need [Node.js](https://nodejs.org) 22 or newer, a Supabase project and a Gemini API key.

### 1. Install

```bash
git clone https://github.com/Shakir31/whetstone.git
cd whetstone
npm install
```

### 2. Connect to Supabase

Copy `.env.example` to `.env.local` and fill in your project's URL and its anon (or publishable) key. You can find both in the Supabase dashboard under **Project Settings → API**. The file is ignored by Git.

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your-anon-or-publishable-key
```

### 3. Create the database

In the Supabase dashboard, open **SQL Editor** and run each file in `supabase/migrations` in order, from `001_entries.sql` to `005_final_form.sql`.

### 4. Add the server functions

Create three Edge Functions with these exact names, and paste in the matching file from `supabase/functions`:

| Function | What it does |
|---|---|
| `score-entry` | Scores an entry, saves it, names new skills and assigns or evolves the class |
| `weekly-judgement` | Writes the judgement for a finished week |
| `delete-account` | Deletes an account and everything in it |

Then add these secrets under **Edge Functions → Secrets**:

| Secret | Required | Notes |
|---|---|---|
| `GEMINI_API_KEY` | Yes | From [Google AI Studio](https://aistudio.google.com) |
| `GEMINI_MODEL` | No | Defaults to `gemini-flash-latest` |
| `GEMINI_FALLBACK_MODEL` | No | Used when the main model's quota runs out. Defaults to `gemini-flash-lite-latest` |

### 5. Set up sign-in

Under **Authentication → URL Configuration**, set the Site URL to wherever the site is hosted and add both of these as Redirect URLs, so that email links lead back to the site:

```
https://your-site.example/**
http://localhost:5173/**
```

The email templates in `supabase/email-templates` can be pasted into **Authentication → Emails → Templates**. Supabase's built-in email sender is only meant for testing, so connect your own SMTP service under **Project Settings → Authentication** before other people sign up.

### 6. Run

```bash
npm run dev
```

The site opens at http://localhost:5173.

## Tests

```bash
npm test
```

The tests cover the rules in `src/lib`: the daily limit, Will and streaks, skill ranks and rest days, classes and both evolutions, achievements, weekly summaries, date formatting and the journal export. They use a fixed clock, so they give the same result in any time zone.

`npm run build` runs the tests before building. If a test fails, the build stops, so a broken rule never reaches the live site.

## Deploying

The live site is on Vercel, connected to this repository. Every push to `main` builds and deploys it. In the Vercel project settings, add the same two `VITE_SUPABASE_*` values as in `.env.local`. `vercel.json` sends every address to the app, so refreshing on a page such as `/status` works.

Changes to the server functions and the database do not deploy with the site. Paste updated functions into the Supabase dashboard and run new migrations in the SQL Editor.

## Privacy

Entries are sent to Google's Gemini API to be judged. On Gemini's free tier, Google may use that content to improve its products. The privacy policy inside the app (`/privacy`) explains what is stored and where.

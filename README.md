# IELTS Helper

Full-stack scaffold: Node.js/Express + MongoDB backend, React frontend.
Includes auth (JWT), subscription gating (stub, wire up Stripe later),
mock test taking with auto-grading, and a full admin panel for managing
reading/listening passages and questions.

## Backend setup

```
cd backend
cp .env.example .env      # fill in MONGO_URI and a real JWT_SECRET
npm install
npm run dev                # or: npm start
```

Runs on http://localhost:5000. Make sure MongoDB is running locally
(or point MONGO_URI at Atlas).

### Creating your first admin user
There's no admin signup UI on purpose (don't want randoms making themselves
admin). Sign up normally through the app, then flip the role manually:

```
# in mongosh, connected to your ielts-helper DB
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Frontend setup

```
cd frontend
cp .env.example .env       # points at http://localhost:5000/api by default
npm install
npm start
```

Runs on http://localhost:3000. Styling is Tailwind CSS (already wired into
`package.json`, `tailwind.config.js`, `postcss.config.js`, and
`src/index.css`) — `npm install` picks it up automatically, no extra setup.

## Making yourself an admin (owner access)

Same as above, just spelled out: there's no "become admin" button in the
UI on purpose — anyone could click it otherwise. Instead:

1. Sign up for a normal account through the app (`/signup`).
2. Connect to your MongoDB database (locally with `mongosh`, or Atlas's
   web-based query view).
3. Run:
   ```
   db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
   ```
4. Log out and back in (or just refresh) — an "Admin" link now appears in
   the nav bar, and `/admin` is unlocked.

## What's included

- **Auth**: signup/login/JWT, password hashing (bcrypt)
- **Models**: User (with subscription sub-document), Passage, Question,
  Attempt, StudyItem (vocab/grammar)
- **Student flow**: browse published tests as poster cards → confirm an
  academic-integrity prompt → take test → auto-graded on submit
- **Subscription gate**: `requireActiveSubscription` middleware blocks test
  access until `user.subscription.status` is `active`/`trialing` — this is
  where you'd hook in Stripe webhooks to flip that status on payment
- **Pricing**: $4/month or $30/year (shown on the homepage `#pricing` section)
- **Profile page** (`/profile`): passages completed, total attempts,
  average score, and a list of recent attempts
- **Study page** (`/study`): browsable vocabulary and grammar content,
  filterable by type
- **Translator**: a small widget (free MyMemory API, no key needed) —
  embedded as a sidebar on the test page, and standalone at `/translator`
- **Dark mode**: toggle in the nav bar, persisted to `localStorage`,
  defaults to the OS preference on first visit. Built on CSS variables
  (`src/index.css`) so every page reads from the same palette — no
  per-page dark: overrides needed
- **Admin panel** (`/admin`, role-gated):
  - list/create/edit/delete passages, publish/unpublish
  - add/delete questions per passage, with type-specific forms
  - **bulk import** (`/admin/import`): upload or paste a `.json` file with
    a full passage + all its questions, created in one step
  - **vocab & grammar manager** (`/admin/study`): add/publish/delete
    study items shown on the student-facing Study page
- **External test links**: passages *and* vocab/grammar items can point to
  an external URL (a Google Form, another platform, etc.). Students get a
  "Go to test" / "Open exercise" button that opens it in a new tab, instead
  of (or alongside) answering inline.
- **Passage file upload** (`/admin/new` and `/admin/edit/:id`): drop in an
  `.html` or `.txt` file and its content fills the passage body
  automatically (HTML is rendered as formatted markup for students, run
  through a basic sanitizer on upload). Any other file type (PDF, DOCX,
  image, audio…) is stored and attached as a downloadable resource. Files
  are saved to `backend/uploads/` and served at `/uploads/...` — swap that
  for S3/Cloudinary in production (see `backend/middleware/upload.js`).
- **Reading practice: US news** (on the Dashboard): a small widget of short
  articles for extra reading practice. Set `NEWS_API_KEY` in
  `backend/.env` (a free key from newsapi.org) to pull live US headlines;
  without a key it shows a fixed set of original practice articles instead,
  so the dashboard is never empty.
- **Timed mock tests**: each attempt is timed with a visible countdown -
  60 min for reading / 30 min for listening by default, overridable per
  passage (`durationMinutes` in the admin passage form). Time expiring
  auto-submits whatever's been answered so far. Actual time spent is
  recorded on the `Attempt` (`durationSeconds`).
- **Estimated band score**: every attempt gets a rough IELTS-style band
  (0-9) computed from the raw score (`backend/utils/bandScore.js`). This
  is an approximation for motivation/tracking, not an official score -
  said plainly in the UI.
- **Mistake review**: after any attempt, `/attempts/:id/review` shows
  every question with the student's answer vs. the correct one, with a
  "mistakes only" filter. Linked from the test results screen and from
  Profile's recent-attempts list.
- **Weak-spot breakdown** (Profile page): accuracy per question type
  (multiple choice, T/F/NG, etc.) across all attempts, so students can see
  what to focus on.
- **Spaced repetition for vocab/grammar** (`/study`, "Review" tab): a
  simplified 5-box Leitner system (`StudyProgress` model) tracks
  per-student review state per item and surfaces what's actually due
  today instead of re-showing everything every time.
- **Daily streak**: tracked on `User.streak`, bumped by submitting a test
  attempt or a study review; shown on Profile.
- **Writing practice module** (`/writing`, admin at `/admin/writing`):
  Task 1 / Task 2 prompts, a word-count-aware editor, and automated
  feedback (length, paragraphing, sentence variety, vocabulary
  repetition, and a rough band estimate) on submit - see
  `backend/utils/writingFeedback.js`. **This is heuristic, not real AI
  grading** - it catches mechanical issues but doesn't evaluate content
  the way an examiner or an LLM would. The function's return shape is
  designed so swapping in a real LLM-graded version later (call an LLM
  with the essay + task + official band descriptors, parse structured
  scores back) doesn't require touching the models, routes, or UI.
- **Audio upload for listening passages**: the existing file-uploader now
  detects audio files (mp3/wav/m4a/ogg/aac) and drops them straight into
  `audioUrl`, instead of only handling text/HTML bodies and generic
  attachments.
- **Users & subscriptions admin** (`/admin/users`): search any signed-up
  user by name/email and gift them a free subscription (7/30/90 days, 1
  year, or lifetime) or revoke one — no payment involved. Useful for beta
  testers, support cases, or just comping someone access. Backed by
  `PUT /api/admin/users/:id/subscription` and
  `DELETE /api/admin/users/:id/subscription`. Re-granting to someone with
  time left extends from their current expiry rather than resetting it.

## Fixed since the last version

- `submitAttempt` now scopes graded questions to the passage being
  submitted. Previously a client could send `questionId`s belonging to a
  *different* passage's question bank and have them graded/counted into
  this attempt.
- `TestPage`'s question inputs are now controlled (`checked`/`value` tied
  to state), so a previously-picked answer no longer disappears from view
  on re-render within the same session.
- `createPassage` now saves `durationMinutes` - the admin form let you set
  it, but the create endpoint was silently dropping it (edit already
  worked, since it updates from the full request body).
- Removed a stray `backend/{config,models,middleware,routes,controllers}`
  directory left over from a broken `mkdir -p` brace-expansion command.
- `/#pricing` links (footer, Dashboard's subscribe banner, Profile,
  Writing) previously didn't scroll anywhere — React Router's `Link`
  doesn't auto-scroll to a URL hash like a real browser navigation does.
  Fixed globally with a small `ScrollToHash` component.
- There was no catch-all route, so a mistyped or stale URL rendered a
  blank page with no header/footer. Added a proper 404 page.
- Added lightweight animation/transition polish across the app (hero
  entrance, card stagger-in, button hover/press states, modal scale-in,
  a real loading spinner) — cosmetic only, no behavior changes.

## Not built yet (next steps)

- Stripe integration (checkout + webhook to update `user.subscription`)
- Public, no-login share links for a passage (right now "poster" cards are
  nicer test tiles inside the app, not a public sharing feature — say the
  word if you actually wanted the latter, it's a bigger addition)
- Speaking module (needs audio recording + either human grading or an AI
  pipeline - a different shape of feature from everything else here)
- Real AI-graded writing feedback (current feedback is heuristic - see
  above; the module is structured so this is a scoped follow-up, not a
  rebuild, once you're ready to wire in an LLM call with your own API key)
- Additional Reading question types beyond the current five (e.g. summary
  completion, diagram labeling)
- Promoting other users to admin from inside the UI (still a database
  command for now, see above)

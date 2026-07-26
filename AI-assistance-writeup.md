# AI-Assisted Development Write-Up — REEL (Movie Discovery App)

## 1. Prompts Used During Development

Below is the sequence of prompts used with Claude (AI assistant) throughout the build, written as the actual engineering requests given at each stage:

1. **Assignment scoping:** "Here's my assignment brief: build a React app similar to a movie streaming site, using AI as a development assistant, and document the prompts, AI's role, and any manual fixes I make. Help me break down what's actually required before I start."
2. **Defining the project type:** "The reference project is a movie streaming/discovery site built in React. Help me scope a medium-complexity version: browsing by category, search, movie details, and a watchlist — using the OMDB API for data."
3. **Clarifying requirements:** "Does 'similar' mean I need to replicate the reference app exactly, or build something comparable in complexity and structure? I have a reference tutorial — check if my planned feature set lines up with it."
4. **Initial build request:** "Build a working React prototype of this app: search movies, browse by category (OMDB has no genre filter, so use curated search terms as categories), view movie details in a drawer, and maintain a watchlist. Use the OMDB API. Since this will run as a live prototype, don't hardcode the API key — prompt for it at runtime."
5. **Adapting to the real codebase:** "Here's the actual file structure of my Vite + React project (screenshot attached), including my `.env` file. Refactor the prototype into separate component files matching this structure, and wire the API key to read from `.env` instead of a runtime prompt."
6. **Environment configuration fix:** "Check my `.env` setup for issues — I'm using `OMDB_API_KEY` as the variable name." *(AI flagged that Vite requires a `VITE_` prefix for client-exposed env variables, which the original `.env` didn't have.)*
7. **File delivery format:** "Give me the files individually, not zipped — I want to review each one before pasting it into my project. Also tell me exactly which directory each file belongs in."
8. **Code review request:** "Walk me through a code review of what you generated. Point out specific things worth testing or reconsidering — don't just list generic best practices, give me concrete, testable issues in this actual codebase."
9. **Prioritizing fixes:** "Of the issues you raised, implement localStorage persistence for the watchlist so it survives a page refresh."
10. **Requesting further review:** "What other improvements would you suggest, now that I've had time to look at the running app?"
11. **Final fix selection:** "Of the remaining suggestions, pick the one you think has the highest impact and implement it." *(AI selected and implemented visible error handling for failed OMDB API calls.)*

## 1a. Note on Prompting Approach

Each prompt was written to give the AI clear context (what exists, what's needed, and any constraints like "don't hardcode the key") rather than vague requests — for example, prompt 5 supplied the actual project structure instead of asking the AI to guess a folder layout, and prompt 8 explicitly asked for specific, testable issues rather than generic advice, which produced a review that could actually be acted on and verified.

## 2. How AI Assisted Throughout Implementation

- **Scoping and clarification:** Before any code was written, AI helped interpret the assignment's ambiguous wording ("similar" vs. "the same") and confirmed that a movie discovery app matching the assignment's intent didn't require real video streaming — just the browsing/search/watchlist layer.
- **Initial build:** AI generated a complete first version of the app as a single working prototype (search, category rows, movie detail view, watchlist) using the OMDB API, including a visual design pass (color palette, typography, layout) rather than default styling.
- **Adapting to the real project:** Once the actual local Vite project structure was shared, AI restructured the single-file prototype into proper component files (`Header.jsx`, `Row.jsx`, `MovieCard.jsx`, `Poster.jsx`, `DetailDrawer.jsx`) matching the existing `src/components/` layout, and corrected a configuration issue (the `.env` variable needed the `VITE_` prefix to be readable by Vite's client-side code — this wasn't something the original `.env` file had accounted for).
- **Guided code review:** Rather than AI simply listing "best practices" generically, it identified specific, testable issues in the actual generated code (e.g., silent API failures, no persistence, an untested race condition) and asked which ones were worth fixing, keeping the decision-making with the developer rather than the AI.
- **Implementing selected fixes:** AI implemented the specific improvements chosen after review (see Section 3), explaining the reasoning for each change rather than just supplying a diff.

## 3. Manual Improvements Made After Reviewing AI-Generated Code

### a) Added `localStorage` persistence for the watchlist
**Before:** The watchlist lived only in React state (`useState([])`), so refreshing the page wiped it — a real usability gap for a "watchlist" feature.
**After:** The watchlist now initializes by reading from `localStorage`, and a `useEffect` writes to `localStorage` on every change. Both reads/writes are wrapped in `try/catch` since `localStorage` can throw in private browsing or storage-full situations — without that guard, a single edge case would crash the whole app instead of degrading gracefully.
**Why this mattered:** This was identified as a real functional gap after actually using the app (adding a movie, refreshing, watching it disappear) — not something visible from reading the code alone.

### b) Verified the rapid-click / race-condition handling in `DetailDrawer.jsx`
**Before/after:** No code change was made here. The component already used a `cancelled` flag inside its `useEffect` to guard against a stale API response overwriting a newer one when a user clicks between movie posters quickly.
**Why this matters for review:** Manually tested this exact scenario (opening one movie, then quickly opening another before the first finished loading) and confirmed no bug occurred. Documenting a check that passed is as much a part of code review as documenting a fix — it shows the code was actually exercised, not just read.

### c) Added visible error handling for failed OMDB API calls
**Before:** If the OMDB API returned an error (invalid key, rate limit hit, network failure), the app failed silently — rows and search results just rendered empty, with no indication anything had gone wrong.
**After:** Both the category rows and search now check for OMDB's `Response: "False"` field (their API returns HTTP 200 even on errors, so a plain `.catch()` on the fetch wasn't enough) and display a visible error message. A judgment call was made to filter out OMDB's `"Movie not found!"` response specifically, since that's a normal "no results" case rather than a real error, and showing it as a red warning would be misleading.
**Why this mattered:** This is the kind of bug that's invisible until you deliberately break something (e.g., temporarily using an invalid API key) to see how the app behaves under failure — a step taken specifically to review the AI-generated code's robustness rather than just its happy-path behavior.

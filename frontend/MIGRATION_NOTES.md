# Frontend migration

All existing routes now use the supplied minimal design. Reference files are in `design-reference/`; their fixtures and scripts are not imported by the application. Backend source and API contracts are unchanged.

## Development

- `npm run dev` starts the frontend. Use `http://localhost:5173` with the backend's existing CORS configuration.
- The API defaults to `http://localhost:8000`. Set `VITE_API_BASE_URL` to override it; the backend must allow the frontend origin.
- Run `npm test`, `npm run lint`, and `npm run build` for validation.

## Product boundaries

- Dataset labels use a short ID; details show the full ID. Dates and editable names are omitted because metadata does not expose them.
- Dataset upload uses `/db/upload_db`. Since it returns no ID, success opens the library and fetches its current contents.
- Azure upload uses `/dataset/upload` in a separate form. A stored blob does not become a library dataset.
- Schema inspection uses returned metadata. Row previews, aggregation, and a global Insights destination are deferred until backend APIs exist.
- Initial insights are enabled for `csv` and `db`. The existing backend lacks the `sqlite` analysis branch; `.sqlite` files remain inspectable.
- Context drafts and analysis state are kept in workspace memory by dataset/table and cleared on logout or account changes. Saved insight text and prompt context are restored through the existing session endpoint. Draft persistence across reloads is not promised.
- Library filters live in URL parameters; table selection uses `?table=`. Late analysis responses cannot overwrite another table or a new user's workspace. Navigating away cancels an active upload's browser request; server-side processing may still finish.

## Design adaptation

Tokens follow `design-reference/DESIGN.md`. Primary hover uses `#006edb` rather than `#0077ed`: the reference hover has only 4.32:1 contrast against white, below the 4.5:1 requirement for compact button text. Other surface/text pairs and primary actions meet that requirement. All legacy global and screen CSS has been replaced, so normal root font sizing can be used without compatibility aliases.

## Verification — October 23, 2026

- Automated: workflow tests cover authentication, route guards, logout, library filtering/retry, upload validation/progress/retry, per-table drafts, session restoration, delayed responses, safe result rendering, and unavailable SQLite analysis.
- Browser checks with isolated mocked responses: landing, login, library, upload, and workspace at 1440px, 390px, and 375px; no page errors or page-level horizontal overflow. Also checked 720px reflow (equivalent layout width to a 1440px viewport at 200% zoom), long schema identifiers, keyboard focus, and reduced motion.
- Live unchanged backend: signup/login, CSV upload → library → schema, and `.db`/`.sqlite` upload → schema passed. SQLite analysis is correctly disabled.
- Live AI insight did not complete within the 60-second smoke-test window, so live result restoration could not be verified. Azure upload returned a network error. Success, error, and restoration behavior are covered by mocked API tests; live service completion remains unverified.
- Live checks created an account named `Frontend migration smoke` and datasets with `frontend_smoke_` or `frontend_migration_smoke` table names. These are test data, separate from prototype fixtures.

## Landing v2 and canvas

The `/` route now uses `src/features/landing/LandingPage.tsx`. Its stylesheet is scoped under `.landing-v2`; account and workspace routes keep their existing appearance. Demo records and illustrative text are centralized in `demoData.ts`, and neither demo calls the backend.

The navbar uses independent compact/action states, 72px/16px hysteresis, and an action gated by the end of the format strip. The hero plays each of three stages for five seconds once; pause, replay, manual selection, offscreen visibility, and document visibility are handled independently from the workflow. A single scheduled scroll listener coordinates navbar and desktop workflow measurements. Reduced motion uses manual demos and disables automatic workflow choreography. All listeners, observers, frames, and animations are cleaned up on unmount.

The canvas has 30 artboards. Five landing views cover desktop introduction, compact navbar, workflow schema, mobile introduction, and mobile workflow. Open `design-reference/canvas.html`; its standalone reference frames do not need the React app to render. App navigation links require the frontend server. Reference-only `view` and `canvas` parameters are not used by production components.

Validation: 33 tests pass, along with lint and production build. Local Chrome checks covered 1440px, 1120px, 820px, 390px, and 375px widths, stable demo dimensions, centered compact navigation, rapid direction changes, reduced motion, 720px reflow, and all five reference views. The landing generated no backend requests or browser errors during these checks. The temporary frontend server is stopped after verification.

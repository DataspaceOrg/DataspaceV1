# Dataspace React migration plan

## Goal

Migrate the approved minimal design into the existing React frontend while preserving the core workflow: authentication → upload → dataset selection → table selection → initial insight → aggregation.

This is an implementation plan. No React migration has been performed by creating these files.

## References and location

Place this `design-reference` folder inside `/Users/huylegia/Coding-Projects/DataspaceV1/frontend/`.

- `DESIGN.md`: shared design rules and screen inventory.
- `canvas.html`: screen board with desktop/mobile layouts and example states.
- `index.html`: interactive HTML prototype used by the canvas.
- `IMPLEMENTATION_PLAN.md`: this migration plan.

Keep the HTML files together: the canvas loads the prototype through relative links. Open `canvas.html` in a browser to explore screens. Edit `index.html` to change their content and shared styles. Edit `canvas.html` to change board organization.

These files are references. Do not overwrite the frontend's existing root `index.html` with the prototype.

## 1. Map current behavior

Record the current routes and the API operations they use:

- `/`: landing page.
- `/login`, `/signup`: authentication.
- `/dashboard`: dataset library.
- `/upload`: file upload.
- `/dataset/:dataset_id/`: table inspection and analysis.

Read the current `src/shared/api.tsx`, `src/shared/authApi.tsx`, and affected components before implementation. Confirm actual request/response types, error handling, user identity headers, and session restoration behavior against the backend.

Resolve these known questions before wiring new behavior:

- The original upload screen exposes two endpoints with shared file state. Determine each endpoint's intended purpose; do not merge or remove a workflow based on appearance alone.
- The aggregation action currently invokes the insight handler. Confirm the intended aggregation API and prerequisite states; do not invent an endpoint.
- Confirm whether a cross-dataset insights listing is available. A new Insights route must be backed by available data, or remain out of production until that dependency is implemented.
- Confirm which dataset names, dates, sizes, schemas, and table rows the API actually returns. Omit unavailable metadata or provide an honest unavailable state.

Completion: a route/API mapping and resolved dependencies sufficient for the next screen being migrated.

## 2. Establish the shared foundation

Retain the installed React, TypeScript, Vite, React Router, and icon setup unless a concrete requirement justifies changing it.

Suggested structure, adapted to existing repository conventions:

```text
src/
  components/
    ui/
      Button.tsx
      Field.tsx
      Dialog.tsx
      DataTable.tsx
      Feedback.tsx
    layout/
      AppShell.tsx
      Sidebar.tsx
  features/
    datasets/
    upload/
    analysis/
    auth/
  shared/
    api.tsx
    authApi.tsx
  styles/
    tokens.css
    base.css
```

Define design values once using `DESIGN.md`. Bind legacy `--ds-*` variables to shared tokens while old screens remain mounted, then remove aliases after all consumers migrate.

Fix the 10px root font sizing and global paragraph overrides as part of a coordinated component migration; changing the root alone would enlarge legacy rem-based layouts unexpectedly. Keep old screen styles scoped during transition. Use the existing coherent icon family.

Completion: shared controls have consistent sizing, typography, focus, disabled, and feedback states without breaking legacy screens.

## 3. Replace the application shell

- Introduce a shared layout around authenticated workspace screens.
- Preserve existing route paths and actual authentication/session behavior.
- Provide a stable desktop sidebar and compact labeled mobile navigation.
- Use direct page titles: Datasets, dataset name, Insights where implemented.
- Preserve library search/filter state on return. Preserve context and selected table per dataset.
- Do not introduce non-functional Settings or placeholder account destinations.

Completion: existing screens operate within the new shell at desktop and mobile widths.

This and the shared foundation are the first implementation milestone.

## 4. Migrate the library and upload flow

Replace `Dashboard` presentation with the minimal dataset list and its search/filter controls. Display metadata supplied by the API, not prototype fixtures.

Implement loading, empty, no-results, load-error, and success states. Keep a useful upload action in an empty library.

For uploads:

- Maintain separate file state for genuinely distinct upload actions.
- Show supported formats and actual backend limits; the prototype's 20 MB limit is not a verified backend requirement.
- Display readable file size, selected filename, and dataset name where supported.
- Distinguish transfer progress from backend processing.
- Prevent duplicate submissions and retain inputs after recoverable failures.
- Open the dataset using the returned ID after success.
- Never fabricate SQLite tables or schema.

Completion: a real upload can be found in the library and opened through the normal workflow.

## 5. Migrate the dataset workspace

- Put table selection before data/schema inspection.
- Use Preview and Schema views. Confirm that real row-preview data exists before implementing the prototype's preview table.
- Keep the dataset name and selected table visible.
- Keep optional context separate for each table and preserve it on navigation.
- Connect initial insight to the confirmed API.
- Connect aggregation only after its actual API and prerequisites are established.
- Restore available table sessions without showing another table's stale result.
- Scope pending state to the operation and dataset/table that initiated it; ignore obsolete responses after navigation.
- Prevent duplicate requests. Keep errors local and offer a meaningful retry.
- Render actual response content accessibly; if Markdown is used, disable raw HTML or sanitize it. Never insert untrusted responses as HTML.

Completion: initial insight and aggregation use distinct confirmed behavior, and results remain associated with their source dataset/table.

## 6. Migrate insights and account screens

Add the Insights list only when available session/query data can support it. Link results back to their dataset and table. Do not promise persistence that the backend does not provide.

Restyle login, signup, and landing using shared controls. Preserve real authentication calls, validation, session handling, and redirects. Never copy the prototype's account-submit shortcut into production.

Completion: account and workspace screens use one design system while retaining real account behavior.

## 7. Verify and remove replaced code

During implementation, run the repository's build and applicable lint checks. Add meaningful integration coverage for the following where the test setup supports it:

- Login/signup success and failure.
- Dataset loading, empty/error states, filtering, and return navigation.
- CSV and SQLite upload paths as actually supported by the backend.
- Table switching, context retention, restored results, and stale async responses.
- Insight and aggregation pending, success, failure, and retry behavior.

Review keyboard focus, dialog focus return, readable contrast, reduced motion, 375px layouts, and zoom. Allow horizontal scrolling within wide table regions, not across the page.

Remove old components and CSS only after their replacements are in use. Delete redundant slogans, decorative summary panels, missing-token references, and obsolete global rules. Do not remove unrelated user changes.

Completion: the existing workflow remains usable with real backend responses, and no production route depends on prototype fixtures.

## Production exclusions

Do not migrate:

- Seeded sample datasets or simulated analysis as real user data.
- `?screen=` fixture initialization and artificial error/loading states.
- Canvas controls or artboard navigation into the product.
- Fake authentication or session-only memory behavior as a substitute for actual services.
- Unverified file limits, privacy statements, dates, or generated schema.

## Implementation order

1. Route/API mapping for the first milestone.
2. Shared tokens and controls.
3. Application shell.
4. Dataset library and upload.
5. Dataset workspace and analysis.
6. Supported insights destination and account screens.
7. Final workflow checks and removal of replaced code.

Migrate one functional screen at a time. Keep changes reviewable and preserve the original frontend entry point throughout.

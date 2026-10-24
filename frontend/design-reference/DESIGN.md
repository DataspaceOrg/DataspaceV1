# Dataspace design guide

This is the shared design reference and implementation plan for the frontend refactor. It applies to the workspace prototype in `index.html` and future implementation in the React frontend.

The direction is **clean, minimal, and functional**. Every visible element should help someone locate data, understand its state, or complete an action. Empty space is preferable to unnecessary copy or decoration.

The minimal copy and layout revision is applied to `index.html`. `canvas.html` presents the screen inventory below. The React frontend has not been migrated.

## 1. Scope and workflow

Preserve the core workflow:

1. Sign up or log in.
2. Upload a dataset.
3. Find and open a dataset.
4. Select a table and inspect its data or schema.
5. Add optional context and run an initial insight.
6. Continue to aggregation and review the results.

Navigation and presentation may improve. Do not silently change API contracts, file handling, session behavior, or the meaning of an analysis action.

The current prototype covers the dataset library, uploads, table inspection, and simulated analysis. Landing, login, and signup are design mockups accessible from the canvas; they do not authenticate or create accounts. Backend integration is not implemented. The original React frontend remains a separate reference.

## 2. Design principles

- **Content first.** Datasets, tables, and analysis results are the main content.
- **One clear hierarchy.** Give each screen a descriptive title, an obvious main task, and supporting information only where needed.
- **Minimal does not mean hidden.** Keep labels, errors, loading states, limitations, and necessary instructions visible.
- **Use space for separation.** Add a border or container only when it communicates grouping or interaction.
- **Repeat patterns, not information.** Reuse controls and layouts; avoid explaining the same thing in multiple places.
- **Show real state.** Counts, selection, progress, and results must come from the state used to render the interface.

The visual reference is the selected Apple-inspired system: neutral surfaces, deliberate typography, restrained blue actions, and limited depth. Use its restraint for a data tool; avoid turning workspace screens into marketing pages.

## 3. Product copy

### The inclusion rule

Keep text only if it does at least one of the following:

- Names a destination, object, field, or action.
- Reports useful data or state.
- Explains a non-obvious requirement or consequence.
- Helps someone recover from an error or empty state.
- Discloses a material limitation, such as simulated results or session-only uploads.

If removing a sentence changes neither understanding nor the next action, remove it. Do not replace filler with another slogan.

### Tone

Use short, direct language. Prefer familiar product terms: datasets, tables, preview, schema, insights, upload. Use sentence case and consistent terminology. Buttons name actions; headings name content. Avoid motivational language, conversational reassurance, unnecessary greetings, and decorative eyebrows.

### Changes to the current prototype

| Current copy | Planned treatment |
| --- | --- |
| “Thoughtfully organized. Ready when you are.” | Remove without replacement |
| “Your workspace, at your pace. Explore sample data or add your own.” | Remove the whole supporting block, including its decorative icon |
| “A clearer view starts here” | Remove |
| “Your data. In focus.” | Replace with “Datasets” |
| “A home for your datasets. A starting point for discovery.” | Remove |
| “A little space for big ideas.” | Remove |
| “A new perspective waiting.” | Remove; retain table count only if useful in context |
| “Make room for new insights.” | Replace with “Upload dataset” |
| “Get to know your data” | Remove; the table name and Preview/Schema controls provide context |
| “A fresh perspective on your data.” | Replace with “Analysis” |
| “A space for discovery.” | Replace with “Insights” |
| “Your initial insight is ready. Continue when you’re ready.” | Use “Initial insight complete” only where a status is needed |

Useful copy to retain:

- “CSV or SQLite · up to 20 MB” beside file selection, while that limit applies.
- “No datasets yet” with an Upload dataset action.
- “No matching datasets” with a Clear filters action.
- “Showing 5 of 6 rows” beside a preview.
- Specific errors with a remedy, such as “Include a header row and at least one data row.”
- A concise “Simulated” label attached to prototype analysis output.

Do not remove necessary disclosures to achieve a quieter screen. Place each disclosure near the affected action or result; avoid repeating a global prototype banner across every section. Never invent privacy, security, persistence, or AI capability claims.

## 4. Visual foundation

Use the selected design-system token names consistently. In the implementation, define shared values once rather than repeating literals throughout components. Map legacy `--ds-*` variables to the shared tokens during migration, then remove the aliases when no consumers remain.

| Role | Token | Value / usage |
| --- | --- | --- |
| Base canvas | `--bg` | `#ffffff` |
| Subtle surface | `--surface` | `#f5f5f7` |
| Intermediate surface | `--surface-warm` | `#fbfbfd`; use only when a third surface is useful |
| Main text | `--fg` | `#1d1d1f` |
| Secondary text | `--fg-2` | `#424245` |
| Supporting text | `--muted` | `#6e6e73`; confirm contrast against the actual surface |
| Standard border | `--border` | `#d2d2d7` |
| Inner divider | `--border-soft` | `#e8e8ed` |
| Primary action | `--accent` | `#0071e3` with `--accent-on: #ffffff` |
| Hover / active | `--accent-hover`, `--accent-active` | `#0077ed`, `#0066cc` |

Use blue for actions, focus, and meaningful selection. Use text and shape as well as color for status. Keep semantic colors limited to feedback, with contrast checked for their actual use. Do not use low-contrast token values for essential small text.

### Typography

- Display stack: SF Pro Display with Helvetica Neue and system sans-serif fallbacks.
- Body stack: SF Pro Text with system sans-serif fallbacks; use system-ui where needed for native font resolution. Do not assume proprietary font files are bundled.
- Body: 17px, line height approximately 1.5.
- Page title: 32px desktop, 28px mobile; weight 600.
- Section title: 21–24px; weight 600.
- Controls and compact metadata: 14px; do not shrink essential information to fit.
- Monospace: column names, types, identifiers, and code only.
- Use normal document sizing. Avoid a 10px root font size that unexpectedly shrinks rem-based utilities.
- Avoid broad selectors such as `.main-content p` that override component hierarchy.

The smaller application headings are an intentional adaptation of the reference system's larger marketing scale.

### Spacing and geometry

- Use the shared 4px/8px spacing scale: 4, 8, 12, 16, 20, 24, 32, and 48px.
- Standard page gutters: 32px desktop, 24px tablet, 16px mobile.
- Controls: 8px radius; grouped controls: 12px; substantial panels: up to 18px.
- Capsule buttons are optional for a standalone primary action, not the default shape of every control.
- Use 1px borders and flat surfaces by default. Reserve shadows for overlays or genuine elevation.
- Avoid gradients, glows, tilted decorative mockups, and nested cards without a functional reason.
- Keep primary content in normal grid/flex flow. Truncate variable dataset names only in lists; show full names in details.

## 5. Screen structure

### Dataset library

Reading order: page title and Upload dataset action → search and file-type filter → dataset list.

- Use “Datasets” as the page title.
- Put useful metadata in rows: name, format, table count, and date when available.
- Label sample datasets at the item level.
- Remove the decorative table illustration and motivational summary area.
- Remove large count tiles if the list or navigation already communicates those totals.
- Include a resume action only when supported by real recent activity; do not imply a previous session from a default selection.
- Preserve search and filters when returning from a dataset.

### Upload

- One file selection flow, with a visible label and supported formats.
- Display selected filename, readable size, and editable dataset name.
- Show validation next to the relevant input.
- Distinguish uploading from processing when the backend supports those states.
- On success, open the new dataset or offer one clear Open dataset action.
- Do not display fabricated tables or analysis for unparsed files.

### Dataset workspace

Reading order: dataset identity → table selection → Preview/Schema → Analysis.

- Keep the selected table clear and preserve context separately for each table.
- Default to readable data preview; keep schema available through a simple view switch.
- Do not put a large raw JSON block before the table selector.
- Use “Analysis” as the section title and retain the Initial insight → Aggregation sequence.
- Give running, complete, and failed actions distinct states.
- Keep errors local so a failed analysis does not replace the whole dataset screen.
- Keep results with their dataset and table. Mark simulated output explicitly.

### Insights

- Use “Insights” as the page title.
- Show dataset name, table name, analysis stage, and available result state.
- Empty state: “No insights yet” plus a direct way to select a dataset.
- Do not imply that output is saved across sessions unless persistence exists.

### Navigation and authentication

- Use a stable sidebar on desktop and compact labeled navigation on mobile.
- Avoid duplicate navigation rows that provide no additional orientation.
- Show only destinations with working behavior; do not ship a Settings button that merely highlights itself.
- In the later authentication pass, reuse the same fields, buttons, typography, and feedback patterns.

## 6. Interaction and accessibility

- Every control has a clear name and actual behavior.
- Show visible keyboard focus. Return focus after closing dialogs and preserve it after dynamic updates.
- Use persistent input labels; placeholders provide examples only.
- Primary touch targets are at least 44 × 44px.
- Body text contrast is at least 4.5:1; essential graphics and large text at least 3:1.
- Support 375px-wide screens and browser zoom without page-level horizontal scrolling. Wide tables may scroll inside a labeled region.
- Provide default, selected, loading, empty, error, success, and disabled states where relevant.
- Use restrained 150–220ms state transitions. Respect reduced-motion preferences.
- Preserve entered context and navigation state. Prevent duplicate analysis submissions while a request is pending.

## 7. Implementation plan

Steps 1 and the visual portion of step 2 are applied to the HTML prototype. Remaining production integration and verification work is still planned.

1. **Simplify the prototype.** Apply the copy decisions above, remove non-functional decoration and redundant summaries, and make Datasets, Upload dataset, and Analysis the main anchors.
2. **Consolidate the foundation.** Centralize tokens and reusable controls; correct typography, contrast, spacing, and responsive navigation.
3. **Complete the interaction model.** Preserve search and table context; refine upload validation, analysis progress, local errors, results, and return paths.
4. **Map production behavior.** Record routes, API payloads, response shapes, session handling, and intended upload variants before migrating the React screens. Resolve the aggregation action currently sharing the insight handler; do not invent a new endpoint.
5. **Migrate the React frontend incrementally.** Application shell → dataset library/upload → dataset workspace/analysis → authentication and landing page. Preserve the core workflow at each step.
6. **Verify during implementation.** Check keyboard use, mobile layouts, empty/error states, upload behavior, and workflow parity with actual backend responses. Label unresolved backend-dependent behavior rather than masking it.

The next implementation milestone is the remaining interaction work in step 3, followed by production behavior mapping. Prototype changes do not migrate the React application.

## 8. Review checklist

- Can someone identify the screen and primary action immediately?
- Does every sentence provide information or help complete a task?
- Are any counts, labels, headings, or instructions repeated unnecessarily?
- Does every panel or decorative element earn its space?
- Are useful metadata and necessary limitations still available?
- Are sample data and simulated analysis clearly distinguished from real results?
- Does the interface retain the upload → dataset → table → insight → aggregation workflow?
- Are shared tokens, readable text, keyboard focus, and responsive layouts preserved?

If a proposed change conflicts with this guide, record the reason and update the relevant rule explicitly rather than introducing a one-off pattern.


## 9. Screen inventory and canvas

Open `canvas.html` for the design board; open `index.html` for the interactive workspace. The board uses the same HTML screens at addressable `?screen=` entry points, rather than separate image copies. It is editable HTML, not a native Figma document.

### Access

- Landing: `index.html?screen=landing`
- Log in: `index.html?screen=login`
- Create account: `index.html?screen=signup`

### Dataset library

- Datasets: `index.html?screen=library`
- Empty library: `index.html?screen=library-empty`
- No search results: `index.html?screen=library-no-results`
- Loading datasets: `index.html?screen=library-loading`
- Load error: `index.html?screen=library-error`

### Upload

- Choose file: `index.html?screen=upload`
- File selected: `index.html?screen=upload-selected`
- Invalid file: `index.html?screen=upload-error`
- Processing file: `index.html?screen=upload-progress`
- Upload success: `index.html?screen=upload-success`

### Dataset workspace

- Table preview: `index.html?screen=detail`
- Table schema: `index.html?screen=schema`
- Initial insight running: `index.html?screen=analysis-loading`
- Initial insight complete: `index.html?screen=analysis-complete`
- Analysis error: `index.html?screen=analysis-error`
- Aggregation complete: `index.html?screen=aggregation`
- Unparsed SQLite: `index.html?screen=sqlite`

### Insights

- Analysis list: `index.html?screen=insights`
- Empty insights: `index.html?screen=insights-empty`

### Mobile

- Datasets · mobile: `index.html?screen=library` at 390 × 844px
- Upload · mobile: `index.html?screen=upload` at 390 × 844px
- Table workspace · mobile: `index.html?screen=detail` at 390 × 844px
- Insights · mobile: `index.html?screen=insights` at 390 × 844px

### Canvas controls

- Select a screen in the navigator to fit it into view.
- Use zoom buttons or Ctrl/Command + wheel to zoom around a point.
- Scroll or Space + drag to pan; touch devices use native scrolling.
- Use Fit all for the complete board or Fit screen for the selected artboard.
- Use an artboard's Open link to interact with its screen in a separate tab.
- Edit `index.html` to change product screens; edit `canvas.html` to change the board organization.

### Current boundaries

- Canvas frames are non-interactive previews; their Open links lead to interactive HTML screens.
- Loading, failure, and success artboards are addressable example states, not evidence of actual backend responses.
- Upload-selected and processing artboards show example file metadata; choose a real file in the normal upload flow to import CSV contents.
- Uploaded CSV data and analysis results are kept in memory for the current page session only.
- SQLite uploads remain unparsed; no real schema is inferred.
- Initial insight and aggregation outputs are simulated and labeled.
- Account forms validate required fields and open the sample workspace only. No credentials are submitted or stored.
- The page inventory covers the existing product journey and prototype insights destination. It does not introduce unrelated settings, billing, or administration flows.


## 10. Landing v2

The public React landing page and `landing-v2.html` use the new blue/navy direction. Workspace and account tokens remain unchanged. Landing tokens: canvas #F4F8FF, blue #205DCC, navy #102647, muted #526886, surface #EAF1FC, glass rgba(240,247,255,.58). The wordmark uses regular Georgia; headings and UI use system sans-serif.

The navbar contracts after 72px and expands below 16px. Its separate Get Started action appears only after the hero and format strip pass the header. Hero playback is Upload → Inspect → Insight, five seconds per stage, once; manual selection stops autoplay. The desktop workflow independently follows Upload → Schema → Initial insight while scrolling; mobile and reduced motion use manual stages. Reduced transparency and increased contrast use solid navigation backgrounds.

The canvas now contains 30 artboards, including five landing views: desktop introduction (frame-0), desktop compact navbar (frame-26), desktop workflow schema (frame-27), mobile introduction (frame-28), and mobile workflow schema (frame-29). Other screen references retain their existing design and prototype boundaries.

Reference views use `landing-v2.html?view=top|compact|workflow`. Canvas iframes also set `canvas=1` to disable autoplay and entrance animations. Open links omit that parameter for normal interaction. These parameters are reference-only and are not production routes. The legacy `index.html?screen=landing` entry redirects to the new reference.

Supported upload copy lists .csv, .db, and .sqlite; .sqlite supports schema inspection but not initial insights. Demonstrations use labeled sample data and illustrative output without API requests. Real application actions use signup or dashboard routes. Standalone authentication links require the frontend server; the canvas itself can still be opened as an HTML file.

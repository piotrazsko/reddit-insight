# Repository Coding Standards

## Core Principles
- **Never Lose User Data**: Always preserve existing user data during updates and migrations
- **Backward Compatibility**: Ensure new code works with existing data structures and APIs
- **Reuse First**: Always analyze existing components, hooks, and utilities before creating new ones
- **Functional Approach**: Prefer functional programming patterns and composition over classes
- **DRY (Don't Repeat Yourself)**: If similar structure exists, reuse and extend it
- **Search Before Create**: Use semantic search to find existing solutions in the codebase
- **Consistency**: Follow established patterns from existing similar components

## Project Scope (Canonical Overview)
AI-powered localization/translation management platform with:
* MCP (Model Context Protocol) integration
* Context‑aware AI translation + prompt management
* Multi-language + export formats
* Next.js 14 App Router (SSR + edge eligible pieces)
* Strict TypeScript
* Strong i18n discipline (all user text translated)

## Tech Stack (Authoritative List)
| Area | Choice | Notes |
| ---- | ------ | ----- |
| Framework | Next.js 14 App Router | Route groups ((auth)/(authorized)/(non-auth)) |
| Language | TypeScript 5.1.6 (strict) | No `any`; leverage discriminated unions |
| UI | MUI v5 | Theming + components; prefer sx for dynamic, SCSS module for structural |
| State | Redux Toolkit + Redux Saga | Slice co-location; sagas for side effects |
| i18n | i18next / react-i18next / next-i18next | All user-facing text must use `t()` |
| Auth | Firebase Auth | Guard authorized routes; never leak tokens client logs |
| Data | Firebase (+ AsyncStorage persistence) | Preserve backward compatibility in migrations |
| Styling | SCSS modules + Emotion (MUI) | SCSS for component scope, sx for runtime variants |
| Analytics | Custom tracker | Fire in effects; never block UX |
| AI / MCP | MCP integration | Reuse existing prompt & context utilities |

## Development Workflow
1. **Analyze**: Search codebase for similar functionality before starting
2. **Reuse**: Use existing components, hooks, and utilities when possible
3. **Extend**: If existing code is close but not exact, extend it
4. **Create**: Only create new code when nothing similar exists
5. **Document**: Add JSDoc comments for complex or reusable logic

## Build & Run Policy
- **DO NOT** attempt to build or run the project automatically
- **DO NOT** execute build commands (`npm run build`, `expo build`, etc.)
- **DO NOT** start the development server automatically
- The developer will handle all builds and runs manually

## Documentation Policy
- **Don't Over-Document**: Do NOT create documentation files after every small update
- **Document When Needed**: Only create docs for:
  - Controversial or non-obvious architectural decisions
  - Complex features requiring explanation
  - Breaking changes or major refactors
  - New patterns being introduced to the codebase
- **Prefer Code Comments**: Use JSDoc and inline comments for most documentation needs
- **Keep Existing Docs Updated**: Update existing documentation rather than creating new files

## Commit Standards
- Use Conventional Commits format
- Keep PRs small and focused
- Update `CHANGELOG.md` in every release PR

## Common Commands
```bash
# Development
npm run dev                                      # Dev server (Next.js)
npm start                                        # Production server

# Code Quality
npm run lint                                     # ESLint

# Building
npm run build                                    # Production build
```

## File Organization (Single Source of Truth)
High-level layout (details for per-component patterns live in `frontend.instructions.md`):
* `src/app/` – App Router entries, minimal logic, compose containers
* `src/components/` – Pure, reusable UI units (presentational + light hooks)
* `src/containers/` – Feature orchestration (data + components)
* `src/modules/` – Redux slices, sagas, selectors, feature domain logic
* `src/modules/hooks/` – Cross-feature reusable hooks
* `src/providers/` – Context providers & composition
* `src/helpers/` – Narrow, stateless helpers (formatting, parsing)
* `src/utils/` – General-purpose utilities (pure, tested)
* `src/constants/` – Enumerations, string constants, maps
* `src/styles/` – Global styles/theme overrides
* `localizations` (managed) – Translation assets (managed via app tooling)
* Tests colocated (`*.test.ts(x)`) near source

Avoid duplicating structural diagrams elsewhere; link back here.

## Architecture & Project Structure (Detailed)

This section is the authoritative map of how the app is organized and how data flows through it.

### App Router (src/app)
- Route groups: `(auth)`, `(authorized)`, `(non-auth)` to control access and layout separation
- Conventions per route: `page.tsx` (entry), `layout.tsx` (composition), `loading.tsx`, `error.tsx`, `not-found.tsx`
- SEO assets: `robots.ts`, `sitemap.ts`, `manifest.ts`, OpenGraph image routes (e.g., `opengraph-image.tsx`)
- Keep pages thin; orchestrate via containers and providers

### UI Layers
- `src/components/`
  - Pure, reusable presentational units; localized via `useTranslation()`
  - Folder per component: `ComponentName/index.tsx`, `ComponentName.module.scss`, optional `types.ts`
  - Use MUI primitives; SCSS modules for structural styles; `sx` for dynamic variants
- `src/containers/`
  - Feature composition: fetch/select state, wire actions, assemble components
  - No global side effects here; delegate to sagas, hooks, or services

### State & Domain (src/modules)
- Structure per feature (example):
  - `modules/<feature>/slice.ts` – RTK slice (actions + reducers)
  - `modules/<feature>/saga.ts` – Side effects and watchers
  - `modules/<feature>/selectors.ts` – Memoized selectors
  - `modules/<feature>/types.ts` – Domain types (if not colocated)
  - `modules/<feature>/api.ts` – Feature-scoped API calls (fetch layer)
- Cross-feature hooks in `modules/hooks/`
- Root saga/store setup colocated in `modules/` (follow existing pattern)
- Rules:
  - Components dispatch actions/select state; sagas perform IO
  - Keep reducers pure and serializable; no side effects in reducers
  - Prefer `createSlice`, `createSelector`, and typed helpers

### i18n
- Libraries: `i18next`, `react-i18next`, `next-i18next`
- All visible strings via `t('<namespace>.<key>')`
- Localization management is handled via MCP "goman live"; use MCP flows to create, update, and delete keys (do not hardcode or edit JSON directly in code)
- Keep keys stable; use nested namespaces for feature organization
- On code removal/refactors: audit and remove obsolete localization keys via MCP to prevent drift and dead strings

### Providers (src/providers)
- Compose app-level providers (Theme, Redux, I18n, Snackbar/Toasts, Analytics)
- Keep provider composition minimal in `src/app/layout.tsx`; extract to `providers/` to avoid page bloat

### Utilities & Helpers
- `src/utils/` – General-purpose, pure utilities (string/date/format)
- `src/helpers/` – Narrow helpers with light domain awareness (parsing, mapping)
- `src/constants/` – Enumerations, string constants, and maps used across features

### Styles
- SCSS Modules co-located with components for structural styles
- MUI Theme overrides and global styles in `src/styles/`
- Use CSS variables for theme values where helpful

### Assets & Public
- `src/assets/` – Fonts, images, content artifacts
- `public/` – Static files served directly
- `error_pages/` – Static error/maintenance pages used by hosting provider

### Config
- `next.config.js`, `next.config.seo.js` – Next.js config and SEO helpers
- `tsconfig.json` – Path aliases (use `@/` → `src/`), strict TS
- `env.json` – Environment defaults (do not commit secrets)

### Testing
- Tests colocated as `*.test.ts(x)` beside the source
- Prefer testing logic (selectors, helpers, hooks) and critical UI behaviors

### Data Flow (High level)
UI (components) → Containers (wire state/props) → Redux actions → Sagas (IO/side effects) → APIs/Firebase → Reducers update store → Selectors derive view state → UI renders.

## Key Guidelines (Non-Duplicative Summary)
1. Translate everything: no raw literals in UI – enforce via reviews.
2. Strict TypeScript: prefer union types + generics over `any` / broad `unknown`.
3. Functional composition: hooks + pure helpers; no classes.
4. Import hygiene: use `@/` alias; group external → internal; avoid deep relative chains (`../../..`).
5. Redux Toolkit: actions via slices; side effects isolated in sagas; memoized selectors.
6. Styling: structural styles via SCSS module; ephemeral responsive/dynamic via `sx`.
7. Performance: memoize list items; stable callbacks; suspense-friendly async patterns.
8. Accessibility: semantic MUI primitives + ARIA where needed.
9. Error safety: never swallow errors; surface user-friendly notifications; log concise technical detail.
10. Backward compatibility: schema/data migrations additive unless flagged & versioned.

For granular component authoring conventions see `frontend.instructions.md` (kept lean to avoid repetition).
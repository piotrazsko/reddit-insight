---
applyTo: "**/*.{ts,tsx}"
---

# Frontend Development Instructions - Goman Live

This document extends the repository-wide standards in `.github/copilot-instructions.md` and focuses specifically on day-to-day TypeScript/React/MUI patterns. For high-level architecture and flow see the new "Architecture & Project Structure" section in the main standards.

## Quick Structure Map (Reference)
```
src/
  app/                # Next.js App Router entries (route groups, thin pages)
  components/         # Pure presentational units (SCSS + MUI)
  containers/         # Feature composition (state wiring + assembly)
  modules/            # Domain slices, sagas, selectors, feature logic
    hooks/            # Cross-feature reusable hooks
  providers/          # App/provider composition (Theme, I18n, Redux, etc.)
  helpers/            # Narrow domain-aware helpers
  utils/              # Pure general-purpose utilities
  constants/          # Enums, string constants, frozen maps
  styles/             # Global theme and style overrides
  assets/             # Fonts, images, content
  localizations/      # Managed translation assets (do not hardcode literals)
```
Use this map for quick orientation; authoritative detail lives in `.github/copilot-instructions.md`.

## Essentials

1) TypeScript
- Strict types, no `any`; use discriminated unions and generics
- Export reusable types; keep reducers pure and serializable

2) i18n
- All user text must use `useTranslation()`/`t()`; no literals
- Manage localization exclusively via MCP "goman live" flows (create/update/delete); don’t edit JSON directly in code
- When removing or refactoring features, audit and remove unused localization keys in MCP to avoid dead strings

3) Styling
- Structural styles in `*.module.scss`; dynamic/responsive via MUI `sx`
- Co-locate styles with the component; prefer CSS variables for theme values

4) Components & Structure
- Folder: `ComponentName/index.tsx` + `ComponentName.module.scss` (+ `types.ts` if needed)
- Presentational in `src/components`; orchestration in `src/containers`
- Use `@/` imports; components do not perform IO—sagas/hooks do

5) State & Side Effects
- Use Redux Toolkit slices + sagas; selectors via `createSelector`
- Side effects only in sagas/hooks; never inside reducers or components

## Performance (quick)
- Memoize list items (`memo`); stable handlers with `useCallback`
- Virtualize large lists; avoid recreating heavy objects each render
- Use memoized selectors; avoid unnecessary re-renders

## Accessibility (quick)
- Semantic MUI primitives; ARIA for interactive elements
- Keyboard interaction and focus management for controls/dialogs

## Error handling (quick)
- Wrap async with try/catch; never swallow errors
- Show user-friendly notifications; log concise technical details

## Minimal component skeleton
```tsx
import { memo, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import styles from './MyComp.module.scss';

interface Props { id: string; onSelect?: (id: string) => void; disabled?: boolean }

export const MyComp = memo<Props>(({ id, onSelect, disabled }) => {
  const { t } = useTranslation();
  const handleClick = useCallback(() => !disabled && onSelect?.(id), [disabled, id, onSelect]);
  return (
    <Box className={styles.container}>
      <Typography>{t('common.title')}</Typography>
      <Button onClick={handleClick} disabled={disabled}>{t('common.select')}</Button>
    </Box>
  );
});
MyComp.displayName = 'MyComp';
```

## Short review checklist
- [ ] No literals; all text via `t()`
- [ ] Strict types; no `any`
- [ ] SCSS modules for structure; `sx` for dynamics
- [ ] Component folder structure respected
- [ ] Stable handlers / memo where needed
- [ ] Accessibility basics covered
- [ ] Errors handled; no unhandled promises
- [ ] Selectors memoized; no IO in components

Pointers: For full architecture, data flow, and deeper conventions see `.github/copilot-instructions.md`.

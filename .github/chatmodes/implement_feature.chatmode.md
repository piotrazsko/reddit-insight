description: 'Guidelines for implementing new features and extending functionality in the Goman Live app.'
model: Claude Sonnet 4.5
tools: [
        'edit',
        'search',
        'vscodeAPI',
        'problems',
        'changes',
        'todos',
        'goman-mcp/*',
    ]
---

In this mode:

- Analyze existing code structure and patterns before implementing
- Reuse existing components, hooks, and utilities wherever possible
- Extend existing functionality rather than duplicating code
- Maintain backward compatibility and data integrity
- Focus on clean, maintainable, and testable code
- Follow established patterns and conventions
- Use the configured MCP server (id: mcp-server-3525db95) for localization management

# Goman Live - Feature Implementation Guidelines

When implementing new features or extending functionality in the Zaspa Baby Tracker app, follow these guidelines to ensure consistency and quality.

## Before Implementation

1. **Search First**: Use semantic search to find similar existing functionality
2. **Analyze Patterns**: Study how similar features are implemented (Next.js App Router, MUI, Redux Toolkit, i18next)
3. **Check Dependencies**: Identify existing hooks, components, selectors, and sagas you can reuse
4. **Plan Structure**: Determine which app routes, containers, modules, and components need updates
5. **i18n Keys**: Plan localization keys following existing naming patterns

## Implementation Principles

-   **Reuse First**: Always check if similar functionality exists before creating new code
-   **Extend, Don't Duplicate**: If something similar exists, extend it rather than copying
-   **Functional Components**: Use functional components with hooks (no class components)
-   **Type Safety**: Write TypeScript with strict types, avoid `any`
-   **Data Safety**: Never lose or corrupt existing user data
-   **Backward Compatible**: Ensure new code works with existing data structures
-   **Composition**: Prefer small, composable functions and components

## Implementation Workflow

1. **Search**: Find similar components/hooks/sagas/selectors in the codebase
2. **Reuse**: Use existing utilities, types, and patterns
3. **Create**: Build new code following established conventions
4. **Localize**: Add i18n keys for all user-facing text
5. **Type**: Add proper TypeScript types and interfaces
6. **Test**: Verify functionality
7. **Document**: Add JSDoc comments for complex logic

## Common Patterns to Follow

-   Custom hooks in `src/modules/hooks/` for shared logic
-   Reusable presentational components in `src/components/`
-   Feature orchestration in `src/containers/`
-   Redux slices/sagas/selectors in `src/modules/`
-   Utilities in `src/utils/` and helpers in `src/helpers/`
-   Use `useTranslation()` + `t()` for all displayed text
-   Use `useAnalytics` hook for tracking (non-blocking)
-   Use Firebase for auth/data (preserve backward compatibility)
-   Use Next.js App Router for navigation

## Feature Checklist

-   [ ] Searched for similar existing functionality
-   [ ] Reused existing components/hooks/sagas where possible
-   [ ] All user-facing text uses i18n keys
-   [ ] TypeScript types are complete and accurate
-   [ ] Data persistence works correctly
-   [ ] Backward compatible with existing data
-   [ ] App Router integration correct
-   [ ] Analytics tracking added (if applicable)
-   [ ] Code follows project conventions

## After Implementation

-   Don't create documentation files for minor features
-   Only document controversial decisions or complex architectures
-   Add JSDoc comments for complex or reusable logic
-   Update existing documentation if making architectural changes
-   Test thoroughly

Note: For foundational standards and detailed frontend conventions, see `.github/copilot-instructions.md` and `.github/instructions/frontend.instructions.md`.

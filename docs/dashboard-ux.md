Dashboard UX — Component Boundaries & Behavior

Overview

This document defines compact component responsibilities, props, behavior and accessibility constraints so multiple implementers can work in parallel on the Dashboard.

Component specs (responsibilities, props, behavior)

1) MachineSelector
- Responsibility: Choose a machine/plan; lightweight search/filter; expose selected id.
- Props (example):
  - selectedId?: string
  - machines: Array<{ id: string; name: string; type?: string }>
  - onSelect: (id: string) => void
- Expected behavior: keyboard navigable list (arrow up/down, Enter to select), clear visual focus, support type-to-search. Emits onSelect(id) on selection.
- File: src/components/MachineSelector.tsx

2) SessionEditor
- Responsibility: Top-level editor for a session: date, machine, sets list; manages unsaved state and validation.
- Props (example):
  - session?: { id?: string; date: string; machineId: string; sets: SetRowData[] }
  - onChange: (sessionPatch: Partial<any>) => void
  - onSave: () => Promise<void>
- Expected behavior: exposes add/remove set actions, validates required fields, blocks save when invalid and focuses first invalid field.
- File: src/components/SessionEditor.tsx

3) SessionTable
- Responsibility: Display a session's sets in a table-like list; owns editing concentration (delegates row editing to SetRow).
- Props (example):
  - sets: SetRowData[]
  - onUpdateSet: (index: number, set: SetRowData) => void
  - onRemoveSet: (index: number) => void
- Expected behavior: keyboard and touch friendly; rows reflow to single column on narrow viewports.
- File: src/components/SessionTable.tsx

4) SetRow
- Responsibility: Single set controls (reps, weight, RPE, rest); small, focused, easily reorderable.
- Props (example):
  - set: SetRowData
  - index: number
  - onChange: (s: SetRowData) => void
  - onFocusNext?: () => void
- Expected behavior: numeric inputs with proper step, Enter moves focus to next input, arrow keys adjust values optionally.
- File: src/components/SetRow.tsx

5) SaveSessionButton
- Responsibility: Persist session; show busy/error states and prevent duplicate saves.
- Props (example):
  - disabled?: boolean
  - saving?: boolean
  - onSave: () => Promise<void>
- Expected behavior: disabled when invalid/disabled prop; show spinner when saving; announce success/failure via live region.
- File: src/components/SaveSessionButton.tsx

6) LastSessionSummary
- Responsibility: Read-only snapshot of last session (date, top-sets, quick compare); link to load.
- Props (example):
  - summary: { date: string; topSets: Array<{ exercise:string; top:number }> }
  - onLoad: () => void
- Expected behavior: tap/click on summary loads into editor; compact card that collapses to icon-only on very small widths.
- File: src/components/LastSessionSummary.tsx

Responsive behavior matrix & breakpoints
- Recommended breakpoints (mobile-first):
  - Mobile portrait: up to 420px — stacked single-column; SessionTable shows rows as cards.
  - Mobile landscape: 421px–767px — 2-up where space permits; condensed controls.
  - Tablet/desktop: 768px+ — multi-column layout: editor (2fr) + LastSessionSummary/controls (1fr).
- CSS strategy: mobile-first, use Grid for desktop layouts and Flexbox for row alignment.

Accessibility notes
- Keyboard: full keyboard navigation (Tab order respects visual order), arrow keys within lists, Enter to confirm, Esc to cancel editing a row.
- Focus: moving between sets should preserve logical order; on validation error focus the first invalid field and announce error.
- ARIA: role="list" for tables rendered as lists, role="listitem" for rows; MachineSelector options use role="option" and aria-selected; Save button includes aria-busy when saving.
- Touch targets: minimum 44x44px for actionable controls; spacing around rows to avoid mis-taps.

Implementation priorities (short)
1. Shared tokens & responsive breakpoints.
2. SessionEditor + validation (owner of save flow).
3. SetRow and SessionTable behaviors.

Notes
- Keep components purely presentational where possible; lift state to SessionEditor for save flow and optimistic UI.
- Use the existing component files listed under src/components/ to implement these boundaries.
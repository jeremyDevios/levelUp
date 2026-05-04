# Dashboard UI - Presentational Components (Examples & integration notes)

This document contains short usage examples and recommended class names / variants for integrating the new presentational components into the Dashboard.

Primary colors & tokens
- Primary color is exposed via CSS tokens in src/styles/globals.css (e.g. `--color-primary`, `--gradient-primary`).
- Utility helper `.bg-primary-gradient` is provided for gradient text/background.

Components created / updated in sprint4
- src/components/ui/SessionEditor.tsx (mobile-first editor cards + desktop table)
- src/components/ui/MachineItem.tsx (machine list item with thumbnail)
- src/components/ui/BigSaveButton.tsx (prominent save CTA, mobile fixed)
- src/components/ui/SessionDetailCard.tsx (modal with delete confirmation)
- src/components/ui/Toast.tsx (variant + accessible role + dismiss)

General rules
- All components are presentational (props-only). Provide event handlers and data mapping in container components.
- Mobile-first: components render stacked/card UI on small screens and table/layout on md+.
- Dark mode: respects `.dark` tokens defined in globals.css.
- Reuse exported class objects (e.g. `setRowClasses`, `sessionTableClasses`) for consistent styling when integrating.

Example: SessionEditor (basic)

```jsx
import SessionEditor from 'src/components/ui/SessionEditor'

export default function Page() {
  const handleSetsChange = (sets) => console.log('sets', sets)

  return (
    <SessionEditor
      initialSets={[{ id: 's1', reps: 8, weight: 60, note: 'warmup', restSeconds: 60 }]}
      userWeightKg={82}
      onChange={handleSetsChange}
    />
  )
}
```

Notes:
- Mobile: renders as stacked editable cards. Desktop (md+) renders as a compact table row per set.
- Accessible labels are provided for inputs and buttons. Keyboard focus ring is visible.

Example: BigSaveButton (basic)

```jsx
import BigSaveButton from 'src/components/ui/BigSaveButton'
import { useState } from 'react'

export default function Page() {
  const [state, setState] = useState('idle')

  async function save() {
    setState('saving')
    // call API
    await new Promise((r) => setTimeout(r, 800))
    setState('success')
    setTimeout(() => setState('idle'), 1500)
  }

  return <BigSaveButton state={state} onClick={save} />
}
```

Screenshot guidance
- Take mobile screenshots (narrow width) showing stacked cards and the floating big save CTA at bottom.
- Take a desktop screenshot (md+ breakpoint) showing the compact table layout and the save CTA in-flow.

Design tokens
- Colors and small palette tokens for charts/heatmap were added to `src/styles/tokens.ts`.

Accessibility
- SessionDetailCard uses role="dialog" for modal variant. Toast component exposes `role` and `onClose` for accessible announcements.

Suggested commit message (include Co-authored-by trailer)

feat(ui): dashboard polish – session editor, big CTA, machine item, confirmation UI

Co-authored-by: Designer <designer@example.com>

---

If you need additional variants (compact, dense, or action-only rows) I can add small prop-driven variants that remain presentation-only (no business logic).

# History UI - Presentational components

This file documents the presentational UI components available for Sprint 3 (History, Weights, Settings). These components are presentational only — they accept props and render UI. Business logic (data fetching, event handling) should be implemented by the Coder.

## Components

- HistoryChart — src/components/ui/HistoryChart.tsx
- CalendarDay — src/components/ui/CalendarDay.tsx
- WeightChart — src/components/ui/WeightChart.tsx
- WeightForm — src/components/ui/WeightForm.tsx
- SessionDetailCard — src/components/ui/SessionDetailCard.tsx

## Tokens

Chart colors and tokens are exported from src/styles/tokens.ts under `tokens.chart` and reference CSS variables from globals.css where appropriate.

## Usage examples

HistoryChart (sparkline/full):

```jsx
import HistoryChart from '../components/ui/HistoryChart';

const data = [
  { x: '2026-04-01', y: 70 },
  { x: '2026-04-05', y: 71 },
  { x: '2026-04-10', y: 70.2 },
  { x: '2026-04-15', y: 69.8 },
];

<HistoryChart data={data} height={96} variant="full" ariaLabel="Weight history" />
```

CalendarDay (heat/indicator):

```jsx
import CalendarDay from '../components/ui/CalendarDay';

// intensity 0..1
<CalendarDay date={new Date()} intensity={0.6} onClick={() => console.log('clicked')} />
```

WeightChart (mini sparkline for weight):

```jsx
import WeightChart from '../components/ui/WeightChart';

const wdata = [
  { x: 1, y: 72.5 },
  { x: 2, y: 72.0 },
  { x: 3, y: 71.8 },
];

<WeightChart data={wdata} height={48} />
```

WeightForm (presentational):

```jsx
import WeightForm from '../components/ui/WeightForm';

<WeightForm
  initialWeight={72.3}
  onSubmit={(w) => console.log('save', w)}
  onCancel={() => console.log('cancel')}
/>
```

SessionDetailCard (modal-like card):

```jsx
import SessionDetailCard from '../components/ui/SessionDetailCard';

<SessionDetailCard title="Leg Day" date={'2026-04-20'} sets={[{ reps: 8, weight: 80 }]} onClose={() => setOpen(false)} />
```

---

Commit suggestion:

```
feat(ui): history & weight presentational components

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

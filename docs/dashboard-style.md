# Dashboard — Style Guide

This short guide describes tokens, spacing, typography and component variants for the Dashboard UI. Files:
- src/styles/components/dashboard.css — component styles + tokens (mobile-first)

Principles
- Mobile-first, responsive to md (>= 768px) where cards convert to horizontal rows.
- Glassy "liquid glass" panels using backdrop-filter + translucent panel backgrounds.
- Primary brand color uses a warm orange gradient: #F4941A → #FFB86B.
- Provide high contrast accessible states for dark and light via .dark class.

Tokens
- Spacing: 4 / 8 / 12 / 16 / 24 / 32 px (CSS vars: --space-0 .. --space-5)
- Radii: --radius-sm (8px), --radius-md (14px), --radius-lg (20px)
- Type: base 16px (--fs-base), small 14px (--fs-sm), large 18px (--fs-lg), xl 22px (--fs-xl)
- Font family: system stack (var --font-family)

Color roles (light / dark)
- Background: --bg (light: #F6F7F9, dark: #0B0F13)
- Panels: --panel-bg (translucent glass)
- Text: --text
- Muted: --muted
- Accent / Primary: gradient (--primary-start/--primary-end)
- Success / Danger tokens provided for badges/buttons

Button Variants
- .lu-btn base: rounded, medium weight, focus ring for accessibility.
- .lu-save-btn (primary): gradient background, white text, prominent shadow.
- .lu-save-btn.secondary: transparent, colored border/text for secondary actions.

Spacing & Layout
- Use .lu-container as the page wrapper with consistent padding.
- Use .lu-header as a compact glassy header; it supports a small accent strip.
- Session lists are .lu-session-table with .lu-session-card for each item on mobile.
- On wider screens (.md) session cards are laid out horizontally to mimic table rows.

Accessibility
- Focus outlines are visible and meet contrast requirements with a soft accent ring.
- Reduced motion respected via prefers-reduced-motion media query.

Developer notes / examples
- The CSS includes small examples showing how to assemble components; classes are intentionally short and semantic: .lu-container, .lu-header, .lu-machine-select, .lu-session-table, .lu-set-row, .lu-save-btn etc.
- It's compatible with Tailwind utility classes; the provided CSS acts as a fallback in case Tailwind doesn't generate every utility.

Example markup (copyable):

<div class="lu-container">
  <header class="lu-header">
    <div>
      <div class="lu-title">Dashboard</div>
      <div class="lu-subtitle">Your recent sessions</div>
    </div>
    <div class="lu-controls">
      <div class="lu-machine-select">
        <button class="lu-machine-pill active">All</button>
        <button class="lu-machine-pill">Bike</button>
      </div>
      <button class="lu-btn lu-save-btn">Save</button>
    </div>
  </header>

  <div class="lu-session-table">
    <article class="lu-session-card">
      <div class="lu-session-meta">
        <div class="lu-session-title">Leg Day</div>
        <div class="lu-session-sub">3 sets • 40 min</div>
      </div>
      <div class="lu-set-row">
        <div class="lu-set-item">3x8 70kg</div>
        <div class="lu-set-item">AMRAP</div>
      </div>
    </article>
  </div>
</div>

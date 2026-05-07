import React from 'react'

export type MuscleId =
  | 'deltoid' | 'pectoral' | 'bicep' | 'forearm'
  | 'abs' | 'oblique' | 'quad' | 'tibialis'
  | 'trapezius' | 'rear_deltoid' | 'lat' | 'tricep'
  | 'lower_back' | 'glute' | 'hamstring' | 'calf'

const CATEGORY_MUSCLES: Record<string, MuscleId[]> = {
  epaules:    ['deltoid', 'rear_deltoid', 'trapezius'],
  dos:        ['lat', 'trapezius', 'lower_back', 'rear_deltoid'],
  pectoraux:  ['pectoral', 'deltoid', 'tricep'],
  abdominaux: ['abs', 'oblique'],
  biceps:     ['bicep', 'forearm'],
  triceps:    ['tricep'],
  fesses:     ['glute', 'hamstring'],
  cuisses:    ['quad', 'hamstring', 'glute'],
  mollets:    ['calf', 'tibialis'],
  cardio:     ['quad', 'hamstring', 'calf', 'glute'],
}

const MACHINE_MUSCLES: Record<string, MuscleId[]> = {
  'shoulder-press':              ['deltoid', 'rear_deltoid', 'trapezius'],
  'vertical-traction':           ['lat', 'bicep', 'trapezius', 'rear_deltoid'],
  'vertical-traction-pectoraux': ['pectoral', 'lat', 'bicep'],
  'vertical-traction-biceps':    ['bicep', 'lat', 'forearm'],
  'low-row':                     ['lat', 'lower_back', 'bicep', 'rear_deltoid'],
  'lower-back':                  ['lower_back', 'glute', 'hamstring'],
  'chest-press':                 ['pectoral', 'tricep', 'deltoid'],
  'chest-press-triceps':         ['tricep', 'pectoral'],
  'wide-chest-press':            ['pectoral', 'deltoid'],
  'pectoral':                    ['pectoral'],
  'dips-assistes':               ['tricep', 'pectoral', 'deltoid'],
  'total-abdominal':             ['abs', 'oblique'],
  'abdominal-crunch':            ['abs'],
  'rotary-torso':                ['oblique', 'abs'],
  'pure-biceps':                 ['bicep', 'forearm'],
  'arm-curl':                    ['bicep', 'forearm'],
  'arm-extension':               ['tricep'],
  'leg-extension':               ['quad'],
  'leg-curl':                    ['hamstring'],
  'leg-press':                   ['quad', 'glute', 'hamstring'],
  'leg-press-mollets':           ['calf'],
  'adducteur-abducteur':         ['quad', 'glute'],
  'adductor':                    ['quad'],
  'abductor':                    ['glute', 'quad'],
  'abductor-cuisses':            ['glute', 'quad'],
  'cage-a-squat':                ['quad', 'glute', 'lower_back', 'hamstring'],
  'squats':                      ['quad', 'glute', 'hamstring'],
  'hip-thrust':                  ['glute', 'hamstring', 'lower_back'],
  'glute':                       ['glute', 'hamstring'],
  'climber':                     ['quad', 'glute', 'calf', 'abs'],
  'climber-cardio':              ['quad', 'glute', 'calf', 'abs'],
  'planche':                     ['abs', 'oblique', 'lower_back', 'deltoid', 'tricep'],
  'excite-recline':              ['quad', 'glute', 'hamstring'],
  'wave':                        ['lat', 'tricep', 'deltoid', 'bicep'],
  'velo':                        ['quad', 'hamstring', 'calf', 'glute'],
  'velo-elliptique':             ['quad', 'hamstring', 'calf', 'glute'],
  'rameur':                      ['lat', 'lower_back', 'hamstring', 'glute', 'bicep'],
  'marches-infinies':            ['quad', 'glute', 'hamstring', 'calf'],
  'tapis-de-course':             ['quad', 'hamstring', 'calf', 'glute'],
}

export function getMusclesForMachine(machineId: string, category: string): MuscleId[] {
  return MACHINE_MUSCLES[machineId] ?? CATEGORY_MUSCLES[category] ?? []
}

// ─── Highlight ellipses on the anatomy image (1024×1024) ────────────────────
// Front figure occupies roughly x: 50–490, back figure x: 530–980
// Each ellipse = { cx, cy, rx, ry } in image pixel space
type E = { cx: number; cy: number; rx: number; ry: number }

const HIGHLIGHTS: Record<MuscleId, E[]> = {
  // ── FRONT VIEW ──────────────────────────────────────────────────────────────
  deltoid: [
    { cx: 148, cy: 255, rx: 36, ry: 50 },   // left shoulder
    { cx: 382, cy: 255, rx: 36, ry: 50 },   // right shoulder
  ],
  pectoral: [
    { cx: 208, cy: 305, rx: 60, ry: 55 },
    { cx: 322, cy: 305, rx: 60, ry: 55 },
  ],
  bicep: [
    { cx: 118, cy: 345, rx: 26, ry: 62 },
    { cx: 412, cy: 345, rx: 26, ry: 62 },
  ],
  forearm: [
    { cx:  94, cy: 515, rx: 22, ry: 62 },   // front
    { cx: 436, cy: 515, rx: 22, ry: 62 },
    { cx: 582, cy: 516, rx: 22, ry: 62 },   // back
    { cx: 938, cy: 516, rx: 22, ry: 62 },
  ],
  abs: [
    { cx: 265, cy: 408, rx: 45, ry: 90 },
  ],
  oblique: [
    { cx: 165, cy: 452, rx: 28, ry: 70 },
    { cx: 365, cy: 452, rx: 28, ry: 70 },
  ],
  quad: [
    { cx: 202, cy: 710, rx: 56, ry: 108 },
    { cx: 328, cy: 710, rx: 56, ry: 108 },
  ],
  tibialis: [
    { cx: 165, cy: 900, rx: 19, ry: 50 },
    { cx: 365, cy: 900, rx: 19, ry: 50 },
  ],
  calf: [
    { cx: 186, cy: 902, rx: 23, ry: 48 },   // front
    { cx: 344, cy: 902, rx: 23, ry: 48 },
    { cx: 682, cy: 912, rx: 33, ry: 62 },   // back
    { cx: 838, cy: 912, rx: 33, ry: 62 },
  ],

  // ── BACK VIEW ───────────────────────────────────────────────────────────────
  trapezius: [
    { cx: 760, cy: 222, rx: 105, ry: 62 },
  ],
  rear_deltoid: [
    { cx: 634, cy: 240, rx: 38, ry: 52 },
    { cx: 886, cy: 240, rx: 38, ry: 52 },
  ],
  lat: [
    { cx: 634, cy: 398, rx: 44, ry: 86 },
    { cx: 886, cy: 398, rx: 44, ry: 86 },
  ],
  tricep: [
    { cx: 604, cy: 340, rx: 26, ry: 65 },
    { cx: 916, cy: 340, rx: 26, ry: 65 },
  ],
  lower_back: [
    { cx: 760, cy: 498, rx: 42, ry: 52 },
  ],
  glute: [
    { cx: 706, cy: 620, rx: 60, ry: 66 },
    { cx: 814, cy: 620, rx: 60, ry: 66 },
  ],
  hamstring: [
    { cx: 690, cy: 746, rx: 48, ry: 90 },
    { cx: 830, cy: 746, rx: 48, ry: 90 },
  ],
}

// ─── Muscle name labels ───────────────────────────────────────────────────────
const MUSCLE_LABELS: Record<MuscleId, string> = {
  deltoid: 'Épaules', pectoral: 'Pectoraux', bicep: 'Biceps', forearm: 'Avant-bras',
  abs: 'Abdominaux', oblique: 'Obliques', quad: 'Quadriceps', tibialis: 'Tibialis',
  trapezius: 'Trapèzes', rear_deltoid: 'Deltoïdes post.', lat: 'Dorsaux', tricep: 'Triceps',
  lower_back: 'Lombaires', glute: 'Fessiers', hamstring: 'Ischio-jambiers', calf: 'Mollets',
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MuscleDiagram({
  machineId,
  category,
}: {
  machineId?: string
  category?: string
}) {
  const muscles = getMusclesForMachine(machineId ?? '', category ?? '')
  const activeSet = new Set<MuscleId>(muscles)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}
    >
      <p className="text-[9px] font-bold tracking-widest px-3 pt-3 pb-1" style={{ color: 'var(--muted)' }}>
        MUSCLES SOLLICITÉS
      </p>

      {/* Image + SVG overlay — full image, centered with side margins */}
      <div className="flex justify-center px-6 pb-1">
      <div style={{ position: 'relative', width: '82%' }}>
        <img
          src="/muscles-diagram.jpg"
          alt="Anatomie musculaire"
          style={{ width: '100%', display: 'block', borderRadius: 8 }}
          draggable={false}
        />
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          viewBox="0 0 1024 1024"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="muscleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="14" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {(Object.keys(HIGHLIGHTS) as MuscleId[]).flatMap(id =>
            activeSet.has(id)
              ? HIGHLIGHTS[id].map((e, i) => (
                  <ellipse
                    key={`${id}-${i}`}
                    cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry}
                    fill="rgba(255, 205, 0, 0.65)"
                    filter="url(#muscleGlow)"
                  />
                ))
              : []
          )}
        </svg>
      </div>
      </div>

      {/* Active muscle list */}
      {muscles.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 py-2">
          {muscles.map(id => (
            <span
              key={id}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(245,196,24,0.15)', color: '#F5C418' }}
            >
              {MUSCLE_LABELS[id]}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

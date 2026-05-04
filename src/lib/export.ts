import type { Firestore } from 'firebase/firestore'
import { collection, query, orderBy, limit as limitFn, getDocs } from 'firebase/firestore'
import type { Session } from '../types/firestore'

export async function exportLastNSessionsToCsv(db: Firestore, uid: string, n = 100) {
  const sessionsCol = collection(db, 'users', uid, 'sessions')
  const q = query(sessionsCol, orderBy('createdAt', 'desc'), limitFn(n))
  const snap = await getDocs(q)
  const rows: any[] = []
  snap.docs.forEach((d) => {
    const data: any = d.data()
    const date = data.date || ''
    const createdAt = data.createdAt ? (data.createdAt.seconds ? new Date(data.createdAt.seconds * 1000).toISOString() : String(data.createdAt)) : ''
    const restSeconds = data.restSeconds || ''
    const machineId = data.machineId || ''
    const sets = data.sets || []
    sets.forEach((s: any, idx: number) => {
      rows.push({ createdAt, date, machineId, setIndex: idx, reps: s.reps || '', weightKg: s.weightKg || '', restSeconds })
    })
  })

  const header = ['createdAt','date','machineId','setIndex','reps','weightKg','restSeconds']
  const csv = [header.join(',')]
  for (const r of rows) {
    csv.push([r.createdAt,r.date,r.machineId,r.setIndex,r.reps,r.weightKg,r.restSeconds].map(v => typeof v === 'string' ? `"${String(v).replace(/"/g,'""')}"` : v).join(','))
  }
  const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sessions_${uid}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// client-side CSV exporter that accepts an array of Session objects and triggers a file download
export function exportSessionsToCSV(sessions: Session[], filename = 'sessions.csv') {
  function csvEscape(value: any) {
    if (value === null || value === undefined) return ''
    const s = typeof value === 'string' ? value : JSON.stringify(value)
    const escaped = s.replace(/"/g, '""')
    return `"${escaped}"`
  }

  const headers = ['id', 'userId', 'machineId', 'date', 'startedAt', 'durationSec', 'restSeconds', 'sets', 'createdAt', 'meta']

  const rows = sessions.map((s) => {
    const startedAt = s.startedAt && (s.startedAt as any).toDate ? (s.startedAt as any).toDate().toISOString() : s.startedAt ? String(s.startedAt) : ''
    const createdAt = s.createdAt && (s.createdAt as any).toDate ? (s.createdAt as any).toDate().toISOString() : s.createdAt ? String(s.createdAt) : ''
    return [
      s.id ?? '',
      s.userId ?? '',
      s.machineId ?? '',
      s.date ?? '',
      startedAt,
      s.durationSec ?? '',
      s.restSeconds ?? '',
      JSON.stringify(s.sets || []),
      createdAt,
      JSON.stringify(s.meta || {})
    ]
  })

  const csvLines = [headers.map(csvEscape).join(',')].concat(rows.map((r) => r.map(csvEscape).join(',')))
  const csv = csvLines.join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

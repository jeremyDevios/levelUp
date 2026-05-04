#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))

// Usage: node scripts/export-sessions.js --uid=USER_ID --out=./out.csv --limit=100

const uid = argv.uid
const out = argv.out || `./sessions_${uid || 'all'}.csv`
const limit = Number(argv.limit) || 1000

if (!uid) {
  console.error('Please provide --uid=USER_ID')
  process.exit(1)
}

async function main() {
  // Lazy load firebase-admin so users who don't need it don't have to install it
  let admin
  try {
    admin = require('firebase-admin')
  } catch (e) {
    console.error('Please install firebase-admin: npm install firebase-admin --save-dev')
    process.exit(1)
  }

  const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS ? admin.credential.applicationDefault() : undefined
  admin.initializeApp({ credential })
  const db = admin.firestore()

  // If emulator is used, make sure FIRESTORE_EMULATOR_HOST is set externally

  const snap = await db.collection('users').doc(uid).collection('sessions').orderBy('createdAt', 'desc').limit(limit).get()
  const rows = []
  snap.forEach(doc => {
    const data = doc.data()
    const date = data.date || ''
    const createdAt = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : ''
    const restSeconds = data.restSeconds || ''
    const machineId = data.machineId || ''
    const sets = data.sets || []
    sets.forEach((s, idx) => {
      rows.push({ createdAt, date, machineId, setIndex: idx, reps: s.reps || '', weightKg: s.weightKg || '', restSeconds })
    })
  })

  // csv header
  const header = ['createdAt','date','machineId','setIndex','reps','weightKg','restSeconds']
  const lines = [header.join(',')]
  for (const r of rows) {
    lines.push([r.createdAt,r.date,r.machineId,r.setIndex,r.reps,r.weightKg,r.restSeconds].map(v => typeof v === 'string' ? `"${String(v).replace(/"/g,'""')}"` : v).join(','))
  }
  fs.writeFileSync(out, lines.join('\n'))
  console.log('Wrote', out)
}

main().catch(e => { console.error(e); process.exit(1) })

#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { fetch } = require('undici')
const cheerio = require('cheerio')

const argv = require('minimist')(process.argv.slice(2))
const out = argv.output || 'data/machines.json'
const assetsDir = path.join(process.cwd(), 'public', 'assets', 'machines')

async function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
}

async function download(url, dest) {
  try {
    const res = await fetch(url)
    if (!res.ok) return false
    const buffer = await res.arrayBuffer()
    fs.writeFileSync(dest, Buffer.from(buffer))
    return true
  } catch (e) {
    return false
  }
}

async function tryUploadToGcs(localPath, destName) {
  if (!process.env.UPLOAD_IMAGES) return null
  if (!process.env.FIREBASE_STORAGE_BUCKET) return null
  let Storage
  try {
    Storage = require('@google-cloud/storage').Storage
  } catch (e) {
    console.warn('Skipping upload: @google-cloud/storage not installed')
    return null
  }
  try {
    const storage = new Storage()
    const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET)
    await bucket.upload(localPath, { destination: destName, public: true })
    const publicUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${destName}`
    return publicUrl
  } catch (e) {
    console.warn('Upload failed', e?.message)
    return null
  }
}

async function main() {
  await ensureDir(assetsDir)
  const base = 'https://www.interval.fr/machine/'
  let machines = []
  try {
    const res = await fetch(base)
    const html = await res.text()
    const $ = cheerio.load(html)
    $('.post article').each((i, el) => {
      const a = $(el).find('a').first()
      const name = a.text().trim() || `machine_${i}`
      const href = a.attr('href')
      const id = href ? href.split('/').filter(Boolean).pop() : `machine_${i}`
      const img = $(el).find('img').first().attr('src')
      machines.push({ id, name, image: img })
    })
  } catch (e) {
    // offline fallback
    machines = [
      { id: 'bench', name: 'Bench Press', image: '/assets/machines/bench.jpg' }
    ]
  }

  for (let i = 0; i < machines.length; i++) {
    const m = machines[i]
    if (m.image && m.image.startsWith('http')) {
      const url = m.image
      const ext = path.extname(new URL(url).pathname) || '.jpg'
      const filename = `${m.id}${ext}`
      const localPath = path.join(assetsDir, filename)
      const ok = await download(url, localPath)
      if (ok) {
        // try upload if requested
        const uploaded = await tryUploadToGcs(localPath, `machines/${filename}`)
        if (uploaded) {
          m.image = uploaded
          // optionally remove local file
          try { fs.unlinkSync(localPath) } catch (e) {}
        } else {
          m.image = `/assets/machines/${filename}`
        }
      }
    }
  }

  fs.writeFileSync(out, JSON.stringify(machines, null, 2))
  console.log('Wrote', out)
  if (process.env.UPLOAD_IMAGES) console.log('UPLOAD_IMAGES enabled: attempted uploads where possible')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
const fs = require('fs')
const path = require('path')
const { fetch } = require('undici')
const cheerio = require('cheerio')

const argv = require('minimist')(process.argv.slice(2))
const out = argv.output || 'data/machines.json'
const assetsDir = path.join(process.cwd(), 'public', 'assets', 'machines')

async function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
}

async function download(url, dest) {
  try {
    const res = await fetch(url)
    if (!res.ok) return false
    const buffer = await res.arrayBuffer()
    fs.writeFileSync(dest, Buffer.from(buffer))
    return true
  } catch (e) {
    return false
  }
}

async function main() {
  await ensureDir(assetsDir)
  const base = 'https://www.interval.fr/machine/'
  let machines = []
  try {
    const res = await fetch(base)
    const html = await res.text()
    const $ = cheerio.load(html)
    $('.post article').each((i, el) => {
      const a = $(el).find('a').first()
      const name = a.text().trim() || `machine_${i}`
      const href = a.attr('href')
      const id = href ? href.split('/').filter(Boolean).pop() : `machine_${i}`
      const img = $(el).find('img').first().attr('src')
      machines.push({ id, name, image: img })
    })
  } catch (e) {
    // offline fallback
    machines = [
      { id: 'bench', name: 'Bench Press', image: '/assets/machines/bench.jpg' }
    ]
  }

  // download first image if remote
  if (machines[0] && machines[0].image && machines[0].image.startsWith('http')) {
    const url = machines[0].image
    const ext = path.extname(new URL(url).pathname) || '.jpg'
    const dest = path.join(assetsDir, machines[0].id + ext)
    const ok = await download(url, dest)
    if (ok) machines[0].image = `/assets/machines/${path.basename(dest)}`
  }

  fs.writeFileSync(out, JSON.stringify(machines, null, 2))
  console.log('Wrote', out)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

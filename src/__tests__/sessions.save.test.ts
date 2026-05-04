import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(),
    addDoc: vi.fn(async (col, payload) => ({ id: 'newid' })),
    serverTimestamp: vi.fn(() => ({ _sv: 'ts' })),
    doc: vi.fn(() => ({ path: 'doc' })),
    updateDoc: vi.fn(async () => true),
    setDoc: vi.fn(async () => true),
    deleteDoc: vi.fn(async () => true),
    getDocs: vi.fn(async () => ({ empty: true, docs: [] })),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn()
  }
})

import { saveSession, updateSession, deleteSession, updateUserWeight } from '../lib/sessions'
import { firestore } from '../lib/firebase'
import * as fs from 'fs'

describe('sessions lib', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saveSession calls addDoc and returns id', async () => {
    const payload = { userId: 'u1', machineId: 'm1', date: '2020-01-01', sets: [] }
    const id = await saveSession(firestore as any, 'u1', payload as any)
    expect(id).toBe('newid')
  })

  it('updateSession calls updateDoc when patch provided', async () => {
    await updateSession(firestore as any, 'u1', 'sid', { sets: [{ reps: 5 }] })
    const { updateDoc } = await import('firebase/firestore')
    expect(updateDoc).toHaveBeenCalled()
  })

  it('deleteSession attempts delete', async () => {
    await deleteSession(firestore as any, 'u1', 'sid')
    const { deleteDoc } = await import('firebase/firestore')
    expect(deleteDoc).toHaveBeenCalled()
  })

  it('updateUserWeight sets weight', async () => {
    await updateUserWeight(firestore as any, 'u1', 80)
    const { updateDoc } = await import('firebase/firestore')
    expect(updateDoc).toHaveBeenCalled()
  })
})

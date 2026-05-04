import { vi, describe, it, expect, beforeEach } from 'vitest'
import { getLastSessionForUserAndMachine, saveSession } from '../lib/sessions'

// Mock firebase/firestore module used by sessions.ts
vi.mock('firebase/firestore', async () => {
  return {
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    doc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    serverTimestamp: vi.fn(() => Symbol('ts'))
  }
})

import * as fb from 'firebase/firestore'

describe('sessions lib', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saveSession should call addDoc and return id', async () => {
    const fakeDb = {}
    const fakeRef = { id: 'abc123' }
    ;(fb.addDoc as vi.Mock).mockResolvedValue(fakeRef)

    const id = await saveSession(fakeDb as any, 'uid1', {
      userId: 'uid1',
      machineId: 'm1',
      date: '2020-01-01',
      sets: [{ reps: 5 }]
    } as any)

    expect(fb.addDoc).toHaveBeenCalled()
    expect(id).toBe('abc123')
  })

  it('getLastSessionForUserAndMachine returns null when empty', async () => {
    const fakeDb = {}
    ;(fb.getDocs as vi.Mock).mockResolvedValue({ empty: true, docs: [] })
    const res = await getLastSessionForUserAndMachine(fakeDb as any, 'uid1', 'm1')
    expect(res).toBeNull()
  })

  it('getLastSessionForUserAndMachine returns session when exists', async () => {
    const fakeDb = {}
    const fakeDoc = {
      id: 's1',
      data: () => ({ machineId: 'm1', date: '2020-01-02', sets: [{ reps: 3 }], createdAt: null })
    }
    ;(fb.getDocs as vi.Mock).mockResolvedValue({ empty: false, docs: [fakeDoc] })
    const res = await getLastSessionForUserAndMachine(fakeDb as any, 'uid1', 'm1')
    expect(res).not.toBeNull()
    expect(res?.id).toBe('s1')
    expect(res?.sets.length).toBe(1)
  })
})

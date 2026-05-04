import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock Firebase functions used by our libs
const mockGetDocs = vi.fn()
const mockAddDoc = vi.fn()
const mockTimestampFromDate = vi.fn((d) => d)
const mockServerTimestamp = vi.fn(() => ({ _server: true }))
const mockQuery = vi.fn()
const mockWhere = vi.fn()
const mockOrderBy = vi.fn()
const mockLimit = vi.fn()
const mockCollection = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  orderBy: (...args: any[]) => mockOrderBy(...args),
  limit: (...args: any[]) => mockLimit(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  serverTimestamp: () => mockServerTimestamp(),
  Timestamp: { fromDate: (d: any) => mockTimestampFromDate(d) }
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('history lib', () => {
  it('getSessionsForUserAndDateRange returns sessions', async () => {
    // Arrange
    const mockDoc = { id: 's1', data: () => ({ machineId: 'm1', date: '2024-01-01', sets: [] }) }
    mockGetDocs.mockResolvedValue({ docs: [mockDoc] })

    const { getSessionsForUserAndDateRange } = await import('../lib/history')

    // Act
    const res = await getSessionsForUserAndDateRange({} as any, 'user1', new Date('2024-01-01'), new Date('2024-01-02'))

    // Assert
    expect(res).toHaveLength(1)
    expect(res[0].id).toBe('s1')
    expect(res[0].machineId).toBe('m1')
  })

  it('addWeightEntry calls addDoc and returns id', async () => {
    mockAddDoc.mockResolvedValue({ id: 'w1' })
    const { addWeightEntry } = await import('../lib/weights')

    const id = await addWeightEntry({} as any, 'user1', { dateISO: '2024-05-01', weightKg: 80 })
    expect(id).toBe('w1')
    expect(mockAddDoc).toHaveBeenCalled()
  })
})

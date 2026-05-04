import { useEffect, useState } from 'react'
import { firestore } from '../lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import type { Machine } from '../types/firestore'

export default function useMachines() {
  const [machines, setMachines] = useState<Machine[]>([])
  useEffect(() => {
    let mounted = true
    fetch('/data/machines.json')
      .then((r) => r.json())
      .then((d) => {
        if (mounted) setMachines(d || [])
      })
      .catch(async () => {
        try {
          const snap = await getDocs(collection(firestore, 'machines'))
          const arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Machine[]
          if (mounted) setMachines(arr)
        } catch (e) {
          console.error('Failed to load machines', e)
        }
      })
    return () => {
      mounted = false
    }
  }, [])
  return { machines }
}

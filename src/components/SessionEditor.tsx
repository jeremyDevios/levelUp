import React from 'react'

export default function SessionEditor() {
  return (
    <div>
      <h3>Session Editor</h3>
      <p>Editor UI will go here (sets / reps / weight / rest)</p>
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          Machine ID:
          <input name="machineId" />
        </label>
        <label>
          Reps:
          <input name="reps" type="number" />
        </label>
        <label>
          Weight:
          <input name="weight" type="number" />
        </label>
        <button type="submit">Save (stub)</button>
      </form>
    </div>
  )
}

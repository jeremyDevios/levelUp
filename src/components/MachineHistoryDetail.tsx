import React from 'react';

export default function MachineHistoryDetail({ machineId }: { machineId?: string }) {
  return (
    <div className="lu-machine-detail">
      <h3>Machine history</h3>
      <p>Placeholder for machine <strong>{machineId ?? '–'}</strong> detail view (charts + session list).</p>
    </div>
  );
}

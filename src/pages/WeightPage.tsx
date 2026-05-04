import { useEffect } from 'react';
import WeightEntryForm from '../components/WeightEntryForm';
import WeightChart from '../components/WeightChart';
import { useAuth } from '../hooks/useAuth';

export default function WeightPage() {
  const { user } = useAuth();

  useEffect(() => {
    // placeholder for future logic
  }, []);

  return (
    <div className="lu-container">
      <header className="lu-header">
        <h1>Poids</h1>
        {user && <p>Signed in as {user.displayName}</p>}
      </header>

      <main className="lu-main">
        <section className="lu-section">
          <WeightEntryForm userId={user?.uid} />
        </section>

        <section className="lu-section">
          <WeightChart />
        </section>
      </main>
    </div>
  );
}

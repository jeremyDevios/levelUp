import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="lu-container">
      <h1>Paramètres</h1>
      <section className="lu-section">
        <div className="lu-card">
          <h2>Compte</h2>
          <p>{user?.displayName}</p>
          <p>{user?.email}</p>
          <button onClick={() => signOut?.()}>Se déconnecter</button>
        </div>

        <div className="lu-card">
          <h2>Apparence</h2>
          <button onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}>
            Basculer thème ({theme})
          </button>
        </div>

        <div className="lu-card">
          <h2>Données</h2>
          <button id="export-sessions">Exporter CSV</button>
          <button id="clear-local">Effacer historique local</button>
        </div>
      </section>
    </div>
  );
}

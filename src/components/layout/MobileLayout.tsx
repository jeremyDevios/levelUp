import React from 'react';
import { Link } from 'react-router-dom'

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <header className="p-4 bg-primary-gradient text-white">
        <div className="max-w-2xl mx-auto">LevelUp</div>
      </header>

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">{children}</main>

      <nav className="p-3 bg-white border-t dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link to="/" className="text-center text-sm text-gray-600 dark:text-gray-300">Dashboard</Link>
          <Link to="/history" className="text-center text-sm text-gray-600 dark:text-gray-300">History</Link>
          <Link to="/settings" className="text-center text-sm text-gray-600 dark:text-gray-300">Settings</Link>
        </div>
      </nav>
    </div>
  );
}

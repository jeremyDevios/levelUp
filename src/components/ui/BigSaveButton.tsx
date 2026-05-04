import React from 'react'

type Props = {
  state?: 'idle' | 'saving' | 'success'
  onClick?: () => void
  label?: string
}

export default function BigSaveButton({ state = 'idle', onClick, label = 'Save session' }: Props) {
  const isSaving = state === 'saving'
  const isSuccess = state === 'success'

  return (
    <div className="md:static">
      <button
        type="button"
        onClick={onClick}
        aria-live="polite"
        aria-busy={isSaving}
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 md:relative md:left-auto md:translate-x-0 z-40 inline-flex items-center gap-3 px-6 py-3 rounded-full text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-300 ${
          isSuccess ? 'bg-green-500' : 'bg-gradient-to-r from-[#F4941A] to-[#FFB86B]'
        }`}
      >
        {isSaving ? (
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        ) : isSuccess ? (
          <span className="inline-block w-5 h-5">✓</span>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}

        <span className="font-semibold">{isSaving ? 'Saving…' : isSuccess ? 'Saved' : label}</span>
      </button>
    </div>
  )
}

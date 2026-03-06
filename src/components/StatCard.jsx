import React from 'react'

const ICONS = {
  '📋': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  '⏳': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  '🔗': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  '🚗': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  '✅': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  '❌': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const COLOR_MAP = {
  'stat-blue': { icon: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  'stat-amber': { icon: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  'stat-sky': { icon: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100' },
  'stat-violet': { icon: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
  'stat-emerald': { icon: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  'stat-red': { icon: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
}

export default function StatCard({ title, value, icon, colorClass }) {
  const colors = COLOR_MAP[colorClass] || COLOR_MAP['stat-blue']

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
        <div className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center ${colors.icon}`}>
          {ICONS[icon] || <span className="text-sm">{icon}</span>}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

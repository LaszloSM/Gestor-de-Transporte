import React from 'react'

export default function StatCard({ title, value, icon, colorClass }) {
  return (
    <div className={`stat-card ${colorClass || 'stat-blue'}`}>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold mt-1">{value ?? 0}</p>
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  )
}

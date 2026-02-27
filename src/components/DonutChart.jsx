import React from 'react'

const CHART_COLORS = [
    '#f59e0b', // pending - amber
    '#3b82f6', // assigned - blue
    '#8b5cf6', // in_route - violet
    '#10b981', // completed - emerald
    '#ef4444', // cancelled - red
]

export default function DonutChart({ data = [], size = 180, thickness = 32 }) {
    const total = data.reduce((sum, d) => sum + d.value, 0)
    if (total === 0) {
        return (
            <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                <p className="text-sm text-slate-400">Sin datos</p>
            </div>
        )
    }

    const radius = (size - thickness) / 2
    const circumference = 2 * Math.PI * radius
    let cumulativeOffset = 0

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth={thickness}
                    />
                    {/* Data segments */}
                    {data.map((segment, i) => {
                        if (segment.value === 0) return null
                        const segmentLength = (segment.value / total) * circumference
                        const offset = cumulativeOffset
                        cumulativeOffset += segmentLength
                        return (
                            <circle
                                key={segment.label}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke={CHART_COLORS[i] || '#94a3b8'}
                                strokeWidth={thickness}
                                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                                strokeDashoffset={-offset}
                                strokeLinecap="round"
                                className="transition-all duration-700 ease-out"
                                style={{ animationDelay: `${i * 100}ms` }}
                            />
                        )
                    })}
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{total}</span>
                    <span className="text-xs text-slate-500">Total</span>
                </div>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {data.map((segment, i) => (
                    <div key={segment.label} className="flex items-center gap-2">
                        <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: CHART_COLORS[i] || '#94a3b8' }}
                        />
                        <span className="text-xs text-slate-600 truncate">{segment.label}</span>
                        <span className="text-xs font-semibold text-slate-900 ml-auto">{segment.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

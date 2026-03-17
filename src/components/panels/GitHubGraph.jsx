import React, { useMemo } from 'react'
import Panel from './Panel'

// Authentic GitHub Dark Mode Contribution Colors
const GITHUB_COLORS = [
    '#161b22', // L0
    '#0e4429', // L1
    '#006d32', // L2
    '#26a641', // L3
    '#39d353'  // L4
]

export default function GitHubGraph({ username, activityData = {} }) {
    // Generate data for approximately 13 weeks (91 days)
    // Aligning to weeks (starting from a Sunday)
    const { cells, months } = useMemo(() => {
        const result = []
        const monthLabels = []
        const today = new Date()

        // Let's get 13 full weeks + current partial week
        // We go back 13 weeks from today's Sunday
        const currentDayOfWeek = today.getDay() // 0 = Sunday
        const totalDays = 91 + currentDayOfWeek

        let lastMonth = -1

        for (let i = totalDays; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(today.getDate() - i)
            const dateKey = date.toISOString().split('T')[0]
            const count = activityData[dateKey] || 0

            // Map count to level 0-4
            let lvl = 0
            if (count > 0) lvl = 1
            if (count > 2) lvl = 2
            if (count > 5) lvl = 3
            if (count > 10) lvl = 4

            const month = date.getMonth()
            if (month !== lastMonth && i < totalDays - 7) { // Don't label the very first partial week if it's too cramped
                monthLabels.push({
                    name: date.toLocaleString('default', { month: 'short' }),
                    index: result.length // use this to estimate column position
                })
                lastMonth = month
            }

            result.push({ key: dateKey, lvl, count, date })
        }
        return { cells: result, months: monthLabels }
    }, [activityData])

    const totalActivity = Object.values(activityData).reduce((a, b) => a + b, 0)

    return (
        <Panel
            eyebrow="Version Control"
            title={`${totalActivity} commits in the last 90 days`}
            action={
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.05)', border: '1px solid var(--border)' }}>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-mono text-[10px] tracking-wider" style={{ color: 'var(--text-muted)' }}>LIVE ACTIVITY</span>
                </div>
            }
        >
            <div className="flex flex-col gap-2 w-full select-none">
                {/* Month Labels */}
                <div className="flex h-4 text-[10px] font-mono ml-8 relative mb-1" style={{ color: 'var(--text-muted)' }}>
                    {months.map((m, i) => (
                        <span
                            key={i}
                            className="absolute"
                            style={{ left: `${Math.floor(m.index / 7) * 14}px` }}
                        >
                            {m.name}
                        </span>
                    ))}
                </div>

                <div className="flex gap-2">
                    {/* Day Labels */}
                    <div className="flex flex-col justify-between py-1 text-[10px] font-mono h-[105px] w-6" style={{ color: 'var(--text-muted)' }}>
                        <span></span>
                        <span>Mon</span>
                        <span></span>
                        <span>Wed</span>
                        <span></span>
                        <span>Fri</span>
                        <span></span>
                    </div>

                    {/* Cell grid */}
                    <div className="flex-1 overflow-x-auto custom-scrollbar pb-2">
                        <div
                            className="min-w-fit"
                            style={{
                                display: 'grid',
                                gridTemplateRows: 'repeat(7, 11px)',
                                gridAutoFlow: 'column',
                                gap: '3px',
                            }}
                        >
                            {cells.map((day, i) => (
                                <div
                                    key={i}
                                    title={`${day.count} contributions on ${day.key}`}
                                    className="rounded-[2px] transition-all hover:ring-2"

                                    style={{
                                        width: 11,
                                        height: 11,
                                        backgroundColor: GITHUB_COLORS[day.lvl],
                                        border: '1px solid rgba(27,31,35,0.06)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-2 text-[10px] font-mono pr-2" style={{ color: 'var(--text-muted)' }}>
                    <span>Less</span>
                    <div className="flex gap-[3px]">
                        {GITHUB_COLORS.map((color, i) => (
                            <div
                                key={i}
                                className="w-[11px] h-[11px] rounded-[2px]"
                                style={{ backgroundColor: color, border: '1px solid rgba(27,31,35,0.06)' }}
                            />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>
        </Panel>
    )
}

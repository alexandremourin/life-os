import { useMemo } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function HeatmapCell({ value }) {
  let bg, opacity
  if (value === null || value === undefined) {
    bg = 'var(--surface-2)'; opacity = 1
  } else if (value === 0) {
    bg = 'var(--surface-3)'; opacity = 1
  } else if (value <= 25) {
    bg = 'var(--accent)'; opacity = 0.25
  } else if (value <= 50) {
    bg = 'var(--accent)'; opacity = 0.45
  } else if (value <= 75) {
    bg = 'var(--accent)'; opacity = 0.7
  } else {
    bg = 'var(--success)'; opacity = 1
  }
  return (
    <div style={{
      width: '100%', aspectRatio: '1', borderRadius: 3,
      background: bg, opacity,
    }} title={value != null ? `${value}%` : 'No data'} />
  )
}

export default function Analytics({ store }) {
  const heatmapData = useMemo(() => store.getHeatmapData(91), [store.today])
  const stats = useMemo(() => store.getAnalyticsStats(), [store.today])

  // Build grid: pad so first cell aligns with correct weekday
  const firstDay = heatmapData[0]
  const startDow = firstDay ? new Date(firstDay.date + 'T00:00:00').getDay() : 0
  const paddedCells = [...Array(startDow).fill(null), ...heatmapData]
  const numCols = Math.ceil(paddedCells.length / 7)

  const weeks = []
  for (let i = 0; i < numCols; i++) {
    weeks.push(paddedCells.slice(i * 7, i * 7 + 7))
  }

  // Month labels per column
  const monthLabels = []
  let lastMonth = null
  weeks.forEach((week, wi) => {
    const firstReal = week.find(c => c !== null)
    if (firstReal) {
      const m = new Date(firstReal.date + 'T00:00:00').toLocaleDateString('en', { month: 'short' })
      if (m !== lastMonth) { monthLabels[wi] = m; lastMonth = m }
    }
  })

  // Normalize scores /10 → /5
  const normalizeScore = (s) => s > 5 ? (s / 2).toFixed(1) : parseFloat(s).toFixed(1)

  const byMonth = stats.byMonth || []
  const habitRanking = (stats.habitRanking || []).slice().reverse() // best first

  // Count perfect days from heatmap
  const perfectDays = heatmapData.filter(d => d.pct === 100).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Overview</p>
        <h1 style={{ fontSize: 26, fontWeight: 600 }}>Analytics</h1>
      </div>

      {/* Heatmap */}
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '20px 18px' }}>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          Habit completion — last 13 weeks
        </p>

        {/* Month labels */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, 1fr)`, gap: 3, marginBottom: 4, marginLeft: 24 }}>
          {weeks.map((_, wi) => (
            <div key={wi} style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>
              {monthLabels[wi] || ''}
            </div>
          ))}
        </div>

        {/* Day labels + grid */}
        <div style={{ display: 'flex', gap: 4 }}>
          {/* Day of week */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: 20, flexShrink: 0 }}>
            {DAYS.map((d, i) => (
              <div key={i} style={{ fontSize: 8, color: i % 2 === 1 ? 'var(--text-3)' : 'transparent', fontFamily: 'JetBrains Mono, monospace', height: 10, display: 'flex', alignItems: 'center' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${numCols}, 1fr)`, gap: 3 }}>
            {weeks.map((week, wi) =>
              week.map((cell, di) => (
                <HeatmapCell key={`${wi}-${di}`} value={cell ? cell.pct : null} />
              ))
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace', marginRight: 2 }}>Less</span>
          {[0, 25, 50, 75, 100].map(v => (
            <div key={v} style={{ width: 10, height: 10 }}><HeatmapCell value={v} /></div>
          ))}
          <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace', marginLeft: 2 }}>More</span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '16px 18px' }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Best day</p>
          <p style={{ fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--success)' }}>
            {stats.bestDay ?? '—'}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>most habits done</p>
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '16px 18px' }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Weakest day</p>
          <p style={{ fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--danger)' }}>
            {stats.worstDay ?? '—'}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>fewest habits done</p>
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '16px 18px' }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Worst habit</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--danger)', marginTop: 4 }}>
            {stats.worstHabit?.label ?? '—'}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{stats.worstHabit ? `${stats.worstHabit.rate}% success` : ''}</p>
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '16px 18px' }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Perfect days</p>
          <p style={{ fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--success)' }}>
            {perfectDays}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>all habits done</p>
        </div>
      </div>

      {/* Habit ranking */}
      {habitRanking.length > 0 && (
        <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '20px 18px' }}>
          <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Habit ranking</p>
          <div>
            {habitRanking.map((h, i) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < habitRanking.length - 1 ? '1px solid var(--surface-2)' : 'none' }}>
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)', width: 18, flexShrink: 0 }}>#{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{h.label}</span>
                <div style={{ width: 80, height: 4, borderRadius: 2, background: 'var(--surface-2)', overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{
                    height: '100%', borderRadius: 2, width: `${h.rate}%`,
                    background: h.rate >= 80 ? 'var(--success)' : h.rate >= 50 ? 'var(--accent)' : 'var(--danger)',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)', width: 34, textAlign: 'right', flexShrink: 0 }}>
                  {h.rate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly journal scores */}
      {byMonth.length > 0 && (
        <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '20px 18px' }}>
          <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Monthly journal average</p>
          <div>
            {byMonth.map((m, i) => {
              const score = parseFloat(normalizeScore(m.avg))
              return (
                <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < byMonth.length - 1 ? '1px solid var(--surface-2)' : 'none' }}>
                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)', width: 55, flexShrink: 0 }}>
                    {new Date(m.month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' })}
                  </span>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--surface-2)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 2, width: `${(score / 5) * 100}%`,
                      background: score >= 4 ? 'var(--success)' : score >= 3 ? 'var(--accent)' : 'var(--danger)',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text)', width: 30, textAlign: 'right', flexShrink: 0 }}>
                    {score}/5
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

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
    bg = 'var(--accent)'; opacity = 0.5
  } else if (value <= 75) {
    bg = 'var(--accent)'; opacity = 0.75
  } else {
    bg = 'var(--success)'; opacity = 1
  }
  return (
    <div style={{ width: '100%', aspectRatio: '1', borderRadius: 3, background: bg, opacity }}
      title={value != null ? `${value}%` : 'No data'} />
  )
}

function StatBox({ label, value, color, sub }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border)' }}>
      <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 700, color: color || 'var(--text)', lineHeight: 1.2 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

export default function Analytics({ store }) {
  const heatmapData = useMemo(() => store.getHeatmapData(91), [store.today])
  const stats = useMemo(() => store.getAnalyticsStats(), [store.today])
  const smokeStats = useMemo(() => store.getSmokeStats ? store.getSmokeStats() : null, [store.today])

  const normalizeScore = (s) => s > 5 ? (s / 2) : parseFloat(s)
  const fmt = (s) => { const n = parseFloat(s); return n % 1 === 0 ? `${parseInt(n)}` : `${n.toFixed(1)}` }

  // Heatmap grid
  const firstDay = heatmapData[0]
  const startDow = firstDay ? new Date(firstDay.date + 'T00:00:00').getDay() : 0
  const paddedCells = [...Array(startDow).fill(null), ...heatmapData]
  const numCols = Math.ceil(paddedCells.length / 7)
  const weeks = []
  for (let i = 0; i < numCols; i++) weeks.push(paddedCells.slice(i * 7, i * 7 + 7))

  const monthLabels = []
  let lastMonth = null
  weeks.forEach((week, wi) => {
    const firstReal = week.find(c => c !== null)
    if (firstReal) {
      const m = new Date(firstReal.date + 'T00:00:00').toLocaleDateString('en', { month: 'short' })
      if (m !== lastMonth) { monthLabels[wi] = m; lastMonth = m }
    }
  })

  const perfectDays = heatmapData.filter(d => d.pct === 100).length
  const byMonth = stats.byMonth || []
  const habitRanking = (stats.habitRanking || []).slice().reverse()
  const smokeRate = smokeStats ? Math.round((smokeStats.smokeFree / (smokeStats.smokeFree + smokeStats.smoked || 1)) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Overview</p>
        <h1 style={{ fontSize: 26, fontWeight: 600 }}>Insights</h1>
      </div>

      {/* Top stats — 4 cols responsive */}
      <div className="analytics-grid-4" style={{ gap: 10 }}>
        <StatBox label="Best day" value={stats.bestDay ?? '—'} color="var(--success)" sub="most habits" />
        <StatBox label="Weakest day" value={stats.worstDay ?? '—'} color="var(--danger)" sub="fewest habits" />
        <StatBox label="Perfect days" value={perfectDays} color="var(--accent)" sub="all habits done" />
        <StatBox label="Worst habit" value={stats.worstHabit?.label ?? '—'} color="var(--danger)" sub={stats.worstHabit ? `${stats.worstHabit.rate}%` : ''} />
      </div>

      {/* 2-col section: heatmap + smoke stats */}
      <div className="analytics-grid-2" style={{ gap: 16 }}>
        {/* Heatmap */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '18px 16px', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Habit completion — 13 weeks</p>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, 1fr)`, gap: 2, marginBottom: 3, marginLeft: 20 }}>
            {weeks.map((_, wi) => (
              <div key={wi} style={{ fontSize: 8, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>{monthLabels[wi] || ''}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 18, flexShrink: 0 }}>
              {DAYS.map((d, i) => (
                <div key={i} style={{ fontSize: 7, color: i % 2 === 1 ? 'var(--text-3)' : 'transparent', fontFamily: 'JetBrains Mono, monospace', height: 9, display: 'flex', alignItems: 'center' }}>{d}</div>
              ))}
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${numCols}, 1fr)`, gap: 2 }}>
              {weeks.map((week, wi) => week.map((cell, di) => (
                <HeatmapCell key={`${wi}-${di}`} value={cell ? cell.pct : null} />
              )))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 10, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 8, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace', marginRight: 2 }}>Less</span>
            {[0, 25, 50, 75, 100].map(v => <div key={v} style={{ width: 9, height: 9 }}><HeatmapCell value={v} /></div>)}
            <span style={{ fontSize: 8, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace', marginLeft: 2 }}>More</span>
          </div>
        </div>

        {/* Smoke stats */}
        {smokeStats && (
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '18px 16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 0 }}>
            <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Smoke tracking</p>
            {[
              { label: 'Smoke-free', value: smokeStats.smokeFree, color: 'var(--success)', sub: 'days' },
              { label: 'Smoked', value: smokeStats.smoked, color: 'var(--danger)', sub: 'days' },
              { label: 'Success rate', value: `${smokeRate}%`, color: smokeRate >= 80 ? 'var(--success)' : 'var(--accent)', sub: null },
              { label: 'Current streak', value: `${smokeStats.currentStreak}d`, color: 'var(--success)', sub: null },
              { label: 'Best streak', value: `${smokeStats.bestStreak}d`, color: 'var(--accent)', sub: null },
            ].map((row, i, arr) => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{row.label}</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.value}</span>
                  {row.sub && <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 4 }}>{row.sub}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2-col: habit ranking + monthly scores */}
      <div className="analytics-grid-equal" style={{ gap: 16 }}>
        {/* Habit ranking */}
        {habitRanking.length > 0 && (
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '18px', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Habit ranking</p>
            {habitRanking.map((h, i) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < habitRanking.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)', width: 16, flexShrink: 0 }}>#{i + 1}</span>
                <span style={{ flex: 1, fontSize: 12 }}>{h.label}</span>
                <div style={{ width: 60, height: 3, borderRadius: 2, background: 'var(--surface-3)', overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ height: '100%', borderRadius: 2, width: `${h.rate}%`, background: h.rate >= 80 ? 'var(--success)' : h.rate >= 50 ? 'var(--accent)' : 'var(--danger)', transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)', width: 30, textAlign: 'right', flexShrink: 0 }}>{h.rate}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Monthly scores */}
        {byMonth.length > 0 && (
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '18px', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Monthly journal avg</p>
            {byMonth.map((m, i) => {
              const score = normalizeScore(m.avg)
              return (
                <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < byMonth.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)', width: 50, flexShrink: 0 }}>
                    {new Date(m.month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' })}
                  </span>
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--surface-3)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, width: `${(score / 5) * 100}%`, background: score >= 4 ? 'var(--success)' : score >= 3 ? 'var(--accent)' : 'var(--danger)', transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text)', width: 28, textAlign: 'right', flexShrink: 0 }}>
                    {fmt(score)}/5
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

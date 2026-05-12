import { useState, useEffect, useCallback, useRef } from 'react'

const GW = 280
const GH = 90
const GND = 24  // ground offset from bottom
const RX = 40   // rabbit x
const RS = 24   // rabbit font size
const OW = 16   // obstacle width
const OH = 28   // obstacle height

export default function RabbitGame() {
  const gs = useRef({
    y: 0, vy: 0,
    obs: [{ x: GW + 50 }],
    score: 0,
    dead: false,
    started: false,
  })
  const [, setTick] = useState(0)
  const rerender = useCallback(() => setTick(t => t + 1), [])

  const jump = useCallback(() => {
    const g = gs.current
    if (g.dead) {
      gs.current = { y: 0, vy: 0, obs: [{ x: GW + 50 }], score: 0, dead: false, started: true }
      rerender()
      return
    }
    gs.current.started = true
    if (g.y === 0) gs.current.vy = 11
    rerender()
  }, [rerender])

  useEffect(() => {
    const fn = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump() }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [jump])

  useEffect(() => {
    const id = setInterval(() => {
      const g = gs.current
      if (!g.started || g.dead) return

      const speed = 4 + Math.floor(g.score / 300) * 0.5
      const vy = g.y > 0 ? g.vy - 0.65 : 0
      const y = Math.max(0, g.y + vy)

      let obs = g.obs.map(o => ({ x: o.x - speed })).filter(o => o.x > -30)
      const last = obs[obs.length - 1]
      if (!last || last.x < GW - 140 - Math.random() * 80) {
        obs = [...obs, { x: GW }]
      }

      const dead = obs.some(o =>
        RX + RS - 5 > o.x + 2 &&
        RX + 5 < o.x + OW - 2 &&
        y < OH
      )

      gs.current = { ...g, y, vy, obs, score: g.score + 1, dead }
      rerender()
    }, 16)
    return () => clearInterval(id)
  }, [rerender])

  const g = gs.current

  return (
    <div
      onClick={jump}
      onTouchStart={(e) => { e.preventDefault(); jump() }}
      className="relative cursor-pointer select-none rounded-xl overflow-hidden"
      style={{
        width: GW, height: GH,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Score */}
      <div className="absolute top-2 right-3 text-white/20 text-xs font-mono tabular-nums">
        {String(Math.floor(g.score / 10)).padStart(4, '0')}
      </div>

      {/* Ground */}
      <div className="absolute left-0 right-0 bg-white/10"
           style={{ bottom: GND - 1, height: 1 }} />

      {/* Rabbit */}
      <div
        className="absolute leading-none"
        style={{
          left: RX,
          bottom: GND + g.y,
          fontSize: RS,
          transform: g.dead ? 'rotate(90deg)' : 'none',
          transition: g.dead ? 'transform 0.15s' : 'none',
        }}
      >
        🐰
      </div>

      {/* Obstacles */}
      {g.obs.map((o, i) => (
        <div key={i} className="absolute leading-none"
             style={{ left: o.x, bottom: GND - 4, fontSize: 22 }}>
          🥕
        </div>
      ))}

      {!g.started && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/30 text-xs">탭 / 스페이스바로 점프!</p>
        </div>
      )}
      {g.dead && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/35 text-xs">당근에 걸렸어 🥕  탭해서 다시!</p>
        </div>
      )}
    </div>
  )
}

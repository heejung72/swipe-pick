import { useState, useCallback } from 'react'

export default function HeartBurst({ count, isBeating }) {
  const [floaters, setFloaters] = useState([])

  const burst = useCallback(() => {
    const id = Date.now()
    const x = 40 + Math.random() * 20
    setFloaters(prev => [...prev, { id, x }])
    setTimeout(() => setFloaters(prev => prev.filter(f => f.id !== id)), 1200)
  }, [])

  // 외부에서 burst 호출용
  HeartBurst.burst = burst

  return (
    <div className="relative flex items-center gap-2">
      {/* 메인 하트 */}
      <div className={`text-3xl transition-all ${isBeating ? 'animate-heartbeat' : ''}`}>
        💗
      </div>
      <div className="text-white/70 text-sm font-medium">{count}</div>

      {/* 떠오르는 하트들 */}
      {floaters.map(f => (
        <div
          key={f.id}
          className="absolute animate-float-up pointer-events-none text-xl"
          style={{ left: `${f.x}%`, bottom: '100%' }}
        >
          💗
        </div>
      ))}
    </div>
  )
}

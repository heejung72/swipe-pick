import { useRef, useState, useCallback } from 'react'

const SWIPE_THRESHOLD = 80

export default function SwipeCard({ photo, onSwipe, index, isTop }) {
  const cardRef = useRef(null)
  const startRef = useRef(null)
  const [drag, setDrag] = useState({ x: 0, active: false })

  const getDirection = (x) => {
    if (x > 30) return 'BEST'
    if (x < -30) return 'WORST'
    return null
  }

  const onPointerDown = useCallback((e) => {
    if (!isTop) return
    e.currentTarget.setPointerCapture(e.pointerId)
    startRef.current = e.clientX
    setDrag({ x: 0, active: true })
  }, [isTop])

  const onPointerMove = useCallback((e) => {
    if (!drag.active || startRef.current === null) return
    const x = e.clientX - startRef.current
    setDrag(prev => ({ ...prev, x }))
  }, [drag.active])

  const onPointerUp = useCallback(() => {
    if (!drag.active) return
    const x = drag.x
    setDrag({ x: 0, active: false })
    startRef.current = null
    if (x > SWIPE_THRESHOLD) onSwipe('BEST')
    else if (x < -SWIPE_THRESHOLD) onSwipe('WORST')
  }, [drag, onSwipe])

  const rotate = drag.x * 0.08
  const direction = getDirection(drag.x)

  const scale = isTop ? 1 : Math.max(0.92, 0.92 + (index === 1 ? 0.05 : 0))
  const translateY = isTop ? 0 : index === 1 ? 16 : 28
  const opacity = isTop ? 1 : index === 1 ? 0.7 : 0.4

  return (
    <div
      ref={cardRef}
      className="swipe-card absolute inset-0"
      style={{
        transform: isTop
          ? `translateX(${drag.x}px) rotate(${rotate}deg)`
          : `scale(${scale}) translateY(${translateY}px)`,
        opacity,
        transition: drag.active ? 'none' : 'transform 0.35s cubic-bezier(0.34,1.2,0.64,1), opacity 0.3s',
        zIndex: 10 - index,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* 사진 */}
      <img
        src={photo.url}
        alt=""
        className="w-full h-full object-cover rounded-3xl select-none pointer-events-none"
        draggable={false}
      />

      {/* 그라디언트 오버레이 */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* BEST 오버레이 */}
      {direction === 'BEST' && (
        <div className="absolute inset-0 rounded-3xl flex items-center justify-center"
             style={{ backgroundColor: 'rgba(236,72,153,0.25)' }}>
          <div className="border-4 border-pink-400 rounded-2xl px-8 py-3 rotate-[-12deg]">
            <span className="text-pink-400 text-4xl font-semibold tracking-widest">BEST ✨</span>
          </div>
        </div>
      )}

      {/* WORST 오버레이 */}
      {direction === 'WORST' && (
        <div className="absolute inset-0 rounded-3xl flex items-center justify-center"
             style={{ backgroundColor: 'rgba(100,100,120,0.35)' }}>
          <div className="border-4 border-white/40 rounded-2xl px-8 py-3 rotate-[12deg]">
            <span className="text-white/60 text-4xl font-semibold tracking-widest">PASS</span>
          </div>
        </div>
      )}

      {/* 하단 힌트 (처음 카드만) */}
      {isTop && !drag.active && (
        <div className="absolute bottom-6 inset-x-0 flex justify-between px-8 pointer-events-none">
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <span>←</span><span>PASS</span>
          </div>
          <div className="flex items-center gap-1 text-pink-400/60 text-xs">
            <span>BEST</span><span>→</span>
          </div>
        </div>
      )}
    </div>
  )
}

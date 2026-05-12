import { useRef, useState, useCallback } from 'react'

const SWIPE_THRESHOLD = 80
const HOLD_THRESHOLD = 80

export default function SwipeCard({ photo, onSwipe, index, isTop, disableHold }) {
  const cardRef = useRef(null)
  const startRef = useRef(null)
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false })

  const getDirection = (x, y) => {
    if (!disableHold && y < -HOLD_THRESHOLD && Math.abs(y) > Math.abs(x)) return 'HOLD'
    if (x > 30) return 'BEST'
    if (x < -30) return 'WORST'
    return null
  }

  const onPointerDown = useCallback((e) => {
    if (!isTop) return
    e.currentTarget.setPointerCapture(e.pointerId)
    startRef.current = { x: e.clientX, y: e.clientY }
    setDrag({ x: 0, y: 0, active: true })
  }, [isTop])

  const onPointerMove = useCallback((e) => {
    if (!drag.active || startRef.current === null) return
    const x = e.clientX - startRef.current.x
    const y = e.clientY - startRef.current.y
    setDrag(prev => ({ ...prev, x, y }))
  }, [drag.active])

  const onPointerUp = useCallback(() => {
    if (!drag.active) return
    const { x, y } = drag
    setDrag({ x: 0, y: 0, active: false })
    startRef.current = null
    if (!disableHold && y < -HOLD_THRESHOLD && Math.abs(y) > Math.abs(x)) onSwipe('HOLD')
    else if (x > SWIPE_THRESHOLD) onSwipe('BEST')
    else if (x < -SWIPE_THRESHOLD) onSwipe('WORST')
  }, [drag, onSwipe, disableHold])

  const rotate = drag.x * 0.08
  const displayY = drag.y < 0 ? drag.y : drag.y * 0.15
  const direction = getDirection(drag.x, drag.y)

  const scale = isTop ? 1 : Math.max(0.92, 0.92 + (index === 1 ? 0.05 : 0))
  const translateY = isTop ? 0 : index === 1 ? 16 : 28
  const opacity = isTop ? 1 : index === 1 ? 0.7 : 0.4

  return (
    <div
      ref={cardRef}
      className="swipe-card absolute inset-0"
      style={{
        transform: isTop
          ? `translateX(${drag.x}px) translateY(${displayY}px) rotate(${rotate}deg)`
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
      <div className="absolute inset-0 rounded-3xl bg-black" />

      <img
        src={photo.url}
        alt=""
        className="absolute inset-0 w-full h-full object-contain rounded-3xl select-none pointer-events-none"
        draggable={false}
      />

      <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

      {direction === 'BEST' && (
        <div className="absolute inset-0 rounded-3xl flex items-center justify-center"
             style={{ backgroundColor: 'rgba(236,72,153,0.25)' }}>
          <div className="border-4 border-pink-400 rounded-2xl px-8 py-3 rotate-[-12deg]">
            <span className="text-pink-400 text-4xl font-semibold tracking-widest">BEST ✨</span>
          </div>
        </div>
      )}

      {direction === 'WORST' && (
        <div className="absolute inset-0 rounded-3xl flex items-center justify-center"
             style={{ backgroundColor: 'rgba(100,100,120,0.35)' }}>
          <div className="border-4 border-white/40 rounded-2xl px-8 py-3 rotate-[12deg]">
            <span className="text-white/60 text-4xl font-semibold tracking-widest">PASS</span>
          </div>
        </div>
      )}

      {direction === 'HOLD' && (
        <div className="absolute inset-0 rounded-3xl flex items-center justify-center"
             style={{ backgroundColor: 'rgba(251,191,36,0.2)' }}>
          <div className="border-4 border-yellow-400 rounded-2xl px-8 py-3">
            <span className="text-yellow-300 text-4xl font-semibold tracking-widest">보류 ⏸</span>
          </div>
        </div>
      )}

      {isTop && !drag.active && (
        <div className="absolute bottom-6 inset-x-0 flex justify-between px-8 pointer-events-none">
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <span>←</span><span>PASS</span>
          </div>
          {!disableHold && (
            <div className="flex items-center gap-1 text-yellow-400/50 text-xs">
              <span>↑</span><span>보류</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-pink-400/60 text-xs">
            <span>BEST</span><span>→</span>
          </div>
        </div>
      )}
    </div>
  )
}

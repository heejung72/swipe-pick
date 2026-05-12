import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { getRoom } from '../utils/api.js'
import { useWebSocket } from '../hooks/useWebSocket.js'
import SwipeCard from '../components/SwipeCard.jsx'
import confetti from 'canvas-confetti'

export default function Swipe() {
  const { code } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isHost = searchParams.get('host') === 'true'
  const voterName = searchParams.get('name') || `익명${Math.floor(Math.random() * 100)}`

  const [photos, setPhotos] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [done, setDone] = useState(false)
  const [heldPhotos, setHeldPhotos] = useState([])
  const [isHoldRound, setIsHoldRound] = useState(false)
  const [showHoldReview, setShowHoldReview] = useState(false)
  const [heartCount, setHeartCount] = useState(0)
  const [isBeating, setIsBeating] = useState(false)
  const [floatingHearts, setFloatingHearts] = useState([])
  const [totalVoters, setTotalVoters] = useState(0)
  const [showComment, setShowComment] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [recentComment, setRecentComment] = useState(null)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const beatTimeout = useRef(null)

  useEffect(() => {
    getRoom(code).then(data => {
      setPhotos(data.photos || [])
      setHeartCount(data.photos?.reduce((s, p) => s + p.bestCount, 0) || 0)
      setTotalVoters(data.totalVoters || 0)
    }).catch(() => navigate('/'))
    setShareUrl(window.location.origin + `/swipe/${code}?name=`)
  }, [code])

  const triggerBeat = useCallback((direction) => {
    if (direction !== 'BEST') return
    setIsBeating(true)
    setHeartCount(p => p + 1)
    const id = Date.now()
    const x = 20 + Math.random() * 60
    setFloatingHearts(prev => [...prev, { id, x }])
    setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== id)), 1200)
    clearTimeout(beatTimeout.current)
    beatTimeout.current = setTimeout(() => setIsBeating(false), 500)
  }, [])

  const handleMessage = useCallback((msg) => {
    if (msg.type === 'SWIPE') {
      triggerBeat(msg.direction)
      setTotalVoters(msg.totalVoters || 0)
      setPhotos(prev => prev.map(p =>
        p.id === msg.photoId
          ? { ...p, bestCount: msg.bestCount, worstCount: msg.worstCount, survivalRate: msg.survivalRate }
          : p
      ))
    }
    if (msg.type === 'COMMENT') {
      setRecentComment({ name: msg.voterName, text: msg.comment })
      setTimeout(() => setRecentComment(null), 3500)
    }
  }, [triggerBeat])

  const { send } = useWebSocket(code, handleMessage)

  const handleSwipe = useCallback((direction) => {
    if (currentIdx >= photos.length) return
    const photo = photos[currentIdx]
    const next = currentIdx + 1

    if (direction === 'HOLD') {
      const newHeld = [...heldPhotos, photo]
      setHeldPhotos(newHeld)
      setCurrentIdx(next)
      if (next >= photos.length) {
        setShowHoldReview(true)
      }
      return
    }

    send('/swipe', { roomCode: code, photoId: photo.id, direction, voterName })
    triggerBeat(direction)
    if (direction === 'BEST') {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 }, colors: ['#ec4899','#f9a8d4','#fff'] })
    }

    setCurrentIdx(next)
    if (next >= photos.length) {
      if (heldPhotos.length > 0 && !isHoldRound) {
        setShowHoldReview(true)
      } else {
        setDone(true)
      }
    }
  }, [currentIdx, photos, code, voterName, send, triggerBeat, heldPhotos, isHoldRound])

  const startHoldRound = () => {
    setPhotos(heldPhotos)
    setHeldPhotos([])
    setCurrentIdx(0)
    setIsHoldRound(true)
    setShowHoldReview(false)
  }

  const handleComment = () => {
    if (!commentText.trim() || currentIdx >= photos.length) return
    send('/comment', {
      roomCode: code,
      photoId: photos[currentIdx].id,
      voterName,
      text: commentText.trim(),
    })
    setCommentText('')
    setShowComment(false)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 보류 사진 재결정 화면
  if (showHoldReview) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-4 animate-pop-in">⏸</div>
        <h2 className="text-xl font-semibold mb-2">보류한 사진이 있어요</h2>
        <p className="text-white/40 text-sm mb-2">{heldPhotos.length}장을 아직 결정 못 했어요</p>
        <p className="text-white/30 text-xs mb-8">이번엔 BEST 또는 PASS만 선택할 수 있어요</p>
        <div className="space-y-3 w-full max-w-xs">
          <button onClick={startHoldRound} className="btn-pink w-full">
            다시 결정하러 가기 →
          </button>
          <button onClick={() => setDone(true)} className="btn-outline w-full text-sm">
            그냥 넘어갈게
          </button>
        </div>
      </div>
    )
  }

  // 완료 화면
  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4 animate-pop-in">🎉</div>
        <h2 className="text-2xl font-semibold mb-2">투표 완료!</h2>
        <p className="text-white/40 text-sm mb-8">결과는 방장이 공개할 거예요</p>
        <div className="space-y-3 w-full max-w-xs">
          <button onClick={() => navigate(`/result/${code}`)} className="btn-pink w-full">
            결과 보러가기
          </button>
          <button onClick={() => navigate('/')} className="btn-outline w-full text-sm">
            처음으로
          </button>
        </div>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/40 text-sm">로딩 중...</div>
      </div>
    )
  }

  const visibleCards = photos.slice(currentIdx, currentIdx + 3)

  return (
    <div className="min-h-screen flex flex-col select-none">
      {/* 상단 */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <p className="text-white/30 text-xs">
            {isHoldRound && <span className="text-yellow-400/70 mr-1">⏸ 보류 재결정</span>}
            {currentIdx + 1} / {photos.length}
          </p>
          <div className="flex gap-1 mt-1">
            {photos.map((_, i) => (
              <div key={i} className={`h-0.5 w-6 rounded-full transition-all ${
                i < currentIdx ? 'bg-pink-500' : i === currentIdx ? 'bg-white/60' : 'bg-white/10'
              }`} />
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-1.5">
          <span className={`text-2xl transition-transform ${isBeating ? 'animate-heartbeat' : ''}`}>💗</span>
          <span className="text-white/60 text-sm">{heartCount}</span>
          {floatingHearts.map(h => (
            <span
              key={h.id}
              className="absolute animate-float-up text-lg pointer-events-none"
              style={{ left: `${h.x}%`, bottom: '100%' }}
            >
              💗
            </span>
          ))}
        </div>
      </div>

      {/* 카드 영역 */}
      <div className="flex-1 relative mx-4 mb-4" style={{ minHeight: 0 }}>
        <div className="absolute inset-0">
          {[...visibleCards].reverse().map((photo, reversedIdx) => {
            const idx = visibleCards.length - 1 - reversedIdx
            return (
              <SwipeCard
                key={photo.id}
                photo={photo}
                index={idx}
                isTop={idx === 0}
                onSwipe={handleSwipe}
                disableHold={isHoldRound}
              />
            )
          })}
        </div>
      </div>

      {/* 댓글 팝업 */}
      {showComment && (
        <div className="mx-4 mb-3 animate-slide-up">
          <div className="bg-white rounded-2xl rounded-bl-sm shadow-xl p-4">
            <div className="flex gap-2 mb-3 flex-wrap">
              {['이게 베스트지! 📸', '분위기 완벽 ✨', '감성 넘쳐 💗', '감성적이다 🌿'].map(preset => (
                <button
                  key={preset}
                  onClick={() => setCommentText(preset)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all
                    ${commentText === preset
                      ? 'bg-pink-500 border-pink-500 text-white'
                      : 'border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500'
                    }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                placeholder="직접 입력..."
                maxLength={40}
                className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-300"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="text-xs font-medium text-pink-500 disabled:text-gray-300 transition-colors"
              >
                전송
              </button>
            </div>
          </div>
          <div className="w-3 h-3 bg-white ml-4" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        </div>
      )}

      {/* 최근 댓글 알림 */}
      {recentComment && (
        <div className="mx-4 mb-2 animate-slide-up">
          <div className="card-dark px-4 py-2 flex items-center gap-2">
            <span className="text-sm">💬</span>
            <span className="text-white/50 text-xs">{recentComment.name}</span>
            <span className="text-white/80 text-xs truncate">{recentComment.text}</span>
          </div>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="px-4 pb-6 flex items-center gap-3">
        {/* PASS */}
        <button
          onClick={() => handleSwipe('WORST')}
          className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl
                     flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span className="text-xl">👎</span>
          <span className="text-white/50 text-sm">PASS</span>
        </button>

        {/* 보류 (첫 라운드만) */}
        {!isHoldRound && (
          <button
            onClick={() => handleSwipe('HOLD')}
            className="w-14 h-14 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl
                       flex flex-col items-center justify-center active:scale-95 transition-all"
          >
            <span className="text-lg">⏸</span>
            <span className="text-yellow-400/60 text-[10px]">보류</span>
          </button>
        )}

        {/* 댓글 */}
        <button
          onClick={() => setShowComment(p => !p)}
          className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl
                     flex items-center justify-center active:scale-95 transition-all"
        >
          <span className="text-xl">💬</span>
        </button>

        {/* BEST */}
        <button
          onClick={() => handleSwipe('BEST')}
          className="flex-1 h-14 bg-pink-500 rounded-2xl shadow-lg shadow-pink-500/30
                     flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span className="text-xl">💗</span>
          <span className="text-white text-sm font-medium">BEST</span>
        </button>
      </div>

      {/* 호스트 전용 */}
      {isHost && (
        <div className="px-4 pb-5 flex gap-2">
          <button onClick={copyLink} className="flex-1 btn-outline text-xs py-2">
            {copied ? '✓ 복사됨' : '링크 복사'}
          </button>
          <button onClick={() => navigate(`/result/${code}`)} className="flex-1 btn-outline text-xs py-2">
            결과 보기
          </button>
        </div>
      )}

      <div className="pb-4 text-center text-white/20 text-xs">
        {totalVoters > 0 && `${totalVoters}명 참여 중`}
      </div>
    </div>
  )
}

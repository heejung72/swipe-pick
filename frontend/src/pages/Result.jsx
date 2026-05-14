import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getResults } from '../utils/api.js'
import { useWebSocket } from '../hooks/useWebSocket.js'
import { shareResult } from '../utils/kakao.js'
import confetti from 'canvas-confetti'

const API_BASE = import.meta.env.VITE_API_URL || ''
const imgUrl = (url) => url?.startsWith('/') ? `${API_BASE}${url}` : url

export default function Result() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)

  useEffect(() => {
    getResults(code).then(d => {
      setData(d)
      // 베스트컷 축하 효과
      setTimeout(() => {
        confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 }, colors: ['#ec4899','#f9a8d4','#fff','#fbbf24'] })
      }, 400)
    }).catch(() => navigate('/'))
  }, [code])

  // 실시간 업데이트
  const handleMessage = (msg) => {
    if (msg.type === 'SWIPE') {
      getResults(code).then(setData)
    }
  }
  useWebSocket(code, handleMessage)

  const handleKakaoShare = () => {
    if (!data) return
    shareResult({
      hostName: data.hostName,
      bestPhotoUrl: data.photos[0]?.url,
      resultUrl: window.location.href,
    })
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/30 text-sm">결과 불러오는 중...</div>
      </div>
    )
  }

  const best = data.photos[0]

  return (
    <div className="min-h-screen flex flex-col p-5 max-w-sm mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-6 animate-pop-in">
        <p className="text-white/40 text-xs mb-1">{data.hostName}의 베스트컷</p>
        <h2 className="text-2xl font-semibold">투표 결과 ✨</h2>
        <p className="text-white/30 text-xs mt-1">{data.totalVoters}명 참여 · {data.totalSwipes}번 스와이프</p>
      </div>

      {/* 베스트컷 */}
      {best && (
        <div className="relative mb-5 animate-pop-in">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10
                          bg-pink-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg shadow-pink-500/40">
            👑 베스트컷
          </div>
          <div className="rounded-2xl overflow-hidden border-2 border-pink-500/50 shadow-xl shadow-pink-500/20 relative aspect-[3/4] bg-black">
            <img src={imgUrl(best.url)} className="absolute inset-0 w-full h-full object-contain" />
            <div className="bg-neutral-900 px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-pink-400 text-lg font-semibold">{best.survivalRate}%</div>
                <div className="text-white/30 text-xs">생존율</div>
              </div>
              <div className="text-right">
                <div className="text-white text-base">💗 {best.bestCount}</div>
                <div className="text-white/30 text-xs">BEST 선택</div>
              </div>
            </div>
          </div>
          {/* 댓글 */}
          {best.comments?.length > 0 && (
            <div className="mt-2 space-y-1">
              {best.comments.slice(0, 3).map((c, i) => (
                <div key={i} className="card-dark px-3 py-2 flex gap-2 text-xs">
                  <span className="text-white/40">{c.voterName}</span>
                  <span className="text-white/70">{c.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 전체 사진 순위 */}
      <div className="mb-5">
        <p className="text-white/40 text-xs mb-3">전체 순위</p>
        <div className="space-y-2">
          {data.photos.map((photo, idx) => (
            <div key={photo.id} className="card-dark p-3 flex gap-3 items-center animate-slide-up">
              <span className="text-white/30 text-sm w-5">{idx + 1}</span>
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative bg-black">
                <img src={imgUrl(photo.url)} className="absolute inset-0 w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{photo.survivalRate}%</span>
                  <span className="text-xs text-white/30">💗{photo.bestCount} 👎{photo.worstCount}</span>
                </div>
                <div className="bg-white/5 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-pink-500 h-full rounded-full"
                    style={{ width: `${photo.survivalRate}%` }}
                  />
                </div>
                {photo.comments?.length > 0 && (
                  <p className="text-white/30 text-xs mt-1 truncate">
                    💬 {photo.comments[0].text}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pb-8">
        <button onClick={() => navigate('/')} className="btn-outline flex-1 text-sm">처음으로</button>
        <button
          onClick={handleKakaoShare}
          className="flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          style={{ backgroundColor: '#FEE500', color: '#191919' }}
        >
          <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
               className="w-4 h-4" alt="" />
          카카오 공유
        </button>
        <button onClick={() => navigate(`/swipe/${code}`)} className="btn-pink flex-1 text-sm">다시 투표</button>
      </div>
    </div>
  )
}

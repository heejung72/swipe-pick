import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12 animate-fade-in">
        <div className="text-6xl mb-4">💘</div>
        <h1 className="text-3xl font-semibold tracking-tight">스와이프 픽</h1>
        <p className="text-white/40 mt-2 text-sm">친구들이 직접 뽑는 나의 베스트컷</p>
      </div>

      <div className="w-full max-w-xs space-y-3 animate-slide-up">
        <button onClick={() => navigate('/create')} className="btn-pink w-full text-base">
          사진 올리고 링크 만들기
        </button>
        <p className="text-center text-white/30 text-xs">
          공유받은 링크가 있다면 바로 접속하세요
        </p>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-6 text-center opacity-50">
        {[
          { icon: '📸', text: '사진 업로드' },
          { icon: '👆', text: '스와이프 투표' },
          { icon: '✨', text: '베스트컷 공개' },
        ].map(f => (
          <div key={f.text}>
            <div className="text-2xl mb-1">{f.icon}</div>
            <p className="text-xs text-white/50">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

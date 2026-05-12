import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12 animate-fade-in">
        <div className="text-6xl mb-4">📸</div>
        <h1 className="text-3xl font-semibold tracking-tight">스와이프 픽</h1>
        <p className="text-white/40 mt-2 text-sm">친구들이 골라주는 나의 베스트컷</p>
      </div>

      <div className="w-full max-w-xs space-y-3 animate-slide-up">
        <button onClick={() => navigate('/create')} className="btn-pink w-full text-base">
          사진 올리고 링크 만들기
        </button>
        <p className="text-center text-white/30 text-xs">
          공유받은 링크가 있다면 바로 접속하세요
        </p>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-6 text-center">
        {[
          { icon: '📸', text: '사진 업로드', delay: '0s' },
          { icon: '👆', text: '스와이프 투표', delay: '0.5s' },
          { icon: '✨', text: '베스트컷 공개', delay: '1s' },
        ].map(f => (
          <div key={f.text}>
            <div
              className="text-2xl mb-1 animate-icon-float"
              style={{ animationDelay: f.delay }}
            >
              {f.icon}
            </div>
            <p className="text-xs text-white/50">{f.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 max-w-xs text-center animate-fade-in">
        <div className="card-dark px-5 py-4 rounded-2xl">
          <p className="text-white/70 text-sm font-medium mb-1">"The best shot was always there.</p>
          <p className="text-white/35 text-xs leading-relaxed">
            You just needed someone else to see it."
          </p>
        </div>
      </div>
    </div>
  )
}

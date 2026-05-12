import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRoom } from '../utils/api.js'
import { shareSwipeLink } from '../utils/kakao.js'
const isHeic = (file) =>
  file.type === 'image/heic' ||
  file.type === 'image/heif' ||
  /\.(heic|heif)$/i.test(file.name)

const convertIfHeic = async (file) => {
  if (!isHeic(file)) return file
  const { default: heic2any } = await import('heic2any')
  const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
  const blob = Array.isArray(converted) ? converted[0] : converted
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' })
}

export default function Create() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [name, setName] = useState('')
  const [previews, setPreviews] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null) // { code, swipeUrl, firstPhotoUrl }
  const [copied, setCopied] = useState(false)

  const handleFiles = async (e) => {
    const selected = Array.from(e.target.files).slice(0, 5)
    setLoading(true)
    try {
      const converted = await Promise.all(selected.map(convertIfHeic))
      setFiles(converted)
      setPreviews(converted.map(f => URL.createObjectURL(f)))
    } catch {
      setError('사진 변환 중 오류가 났어요. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const removePhoto = (idx) => {
    setFiles(f => f.filter((_, i) => i !== idx))
    setPreviews(p => p.filter((_, i) => i !== idx))
  }

  const handleCreate = async () => {
    if (!name.trim()) return setError('이름을 입력해주세요')
    if (files.length < 1) return setError('사진을 1장 이상 올려주세요')
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('hostName', name.trim())
      files.forEach(f => fd.append('photos', f))
      const data = await createRoom(fd)
      const swipeUrl = `${window.location.origin}/swipe/${data.code}`
      setCreated({ code: data.code, swipeUrl, firstPhotoUrl: previews[0] })
    } catch {
      setError('업로드 실패했어요. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(created.swipeUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleKakaoShare = () => {
    shareSwipeLink({
      hostName: name.trim(),
      photoCount: files.length,
      firstPhotoUrl: created.firstPhotoUrl,
      swipeUrl: created.swipeUrl,
    })
  }

  // 방 생성 완료 화면
  if (created) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-sm mx-auto">
        <div className="text-center mb-8 animate-pop-in">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-semibold mb-1">링크가 만들어졌어요!</h2>
          <p className="text-white/40 text-sm">친구들아, 사진 골라줘! 📸</p>
        </div>

        {/* 링크 박스 */}
        <div className="w-full card-dark p-4 mb-4 animate-slide-up">
          <p className="text-white/30 text-xs mb-2">공유 링크</p>
          <p className="text-white/70 text-xs break-all font-mono">{created.swipeUrl}</p>
        </div>

        {/* 공유 버튼들 */}
        <div className="w-full space-y-3 animate-slide-up">
          {/* 카카오 공유 */}
          <button
            onClick={handleKakaoShare}
            className="w-full py-4 rounded-2xl font-medium text-sm flex items-center justify-center gap-2
                       transition-all active:scale-95"
            style={{ backgroundColor: '#FEE500', color: '#191919' }}
          >
            <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
                 className="w-5 h-5" alt="" />
            카카오톡으로 공유하기
          </button>

          {/* 링크 복사 */}
          <button onClick={copyLink} className="btn-outline w-full text-sm">
            {copied ? '✓ 복사됐어요!' : '🔗 링크 복사'}
          </button>

          {/* 내가 먼저 스와이프 */}
          <button
            onClick={() => navigate(`/swipe/${created.code}?host=true&name=${encodeURIComponent(name.trim())}`)}
            className="btn-pink w-full text-sm"
          >
            내가 먼저 해볼게 →
          </button>
        </div>

        {/* 방 코드 */}
        <p className="text-white/20 text-xs mt-6">방 코드: {created.code}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-sm mx-auto">
      <div className="mb-8 animate-fade-in">
        <h2 className="text-xl font-semibold">사진 올리기</h2>
        <p className="text-white/40 text-sm mt-1">최대 5장, 친구들이 스와이프로 골라줄 거예요</p>
      </div>

      <div className="mb-5">
        <label className="text-xs text-white/40 mb-1.5 block">내 이름 (닉네임)</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="예: 지은이"
          maxLength={10}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm
                     outline-none focus:border-pink-500/50 transition-colors placeholder-white/20"
        />
      </div>

      <div className="mb-6">
        <input ref={fileRef} type="file" accept="image/*,.heic,.heif" multiple className="hidden" onChange={handleFiles} />
        {previews.length === 0 ? (
          <button
            onClick={() => fileRef.current.click()}
            className="w-full h-52 border-2 border-dashed border-white/10 rounded-2xl
                       flex flex-col items-center justify-center gap-2 hover:border-pink-500/40 transition-colors"
          >
            <span className="text-4xl">📸</span>
            <span className="text-white/40 text-sm">사진을 선택해주세요</span>
            <span className="text-white/20 text-xs">최대 5장</span>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {previews.map((url, i) => (
                <div key={i} className="relative aspect-square animate-pop-in">
                  <img src={url} className="w-full h-full object-cover rounded-xl" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neutral-800 rounded-full
                               text-white/60 text-xs flex items-center justify-center"
                  >×</button>
                </div>
              ))}
              {previews.length < 5 && (
                <button
                  onClick={() => fileRef.current.click()}
                  className="aspect-square border border-dashed border-white/10 rounded-xl
                             flex items-center justify-center text-white/30 text-2xl hover:border-pink-500/30"
                >+</button>
              )}
            </div>
            <p className="text-xs text-white/30 text-center">{previews.length}장 선택됨</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-xs text-center mb-4">{error}</p>}

      <button onClick={handleCreate} disabled={loading} className="btn-pink w-full mt-auto">
        {loading ? '업로드 중...' : '링크 만들기 →'}
      </button>
    </div>
  )
}

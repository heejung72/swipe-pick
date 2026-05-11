import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRoom } from '../utils/api.js'

export default function Create() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [name, setName] = useState('')
  const [previews, setPreviews] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5)
    setFiles(selected)
    const urls = selected.map(f => URL.createObjectURL(f))
    setPreviews(urls)
  }

  const removePhoto = (idx) => {
    const newFiles = files.filter((_, i) => i !== idx)
    const newPreviews = previews.filter((_, i) => i !== idx)
    setFiles(newFiles)
    setPreviews(newPreviews)
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
      navigate(`/swipe/${data.code}?host=true&name=${encodeURIComponent(name.trim())}`)
    } catch (e) {
      setError('업로드 실패했어요. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-sm mx-auto">
      {/* 헤더 */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-xl font-semibold">사진 올리기</h2>
        <p className="text-white/40 text-sm mt-1">최대 5장, 친구들이 스와이프로 골라줄 거예요</p>
      </div>

      {/* 이름 */}
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

      {/* 사진 업로드 */}
      <div className="mb-6">
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

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
                  >
                    ×
                  </button>
                </div>
              ))}
              {previews.length < 5 && (
                <button
                  onClick={() => fileRef.current.click()}
                  className="aspect-square border border-dashed border-white/10 rounded-xl
                             flex items-center justify-center text-white/30 text-2xl hover:border-pink-500/30"
                >
                  +
                </button>
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

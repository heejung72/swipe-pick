const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY || ''

let initialized = false

function init() {
  if (initialized || !window.Kakao || !KAKAO_JS_KEY) return false
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_JS_KEY)
  }
  initialized = true
  return true
}

export function shareSwipeLink({ hostName, photoCount, firstPhotoUrl, swipeUrl }) {
  if (!init()) {
    // Kakao SDK 없으면 그냥 링크 복사로 fallback
    navigator.clipboard.writeText(swipeUrl)
    alert('카카오 SDK가 없어요. 링크가 복사됐어요!')
    return
  }

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: `${hostName}의 프사 골라줘 👆`,
      description: `사진 ${photoCount}장 중 베스트컷 뽑아줘! 스와이프로 5초면 끝`,
      imageUrl: firstPhotoUrl,
      link: {
        mobileWebUrl: swipeUrl,
        webUrl: swipeUrl,
      },
    },
    buttons: [
      {
        title: '스와이프하러 가기 💘',
        link: {
          mobileWebUrl: swipeUrl,
          webUrl: swipeUrl,
        },
      },
    ],
  })
}

export function shareResult({ hostName, beautyScore, bestPhotoUrl, resultUrl }) {
  if (!init()) {
    navigator.clipboard.writeText(resultUrl)
    alert('링크가 복사됐어요!')
    return
  }

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: `${hostName}의 오늘 미모점수는 ${beautyScore}점 💗`,
      description: '스와이프 픽에서 친구들이 직접 뽑은 베스트컷 확인해봐',
      imageUrl: bestPhotoUrl,
      link: {
        mobileWebUrl: resultUrl,
        webUrl: resultUrl,
      },
    },
    buttons: [
      {
        title: '결과 보기',
        link: {
          mobileWebUrl: resultUrl,
          webUrl: resultUrl,
        },
      },
    ],
  })
}

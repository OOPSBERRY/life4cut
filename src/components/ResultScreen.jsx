import { useState } from 'react'
import { copyImageToClipboard } from '../utils/saveImage'

export default function ResultScreen({ resultImage, onRestart }) {
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(null)

  async function handleCopy() {
    setSaving(true)
    setSavedMsg(null)
    try {
      await copyImageToClipboard(resultImage)
      setSavedMsg('이미지가 복사됐어요! 게시판에 붙여넣기 해보세요.')
    } catch {
      setSavedMsg('복사에 실패했어요. 사진을 길게 눌러 "이미지 복사"를 선택해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen result-screen">
      <h2>완성!</h2>
      <img src={resultImage} alt="완성된 인생네컷" className="result-image" />

      <p className="hint-text">
        사진을 길게 눌러서 "이미지 다운로드" 또는 "사진에 저장"을 선택하면 태블릿 앨범에 바로
        저장돼요.
      </p>
      <p className="hint-text">
        완성된 사진을 꾹 눌러 이미지 복사를 누르세요. 그 다음 교실 게시판에 붙여넣기 하세요.
      </p>

      {savedMsg && <p className="hint-text">{savedMsg}</p>}

      <div className="result-actions">
        <button className="btn btn-primary btn-large" onClick={handleCopy} disabled={saving}>
          {saving ? '복사 중...' : '이미지 복사하기'}
        </button>
        <button className="btn btn-ghost btn-large" onClick={onRestart}>
          다시 찍기
        </button>
      </div>
    </div>
  )
}

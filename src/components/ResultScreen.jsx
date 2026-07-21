import { useState } from 'react'
import { saveDataUrlAsImage } from '../utils/saveImage'

export default function ResultScreen({ resultImage, onRestart }) {
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(null)

  async function handleSave() {
    setSaving(true)
    setSavedMsg(null)
    try {
      const filename = `교실네컷_${Date.now()}.png`
      const result = await saveDataUrlAsImage(resultImage, filename)
      if (result.method === 'share') setSavedMsg('저장 완료! 사진 앱에서 확인해 보세요.')
      else if (result.method === 'download') setSavedMsg('다운로드 폴더에 저장되었어요.')
    } catch {
      setSavedMsg('저장에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen result-screen">
      <h2>완성!</h2>
      <img src={resultImage} alt="완성된 인생네컷" className="result-image" />

      {savedMsg && <p className="hint-text">{savedMsg}</p>}

      <div className="result-actions">
        <button className="btn btn-primary btn-large" onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '앨범에 저장하기'}
        </button>
        <button className="btn btn-ghost btn-large" onClick={onRestart}>
          다시 찍기
        </button>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

const SITE_URL = 'https://life4cut-two.vercel.app/'

export default function IntroScreen({ onNext }) {
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [showQr, setShowQr] = useState(false)

  useEffect(() => {
    QRCode.toDataURL(SITE_URL, {
      width: 220,
      margin: 1,
      color: { dark: '#2b2230', light: '#ffffff' },
    }).then(setQrDataUrl)
  }, [])

  return (
    <div className="screen intro-screen">
      <div className="camera-anim-stage">
        <div className="shutter-flash" />
        <span className="camera-body-icon">📷</span>
        <div className="polaroid">
          <div className="polaroid-photo">
            <span className="polaroid-photo-emoji">🧑‍🤝‍🧑</span>
          </div>
        </div>
      </div>

      <div className="intro-fade-in">
        <div className="intro-body">
          <h2 className="intro-title">교실 네컷</h2>
          <p className="hint-text">우리 반 친구들과 함께 찍는 즉석 포토부스</p>
        </div>
        <button className="btn btn-primary btn-large" onClick={onNext}>
          다음
        </button>
        <button className="btn btn-ghost qr-toggle-btn" onClick={() => setShowQr(true)}>
          📱 QR코드로 열기
        </button>
      </div>

      {showQr && (
        <div className="qr-overlay" onClick={() => setShowQr(false)}>
          <div className="qr-panel" onClick={(e) => e.stopPropagation()}>
            <h2>QR코드를 스캔하세요</h2>
            {qrDataUrl && <img src={qrDataUrl} alt="접속 QR코드" className="qr-image" />}
            <p className="hint-text qr-url">{SITE_URL}</p>
            <button className="btn btn-primary" onClick={() => setShowQr(false)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { playShutterSound } from '../utils/sound'

const TOTAL_SHOTS = 12
const COUNTDOWN_SECONDS = 7

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function CaptureScreen({ onComplete }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const cancelledRef = useRef(false)

  const [cameraError, setCameraError] = useState(null)
  const [photos, setPhotos] = useState([])
  const [running, setRunning] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    let active = true
    cancelledRef.current = false

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        })
        if (!active) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        setCameraError(
          '카메라를 사용할 수 없습니다. 브라우저의 카메라 권한을 허용했는지, HTTPS 주소로 접속했는지 확인해 주세요.'
        )
      }
    }

    startCamera()

    return () => {
      active = false
      cancelledRef.current = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function captureOneFrame() {
    const video = videoRef.current
    const w = video.videoWidth
    const h = video.videoHeight
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    // 화면에 보이는 대로(좌우 반전) 저장
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', 0.9)
  }

  async function startSequence() {
    setRunning(true)
    const taken = []

    for (let i = 0; i < TOTAL_SHOTS; i++) {
      if (cancelledRef.current) return
      for (let c = COUNTDOWN_SECONDS; c >= 1; c--) {
        setCountdown(c)
        await wait(1000)
        if (cancelledRef.current) return
      }
      setCountdown(null)
      setFlash(true)
      playShutterSound()
      const dataUrl = captureOneFrame()
      taken.push(dataUrl)
      setPhotos([...taken])
      await wait(180)
      setFlash(false)
      await wait(350)
    }

    setRunning(false)
    onComplete(taken)
  }

  return (
    <div className="screen capture-screen">
      <h2>
        사진 찍기 {photos.length > 0 && `(${photos.length}/${TOTAL_SHOTS})`}
      </h2>

      {cameraError ? (
        <p className="error-text">{cameraError}</p>
      ) : (
        <div className="camera-wrap">
          <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
          {flash && <div className="camera-flash" />}
          {countdown && <div className="countdown-overlay">{countdown}</div>}
        </div>
      )}

      {!running && (
        <button
          className="btn btn-primary btn-large"
          disabled={!!cameraError}
          onClick={startSequence}
        >
          {photos.length > 0 ? '다시 촬영하기' : `촬영 시작 (총 ${TOTAL_SHOTS}장)`}
        </button>
      )}

      {photos.length > 0 && (
        <div className="thumb-row">
          {photos.map((p, i) => (
            <img key={i} src={p} alt={`촬영 ${i + 1}`} className="thumb-img" />
          ))}
        </div>
      )}
    </div>
  )
}

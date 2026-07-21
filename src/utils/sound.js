let audioCtx = null

function getAudioContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    audioCtx = new Ctx()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// 카메라 셔터 "찰칵" 소리를 오디오 파일 없이 노이즈+필터로 합성
export function playShutterSound() {
  try {
    const ctx = getAudioContext()
    const duration = 0.09
    const bufferSize = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const bandpass = ctx.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.value = 3200
    bandpass.Q.value = 0.7

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.9, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    noise.connect(bandpass)
    bandpass.connect(gain)
    gain.connect(ctx.destination)

    noise.start()
    noise.stop(ctx.currentTime + duration)
  } catch {
    // 오디오 재생이 막힌 환경(자동재생 정책 등)에서는 조용히 무시
  }
}

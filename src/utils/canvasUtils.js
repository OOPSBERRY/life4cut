function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// 슬롯 영역을 꽉 채우도록 이미지를 잘라서 그리기 (object-fit: cover와 동일한 방식)
function drawImageCover(ctx, img, slot, radius = 16) {
  const scale = Math.max(slot.w / img.width, slot.h / img.height)
  const drawW = img.width * scale
  const drawH = img.height * scale
  const dx = slot.x - (drawW - slot.w) / 2
  const dy = slot.y - (drawH - slot.h) / 2

  ctx.save()
  drawRoundedRectPath(ctx, slot.x, slot.y, slot.w, slot.h, radius)
  ctx.clip()
  ctx.drawImage(img, dx, dy, drawW, drawH)
  ctx.restore()
}

function drawRoundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawFrameChrome(ctx, template) {
  const { width, height, accentColor, background, slots } = template

  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  // 바깥 테두리
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 6
  ctx.strokeRect(3, 3, width - 6, height - 6)

  // 슬롯 뒤 살짝 어두운 배경(사진 로딩 전에도 프레임 느낌이 나도록)
  slots.forEach((slot) => {
    ctx.save()
    drawRoundedRectPath(ctx, slot.x, slot.y, slot.w, slot.h, 16)
    ctx.fillStyle = '#00000010'
    ctx.fill()
    ctx.restore()
  })

  // 헤더 타이틀
  ctx.fillStyle = accentColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = 'bold 44px "Segoe UI", sans-serif'
  ctx.fillText('교실 네컷', width / 2, template.headerHeight / 2 + 10)

  // 푸터 날짜
  const dateStr = new Date().toLocaleDateString('ko-KR')
  ctx.fillStyle = '#999999'
  ctx.font = '26px "Segoe UI", sans-serif'
  ctx.fillText(dateStr, width / 2, height - template.footerHeight / 2)
}

// 프레임 배경 + 배치된 사진들을 하나의 캔버스로 합성
export async function composeFrame(template, slotPhotos) {
  const canvas = document.createElement('canvas')
  canvas.width = template.width
  canvas.height = template.height
  const ctx = canvas.getContext('2d')

  drawFrameChrome(ctx, template)

  const images = await Promise.all(
    slotPhotos.map((src) => (src ? loadImage(src) : Promise.resolve(null)))
  )

  images.forEach((img, i) => {
    if (!img) return
    drawImageCover(ctx, img, template.slots[i])
  })

  return canvas
}

export function getCanvasPos(e, canvasEl) {
  const rect = canvasEl.getBoundingClientRect()
  const scaleX = canvasEl.width / rect.width
  const scaleY = canvasEl.height / rect.height
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  }
}

function pathFromPoints(ctx, points) {
  ctx.beginPath()
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y)
    else ctx.lineTo(p.x, p.y)
  })
}

function renderStroke(ctx, action) {
  if (action.points.length < 1) return

  if (action.neon) {
    // 네온 싸인펜: 색이 있는 발광 테두리 + 흰색 코어 라인으로 형광 느낌 표현
    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = action.color
    ctx.shadowBlur = action.width * 2.2
    ctx.strokeStyle = action.color
    ctx.lineWidth = action.width
    pathFromPoints(ctx, action.points)
    ctx.stroke()
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#ffffff'
    ctx.globalAlpha = 0.85
    ctx.lineWidth = Math.max(1, action.width * 0.35)
    pathFromPoints(ctx, action.points)
    ctx.stroke()
    ctx.restore()
    return
  }

  ctx.save()
  ctx.strokeStyle = action.color
  ctx.lineWidth = action.width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  pathFromPoints(ctx, action.points)
  ctx.stroke()
  ctx.restore()
}

function renderSticker(ctx, action) {
  ctx.save()
  ctx.translate(action.x, action.y)
  ctx.rotate((action.rotation * Math.PI) / 180)
  ctx.font = `${action.size}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(action.emoji, 0, 0)
  ctx.restore()
}

function shadeColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const clamp = (v) => Math.max(0, Math.min(255, v))
  const r = clamp((num >> 16) + amount)
  const g = clamp(((num >> 8) & 0x00ff) + amount)
  const b = clamp((num & 0x0000ff) + amount)
  return `rgb(${r}, ${g}, ${b})`
}

function drawPillBadge(ctx, w, h, color, borderColor) {
  drawRoundedRectPath(ctx, -w / 2, -h / 2, w, h, h / 2)
  ctx.fillStyle = color
  ctx.fill()
  if (borderColor) {
    ctx.lineWidth = Math.max(3, h * 0.08)
    ctx.strokeStyle = borderColor
    ctx.stroke()
  }
}

function drawCloudBadge(ctx, w, h, color) {
  const r = h * 0.4
  drawRoundedRectPath(ctx, -w / 2, -h / 2, w, h, r)
  ctx.fillStyle = color
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-w * 0.12, h / 2 - 2)
  ctx.lineTo(-w * 0.26, h / 2 + h * 0.4)
  ctx.lineTo(w * 0.02, h / 2 - 2)
  ctx.closePath()
  ctx.fill()
}

function drawBurstBadge(ctx, w, h, color) {
  const spikes = 12
  const outerRx = w / 2
  const outerRy = h / 2
  const innerRx = (w / 2) * 0.8
  const innerRy = (h / 2) * 0.8
  ctx.beginPath()
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (Math.PI / spikes) * i
    const rx = i % 2 === 0 ? outerRx : innerRx
    const ry = i % 2 === 0 ? outerRy : innerRy
    const px = Math.cos(angle) * rx
    const py = Math.sin(angle) * ry
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

function drawRibbonBadge(ctx, w, h, color) {
  ctx.fillStyle = color
  ctx.fillRect(-w / 2, -h / 2, w, h)

  const foldW = h * 0.4
  ctx.fillStyle = shadeColor(color, -50)
  ctx.beginPath()
  ctx.moveTo(-w / 2, h / 2)
  ctx.lineTo(-w / 2 + foldW, h / 2)
  ctx.lineTo(-w / 2, h / 2 - foldW)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(w / 2, h / 2)
  ctx.lineTo(w / 2 - foldW, h / 2)
  ctx.lineTo(w / 2, h / 2 - foldW)
  ctx.closePath()
  ctx.fill()
}

function renderTextSticker(ctx, action) {
  ctx.save()
  ctx.translate(action.x, action.y)
  ctx.rotate((action.rotation * Math.PI) / 180)
  ctx.font = `bold ${action.fontSize}px "Segoe UI", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const paddingX = action.fontSize * 0.65
  const paddingY = action.fontSize * 0.55
  const textWidth = ctx.measureText(action.text).width
  const w = textWidth + paddingX * 2
  const h = action.fontSize + paddingY * 2

  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 3

  const shape = action.shape || 'pill'
  if (shape === 'cloud') drawCloudBadge(ctx, w, h, action.bg)
  else if (shape === 'burst') drawBurstBadge(ctx, w, h, action.bg)
  else if (shape === 'ribbon') drawRibbonBadge(ctx, w, h, action.bg)
  else drawPillBadge(ctx, w, h, action.bg, action.border)
  ctx.restore()

  ctx.fillStyle = action.textColor || '#ffffff'
  ctx.fillText(action.text, 0, action.fontSize * 0.05)
  ctx.restore()
}

function drawStarGlitter(ctx, x, y, r, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 2) * i
    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
    const midAngle = angle + Math.PI / 4
    ctx.lineTo(Math.cos(midAngle) * (r * 0.28), Math.sin(midAngle) * (r * 0.28))
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawCircleGlitter(ctx, x, y, r, color) {
  ctx.save()
  ctx.globalAlpha = 0.75
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r * 0.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.arc(x - r * 0.18, y - r * 0.18, r * 0.18, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.restore()
}

function drawCrossGlitter(ctx, x, y, r, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = color
  const angles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]
  ctx.beginPath()
  angles.forEach((angle) => {
    const tipX = Math.cos(angle) * r * 1.6
    const tipY = Math.sin(angle) * r * 1.6
    const perp = angle + Math.PI / 2
    const baseW = r * 0.14
    ctx.lineTo(Math.cos(perp) * baseW, Math.sin(perp) * baseW)
    ctx.lineTo(tipX, tipY)
    ctx.lineTo(-Math.cos(perp) * baseW, -Math.sin(perp) * baseW)
  })
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.restore()
}

const GLITTER_COLORS = ['#ffd700', '#ffffff', '#fff176', '#ffb6c1']

export const GLITTER_TYPES = [
  { id: 'star', label: '별', icon: '✨' },
  { id: 'circle', label: '동글', icon: '⚪' },
  { id: 'cross', label: '십자', icon: '✦' },
]

function drawGlitterShape(ctx, x, y, r, color, glitterType) {
  if (glitterType === 'circle') drawCircleGlitter(ctx, x, y, r, color)
  else if (glitterType === 'cross') drawCrossGlitter(ctx, x, y, r, color)
  else drawStarGlitter(ctx, x, y, r, color)
}

function renderGlitter(ctx, action) {
  action.points.forEach((p) => {
    drawGlitterShape(ctx, p.x, p.y, p.r, p.color, action.glitterType)
  })
}

export function renderAction(ctx, action) {
  if (action.type === 'stroke') renderStroke(ctx, action)
  else if (action.type === 'sticker') renderSticker(ctx, action)
  else if (action.type === 'textSticker') renderTextSticker(ctx, action)
  else if (action.type === 'glitter') renderGlitter(ctx, action)
}

export function makeGlitterPoint(x, y) {
  const r = 6 + Math.random() * 10
  const color = GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)]
  const jitterX = x + (Math.random() - 0.5) * 24
  const jitterY = y + (Math.random() - 0.5) * 24
  return { x: jitterX, y: jitterY, r, color }
}

// 베이스 이미지(프레임+사진) 위에 액션 목록(펜/스티커/글리터)을 순서대로 다시 그림
export function redrawAll(ctx, baseCanvas, actions, draftAction) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.drawImage(baseCanvas, 0, 0)
  actions.forEach((a) => renderAction(ctx, a))
  if (draftAction) renderAction(ctx, draftAction)
}

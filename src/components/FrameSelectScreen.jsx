import { useEffect, useRef } from 'react'
import { FRAME_TEMPLATES } from '../frames/frameConfigs'

function FrameThumb({ template }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const scale = 220 / template.width
    canvas.width = template.width * scale
    canvas.height = template.height * scale
    const ctx = canvas.getContext('2d')
    ctx.scale(scale, scale)

    ctx.fillStyle = template.background
    ctx.fillRect(0, 0, template.width, template.height)
    ctx.strokeStyle = template.accentColor
    ctx.lineWidth = 6
    ctx.strokeRect(3, 3, template.width - 6, template.height - 6)

    template.slots.forEach((slot) => {
      ctx.fillStyle = template.accentColor + '33'
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h)
    })

    ctx.fillStyle = template.accentColor
    ctx.textAlign = 'center'
    ctx.font = 'bold 40px sans-serif'
    ctx.fillText('교실 네컷', template.width / 2, template.headerHeight / 2 + 14)
  }, [template])

  return <canvas ref={canvasRef} className="frame-thumb-canvas" />
}

export default function FrameSelectScreen({ onSelect }) {
  return (
    <div className="screen frame-select-screen">
      <h2>프레임을 선택하세요</h2>
      <div className="frame-grid">
        {FRAME_TEMPLATES.map((template) => (
          <button
            key={template.id}
            className="frame-card"
            onClick={() => onSelect(template)}
          >
            <FrameThumb template={template} />
            <span className="frame-card-name">{template.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

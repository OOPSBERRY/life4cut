import { useEffect, useRef, useState } from 'react'
import {
  composeFrame,
  getCanvasPos,
  makeGlitterPoint,
  redrawAll,
  GLITTER_TYPES,
} from '../utils/canvasUtils'

const PEN_COLORS = ['#222222', '#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#ff6fa5']
const NEON_COLORS = ['#ff2e9a', '#39ff88', '#00e5ff', '#fffb00', '#b967ff']

const EMOJI_STICKERS = ['❤️', '⭐', '🎉', '👑', '💕', '✨', '🌈', '🎀']

const TEXT_STICKERS = [
  { value: '야호! 방학이다!', shape: 'burst', bg: '#ffe066', textColor: '#495057' },
  { value: '무한도전!', shape: 'ribbon', bg: '#4263eb', textColor: '#ffffff' },
  { value: '할 수 있어!', shape: 'cloud', bg: '#8ce99a', textColor: '#2b8a3e' },
  { value: '파이팅!', shape: 'burst', bg: '#f1f3f5', textColor: '#495057' },
  { value: '떠나자', shape: 'ribbon', bg: '#4dabf7', textColor: '#ffffff' },
  { value: '사랑해요...', shape: 'pill', bg: '#ff8fab', textColor: '#ffffff' },
  { value: '꿍...', shape: 'cloud', bg: '#ffa94d', textColor: '#7c4a03' },
  { value: '이거지~', shape: 'ribbon', bg: '#9775fa', textColor: '#ffffff' },
  { value: '꾸벅', shape: 'cloud', bg: '#63e6be', textColor: '#087f5b' },
  { value: '기분 최고!', shape: 'ribbon', bg: '#74c0fc', textColor: '#1c3a5e' },
  { value: '신난다', shape: 'burst', bg: '#ffe066', textColor: '#7c4a03' },
  { value: '최고', shape: 'pill', bg: '#ffffff', textColor: '#e64980', border: '#ffb3c6' },
  { value: '추억 쌓기', shape: 'burst', bg: '#ffc9de', textColor: '#a61e4d' },
]

const STICKER_ITEMS = [
  ...EMOJI_STICKERS.map((value) => ({ id: value, kind: 'emoji', value })),
  ...TEXT_STICKERS.map((t, i) => ({ id: `text-${i}`, kind: 'text', ...t })),
]

export default function DecorateScreen({ frame, slotPhotos, onComplete }) {
  const canvasRef = useRef(null)
  const baseCanvasRef = useRef(null)
  const draftRef = useRef(null)

  const [ready, setReady] = useState(false)
  const [actions, setActions] = useState([])
  const [tool, setTool] = useState('pen')
  const [penStyle, setPenStyle] = useState('normal')
  const [penColor, setPenColor] = useState(PEN_COLORS[0])
  const [penWidth, setPenWidth] = useState(Math.round(frame.width * 0.015))
  const [stickerItem, setStickerItem] = useState(STICKER_ITEMS[0])
  const [glitterType, setGlitterType] = useState(GLITTER_TYPES[0].id)

  useEffect(() => {
    let cancelled = false
    composeFrame(frame, slotPhotos).then((canvas) => {
      if (cancelled) return
      baseCanvasRef.current = canvas
      if (canvasRef.current) {
        canvasRef.current.width = frame.width
        canvasRef.current.height = frame.height
      }
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [frame, slotPhotos])

  function redraw() {
    if (!ready || !canvasRef.current || !baseCanvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    redrawAll(ctx, baseCanvasRef.current, actions, draftRef.current)
  }

  useEffect(redraw, [actions, ready])

  function commitAction(action) {
    setActions((prev) => [...prev, action])
    draftRef.current = null
  }

  function handlePointerDown(e) {
    if (!ready) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const pos = getCanvasPos(e, canvasRef.current)

    if (tool === 'pen') {
      draftRef.current = {
        type: 'stroke',
        color: penColor,
        width: penWidth,
        neon: penStyle === 'neon',
        points: [pos],
      }
      redraw()
    } else if (tool === 'sticker') {
      if (stickerItem.kind === 'text') {
        commitAction({
          type: 'textSticker',
          text: stickerItem.value,
          x: pos.x,
          y: pos.y,
          fontSize: Math.round(frame.width * 0.045),
          rotation: Math.random() * 16 - 8,
          shape: stickerItem.shape,
          bg: stickerItem.bg,
          textColor: stickerItem.textColor,
          border: stickerItem.border,
        })
      } else {
        commitAction({
          type: 'sticker',
          emoji: stickerItem.value,
          x: pos.x,
          y: pos.y,
          size: Math.round(frame.width * 0.14),
          rotation: Math.random() * 30 - 15,
        })
      }
    } else if (tool === 'glitter') {
      draftRef.current = {
        type: 'glitter',
        glitterType,
        points: [makeGlitterPoint(pos.x, pos.y)],
      }
      redraw()
    }
  }

  function handlePointerMove(e) {
    if (!draftRef.current) return
    const pos = getCanvasPos(e, canvasRef.current)

    if (draftRef.current.type === 'stroke') {
      draftRef.current.points.push(pos)
    } else if (draftRef.current.type === 'glitter') {
      const pts = draftRef.current.points
      const last = pts[pts.length - 1]
      if (Math.hypot(pos.x - last.x, pos.y - last.y) > 18) {
        pts.push(makeGlitterPoint(pos.x, pos.y))
      }
    }
    redraw()
  }

  function handlePointerUp() {
    if (draftRef.current) commitAction(draftRef.current)
  }

  function undo() {
    setActions((prev) => prev.slice(0, -1))
  }

  function clearAll() {
    setActions([])
  }

  function finish() {
    const dataUrl = canvasRef.current.toDataURL('image/png')
    onComplete(dataUrl)
  }

  return (
    <div className="screen decorate-screen">
      <h2>사진을 꾸며보세요</h2>

      <div className="decorate-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="decorate-canvas"
          style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        {!ready && <div className="loading-overlay">불러오는 중...</div>}
      </div>

      <div className="tool-bar">
        <div className="tool-tabs">
          <button
            className={'tool-tab' + (tool === 'pen' ? ' active' : '')}
            onClick={() => setTool('pen')}
          >
            ✏️ 펜
          </button>
          <button
            className={'tool-tab' + (tool === 'sticker' ? ' active' : '')}
            onClick={() => setTool('sticker')}
          >
            🎀 스티커
          </button>
          <button
            className={'tool-tab' + (tool === 'glitter' ? ' active' : '')}
            onClick={() => setTool('glitter')}
          >
            ✨ 반짝이
          </button>
        </div>

        {tool === 'pen' && (
          <div className="tool-options pen-options">
            <div className="pen-style-tabs">
              <button
                className={'pen-style-btn' + (penStyle === 'normal' ? ' active' : '')}
                onClick={() => {
                  setPenStyle('normal')
                  setPenColor(PEN_COLORS[0])
                }}
              >
                일반펜
              </button>
              <button
                className={'pen-style-btn' + (penStyle === 'neon' ? ' active' : '')}
                onClick={() => {
                  setPenStyle('neon')
                  setPenColor(NEON_COLORS[0])
                }}
              >
                💡 네온싸인펜
              </button>
            </div>
            <div className="pen-colors">
              {(penStyle === 'neon' ? NEON_COLORS : PEN_COLORS).map((c) => (
                <button
                  key={c}
                  className={'color-swatch' + (penColor === c ? ' active' : '')}
                  style={{ background: c }}
                  onClick={() => setPenColor(c)}
                />
              ))}
            </div>
            <div className="pen-widths">
              {[0.008, 0.015, 0.03].map((ratio) => (
                <button
                  key={ratio}
                  className={
                    'width-btn' + (Math.round(frame.width * ratio) === penWidth ? ' active' : '')
                  }
                  onClick={() => setPenWidth(Math.round(frame.width * ratio))}
                >
                  <span
                    className="width-dot"
                    style={{
                      width: 8 + ratio * 200,
                      height: 8 + ratio * 200,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {tool === 'sticker' && (
          <div className="tool-options">
            {STICKER_ITEMS.map((item) => (
              <button
                key={item.id}
                className={
                  (item.kind === 'text' ? 'sticker-btn sticker-btn-text' : 'sticker-btn') +
                  (stickerItem.id === item.id ? ' active' : '')
                }
                style={
                  item.kind === 'text'
                    ? { background: item.bg, color: item.textColor }
                    : undefined
                }
                onClick={() => setStickerItem(item)}
              >
                {item.value}
              </button>
            ))}
          </div>
        )}

        {tool === 'glitter' && (
          <div className="tool-options">
            {GLITTER_TYPES.map((g) => (
              <button
                key={g.id}
                className={'sticker-btn' + (glitterType === g.id ? ' active' : '')}
                onClick={() => setGlitterType(g.id)}
                title={g.label}
              >
                {g.icon}
              </button>
            ))}
            <span className="hint-text">캔버스를 드래그하면 반짝이가 뿌려져요</span>
          </div>
        )}
      </div>

      <div className="decorate-actions">
        <button className="btn btn-ghost" onClick={undo} disabled={actions.length === 0}>
          실행취소
        </button>
        <button className="btn btn-ghost" onClick={clearAll} disabled={actions.length === 0}>
          전체 초기화
        </button>
        <button className="btn btn-primary btn-large" onClick={finish} disabled={!ready}>
          완성하기
        </button>
      </div>
    </div>
  )
}

// 사진 한 칸의 세로/가로 비율 (인물 사진에 어울리는 세로형)
const SLOT_ASPECT = 1.3
const MARGIN = 30
const GAP = 20
const HEADER_HEIGHT = 90
const FOOTER_HEIGHT = 130
const COL_WIDTH = 480

function buildLayout(cols, rows) {
  const slotW = COL_WIDTH
  const slotH = Math.round(slotW * SLOT_ASPECT)
  const width = MARGIN * 2 + slotW * cols + GAP * (cols - 1)
  const height =
    HEADER_HEIGHT + MARGIN + slotH * rows + GAP * (rows - 1) + MARGIN + FOOTER_HEIGHT

  const slots = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slots.push({
        x: MARGIN + c * (slotW + GAP),
        y: HEADER_HEIGHT + MARGIN + r * (slotH + GAP),
        w: slotW,
        h: slotH,
      })
    }
  }
  return { width, height, slots }
}

function makeFrame(id, name, accentColor, cols, rows) {
  const layout = buildLayout(cols, rows)
  return {
    id,
    name,
    slotCount: cols * rows,
    background: '#ffffff',
    accentColor,
    headerHeight: HEADER_HEIGHT,
    footerHeight: FOOTER_HEIGHT,
    ...layout,
  }
}

export const FRAME_TEMPLATES = [
  makeFrame('strip4', '세로 4컷 스트립', '#ff6f91', 1, 4),
  makeFrame('strip6', '세로 6컷 스트립', '#4fc3f7', 1, 6),
  makeFrame('grid4', '2x2 그리드 4컷', '#9575cd', 2, 2),
  makeFrame('grid6', '2x3 그리드 6컷', '#81c784', 2, 3),
]

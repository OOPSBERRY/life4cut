// 완성 이미지를 클립보드에 복사 (교실 게시판 등에 바로 붙여넣기용)
export async function copyImageToClipboard(dataUrl) {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const item = new ClipboardItem({ [blob.type]: blob })
  await navigator.clipboard.write([item])
}

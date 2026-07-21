// Web Share API로 태블릿의 "사진 앱에 저장"을 우선 시도하고,
// 지원하지 않는 브라우저에서는 <a download> 방식으로 대체 저장한다.
export async function saveDataUrlAsImage(dataUrl, filename = '교실네컷.png') {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const file = new File([blob], filename, { type: 'image/png' })

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '교실 네컷' })
      return { method: 'share' }
    } catch (err) {
      if (err.name === 'AbortError') return { method: 'cancelled' }
      // 공유 실패 시 다운로드 방식으로 폴백
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return { method: 'download' }
}

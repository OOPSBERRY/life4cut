import { useState } from 'react'

export default function ArrangeScreen({ frame, photos, initialSlotPhotos, onComplete }) {
  const [slotPhotos, setSlotPhotos] = useState(initialSlotPhotos)
  const [activeSlot, setActiveSlot] = useState(0)

  function handleSlotClick(idx) {
    setActiveSlot(idx)
  }

  function handlePhotoClick(photo) {
    if (activeSlot === null) return
    const next = [...slotPhotos]
    next[activeSlot] = photo
    setSlotPhotos(next)

    const nextEmpty = next.findIndex((p) => !p)
    setActiveSlot(nextEmpty === -1 ? null : nextEmpty)
  }

  const allFilled = slotPhotos.every(Boolean)
  const slotAspect = frame.slots[0].w / frame.slots[0].h

  return (
    <div className="screen arrange-screen">
      <h2>프레임에 넣을 사진을 골라주세요</h2>
      <p className="hint-text">칸을 선택한 뒤, 아래에서 사진을 눌러 채워주세요.</p>

      <div className="arrange-slots" style={{ '--slot-aspect': slotAspect }}>
        {frame.slots.map((slot, idx) => (
          <button
            key={idx}
            className={'arrange-slot' + (activeSlot === idx ? ' active' : '')}
            onClick={() => handleSlotClick(idx)}
          >
            {slotPhotos[idx] ? (
              <img src={slotPhotos[idx]} alt={`슬롯 ${idx + 1}`} />
            ) : (
              <span className="slot-empty">{idx + 1}</span>
            )}
          </button>
        ))}
      </div>

      <div className="thumb-row selectable">
        {photos.map((photo, i) => (
          <button
            key={i}
            className="thumb-btn"
            onClick={() => handlePhotoClick(photo)}
          >
            <img src={photo} alt={`사진 ${i + 1}`} className="thumb-img" />
          </button>
        ))}
      </div>

      <button
        className="btn btn-primary btn-large"
        disabled={!allFilled}
        onClick={() => onComplete(slotPhotos)}
      >
        다음: 꾸미기
      </button>
    </div>
  )
}

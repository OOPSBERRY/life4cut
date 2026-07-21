export default function IntroScreen({ onNext }) {
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
      </div>
    </div>
  )
}

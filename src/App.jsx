import { useState } from 'react'
import logo from './assets/logo2.png'
import IntroScreen from './components/IntroScreen'
import FrameSelectScreen from './components/FrameSelectScreen'
import CaptureScreen from './components/CaptureScreen'
import ArrangeScreen from './components/ArrangeScreen'
import DecorateScreen from './components/DecorateScreen'
import ResultScreen from './components/ResultScreen'

const STEPS = ['intro', 'select', 'capture', 'arrange', 'decorate', 'result']

function App() {
  const [step, setStep] = useState('intro')
  const [frame, setFrame] = useState(null)
  const [photos, setPhotos] = useState([])
  const [slotPhotos, setSlotPhotos] = useState([])
  const [resultImage, setResultImage] = useState(null)

  function resetAll() {
    setFrame(null)
    setPhotos([])
    setSlotPhotos([])
    setResultImage(null)
    setStep('intro')
  }

  const stepIndex = STEPS.indexOf(step)

  return (
    <div className="app-shell">
      <header className="app-header">
        <img src={logo} alt="교실 네컷" className="app-title-logo" />
        {step !== 'intro' && (
          <button className="btn btn-ghost" onClick={resetAll}>
            처음부터
          </button>
        )}
      </header>

      {step !== 'intro' && (
        <div className="step-indicator">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={
                'step-dot' + (i === stepIndex ? ' active' : i < stepIndex ? ' done' : '')
              }
            />
          ))}
        </div>
      )}

      <main className="app-main">
        {step === 'intro' && <IntroScreen onNext={() => setStep('select')} />}

        {step === 'select' && (
          <FrameSelectScreen
            onSelect={(f) => {
              setFrame(f)
              setStep('capture')
            }}
          />
        )}

        {step === 'capture' && frame && (
          <CaptureScreen
            onComplete={(taken) => {
              setPhotos(taken)
              setSlotPhotos(new Array(frame.slotCount).fill(null))
              setStep('arrange')
            }}
          />
        )}

        {step === 'arrange' && frame && (
          <ArrangeScreen
            frame={frame}
            photos={photos}
            initialSlotPhotos={slotPhotos}
            onComplete={(assigned) => {
              setSlotPhotos(assigned)
              setStep('decorate')
            }}
          />
        )}

        {step === 'decorate' && frame && (
          <DecorateScreen
            frame={frame}
            slotPhotos={slotPhotos}
            onComplete={(dataUrl) => {
              setResultImage(dataUrl)
              setStep('result')
            }}
          />
        )}

        {step === 'result' && resultImage && (
          <ResultScreen resultImage={resultImage} onRestart={resetAll} />
        )}
      </main>
    </div>
  )
}

export default App

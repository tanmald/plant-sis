import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      {/* Plant Icon */}
      <div className="text-8xl mb-8">🌿</div>

      {/* App Name */}
      <h1 className="text-4xl font-bold text-primary mb-2">PlantSis</h1>
      <p className="text-lg text-gray-600 mb-12">Your sassy plant care companion</p>

      {/* Welcome Message */}
      <div className="max-w-md text-center mb-12">
        <h2 className="text-2xl font-bold text-text mb-4">Hey 🌿 I'm PlantSis</h2>
        <p className="text-lg text-gray-700 mb-8">
          I help you keep plants alive, happy, and drama-free. You bring the plants — I'll bring
          the common sense.
        </p>

        {/* Value Props */}
        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📸</span>
            <div>
              <p className="font-medium text-text">Snap a photo → I'll ID your plant</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">👀</span>
            <div>
              <p className="font-medium text-text">Quick check-ins → I'll tell you what to do</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💚</span>
            <div>
              <p className="font-medium text-text">No judgment, just good vibes</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => navigate('/signup')}
          className="btn-primary w-full"
        >
          Let's Start
        </button>
        <button
          onClick={() => navigate('/login')}
          className="text-primary font-medium w-full py-2"
        >
          I already have an account
        </button>
      </div>
    </div>
  )
}

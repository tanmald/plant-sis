import { useNavigate } from 'react-router-dom'
import { Camera, Sparkles, Heart } from 'lucide-react'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-background via-background to-card">
      {/* Plant Icon with animation */}
      <div className="text-8xl mb-8 animate-bounce-soft">🌿</div>

      {/* App Name */}
      <h1 className="text-5xl md:text-6xl font-black text-foreground mb-3 text-center">PlantSis</h1>
      <p className="text-xl text-charcoal-600 mb-16 text-center max-w-md">
        Your plant bestie with zero judgment and all the vibes
      </p>

      {/* Value Props - Glass Cards */}
      <div className="w-full max-w-md space-y-4 mb-16 animate-slide-up">
        <div className="card-glass p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center flex-shrink-0">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground text-lg">Snap & identify your plant babies</p>
            <p className="text-sm text-charcoal-600 mt-1">Take a photo, I'll tell you what it is</p>
          </div>
        </div>

        <div className="card-glass p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground text-lg">Get the tea on what they need</p>
            <p className="text-sm text-charcoal-600 mt-1">Quick check-ins, expert guidance</p>
          </div>
        </div>

        <div className="card-glass p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sunset-400 to-sunset-600 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground text-lg">Zero judgment, pure support</p>
            <p className="text-sm text-charcoal-600 mt-1">We all forget to water sometimes</p>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="w-full max-w-md space-y-3">
        <button
          onClick={() => navigate('/signup')}
          className="btn-primary w-full"
        >
          Let's Do This ✨
        </button>
        <button
          onClick={() => navigate('/login')}
          className="btn-ghost w-full"
        >
          Already vibing with us? Log in
        </button>
      </div>
    </div>
  )
}

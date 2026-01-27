import { useState } from "react";
import { Leaf, Sun, Sparkles, ArrowRight, Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn, IDENTITY_OPTIONS } from "@/lib/utils";

interface OnboardingWizardProps {
  onComplete: (displayName: string, identityPreference: string, experienceLevel: string) => void;
}

const steps = [
  { id: 1, title: "Welcome", icon: Leaf },
  { id: 2, title: "Your Name", icon: Sparkles },
  { id: 3, title: "Identity", icon: User },
  { id: 4, title: "Experience", icon: Sun },
  { id: 5, title: "Ready!", icon: Check },
];

const experienceLevels = [
  { id: "newbie", label: "Plant Newbie 🌱", description: "Just getting started with my plant journey" },
  { id: "growing", label: "Growing Gardener 🌿", description: "I have a few plants and want to learn more" },
  { id: "expert", label: "Plant Parent Pro 🌳", description: "I'm experienced and love caring for plants" },
];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [identity, setIdentity] = useState<string>("prefer-not-to-say");
  const [experience, setExperience] = useState("");

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    onComplete(displayName || "Plant Lover", identity, experience);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return displayName.trim().length > 0;
      case 3:
        return identity !== "";
      case 4:
        return experience !== "";
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-warm">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-wiggle">🌿</div>
      <div className="absolute bottom-10 right-10 text-5xl opacity-20 animate-wiggle" style={{ animationDelay: "0.5s" }}>🪴</div>
      
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-1 text-xs font-medium transition-colors",
                  currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                )}
              >
                <step.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-2xl shadow-warm-lg p-8 min-h-[400px] flex flex-col">
          {currentStep === 1 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center animate-bounce-gentle">
                <Leaf className="w-10 h-10 text-secondary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-3xl mb-2">Welcome to PlantSis! 🌿</h1>
                <p className="text-muted-foreground font-handwritten text-xl">
                  Your new bestie for plant care ✨
                </p>
              </div>
              <p className="text-foreground/80 max-w-sm">
                Let's set up your profile so we can give your plant babies the best care possible!
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="text-center">
                <h2 className="font-display text-2xl mb-2">What should we call you?</h2>
                <p className="text-muted-foreground">Your plants will love knowing your name 💚</p>
              </div>
              <div className="w-full max-w-xs space-y-2">
                <Label htmlFor="displayName">Your Name</Label>
                <Input
                  id="displayName"
                  placeholder="e.g., Plant Parent Sarah"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-12 rounded-xl text-center text-lg"
                  autoFocus
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex-1 flex flex-col space-y-6">
              <div className="text-center">
                <h2 className="font-display text-2xl mb-2">How do you identify?</h2>
                <p className="text-muted-foreground">
                  Help us personalize your experience 💜<br/>
                  <span className="text-xs">You can change this anytime</span>
                </p>
              </div>
              <RadioGroup value={identity} onValueChange={setIdentity} className="space-y-3">
                {IDENTITY_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                      identity === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                    onClick={() => setIdentity(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                      <div className="text-xs text-primary mt-1">
                        We'll call you: <span className="font-handwritten">{option.title}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {currentStep === 4 && (
            <div className="flex-1 flex flex-col space-y-6">
              <div className="text-center">
                <h2 className="font-display text-2xl mb-2">What's your plant experience?</h2>
                <p className="text-muted-foreground">No judgment, we all start somewhere! 🌱</p>
              </div>
              <div className="space-y-3">
                {experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setExperience(level.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      experience === level.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="font-semibold">{level.label}</div>
                    <div className="text-sm text-muted-foreground">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="text-6xl animate-wiggle">🎉</div>
              <div>
                <h2 className="font-display text-3xl mb-2">You're all set, {displayName || "bestie"}!</h2>
                <p className="text-muted-foreground font-handwritten text-xl">
                  Time to grow your plant fam ✨
                </p>
                <p className="text-sm text-primary mt-2">
                  We'll call you: {IDENTITY_OPTIONS.find(o => o.value === identity)?.title} 💚
                </p>
              </div>
              <div className="flex gap-3 text-4xl">
                <span className="animate-bounce-gentle" style={{ animationDelay: "0s" }}>🌿</span>
                <span className="animate-bounce-gentle" style={{ animationDelay: "0.2s" }}>🌱</span>
                <span className="animate-bounce-gentle" style={{ animationDelay: "0.4s" }}>🪴</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-end">
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="rounded-xl px-6"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="rounded-xl px-6 shadow-warm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Let's Go!
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

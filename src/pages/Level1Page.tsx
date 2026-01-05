import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { LevelHeader } from '@/components/game/LevelHeader';
import { ProgressBar } from '@/components/game/ProgressBar';
import { QualityCard } from '@/components/game/QualityCard';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// Import quality images
import rigueurImg from '@/assets/qualities/rigueur.png';
import curiositeImg from '@/assets/qualities/curiosite.png';
import espritEquipeImg from '@/assets/qualities/esprit-equipe.png';
import autonomieImg from '@/assets/qualities/autonomie.png';
import ponctualiteImg from '@/assets/qualities/ponctualite.png';
import patienceImg from '@/assets/qualities/patience.png';
import humourImg from '@/assets/qualities/humour.png';
import competitiviteImg from '@/assets/qualities/competitivite.png';

const qualities = [
  { id: 'rigueur', label: 'Rigueur', isCorrect: true, image: rigueurImg },
  { id: 'curiosite', label: 'Curiosité', isCorrect: true, image: curiositeImg },
  { id: 'esprit-equipe', label: "Esprit d'équipe", isCorrect: true, image: espritEquipeImg },
  { id: 'autonomie', label: 'Autonomie', isCorrect: true, image: autonomieImg },
  { id: 'ponctualite', label: 'Ponctualité', isCorrect: false, image: ponctualiteImg },
  { id: 'patience', label: 'Patience', isCorrect: false, image: patienceImg },
  { id: 'humour', label: "Sens de l'humour", isCorrect: false, image: humourImg },
  { id: 'competitivite', label: 'Compétitivité', isCorrect: false, image: competitiviteImg },
];
export default function Level1Page() {
  const navigate = useNavigate();
  const { gameState, setLevel1Choices, completeLevel } = useGame();
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
  const [hasValidated, setHasValidated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const toggleQuality = (id: string) => {
    if (hasValidated) return;
    
    setSelectedQualities((prev) => {
      if (prev.includes(id)) {
        return prev.filter((q) => q !== id);
      }
      if (prev.length >= 4) {
        toast.warning('Vous ne pouvez sélectionner que 4 qualités');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleValidate = () => {
    if (selectedQualities.length !== 4) {
      toast.error('Veuillez sélectionner exactement 4 qualités');
      return;
    }

    const correctQualities = qualities.filter((q) => q.isCorrect).map((q) => q.id);
    const allCorrect = correctQualities.every((q) => selectedQualities.includes(q));

    setHasValidated(true);
    setIsCorrect(allCorrect);
    setLevel1Choices(selectedQualities);

    if (allCorrect) {
      toast.success('Bravo ! Vous avez identifié les 4 qualités essentielles !', {
        icon: <CheckCircle2 className="h-5 w-5 text-success" />,
      });
    } else {
      toast.error('Ce n\'est pas tout à fait correct. Réessayez !', {
        icon: <AlertCircle className="h-5 w-5 text-destructive" />,
      });
    }
  };

  const handleRetry = () => {
    setSelectedQualities([]);
    setHasValidated(false);
    setIsCorrect(false);
  };

  const handleContinue = () => {
    completeLevel(1);
    navigate('/niveau-2');
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <ProgressBar
            currentLevel={gameState.currentLevel}
            completedLevels={gameState.completedLevels}
          />
        </div>

        {/* Level Header */}
        <LevelHeader
          levelNumber={1}
          title="Le Bilan de Soi"
          objective="Identifier ses qualités personnelles les plus importantes pour réussir un stage PFE."
          character="Mme Fatma (RH) vous demande une auto-évaluation..."
        />

        {/* Instructions */}
        <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <p className="text-lg text-muted-foreground">
            Sélectionnez exactement <span className="font-bold text-primary">4 qualités</span> parmi les 8 proposées
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {selectedQualities.length}/4 sélectionnées
          </p>
        </div>

        {/* Quality Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {qualities.map((quality, index) => (
            <QualityCard
              key={quality.id}
              id={quality.id}
              label={quality.label}
              image={quality.image}
              isSelected={selectedQualities.includes(quality.id)}
              onToggle={toggleQuality}
              disabled={hasValidated}
              animationDelay={300 + index * 50}
            />
          ))}
        </div>

        {/* Validation / Feedback */}
        <div className="flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: '700ms' }}>
          {!hasValidated && (
            <Button
              size="lg"
              onClick={handleValidate}
              disabled={selectedQualities.length !== 4}
            >
              Valider ma sélection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}

          {hasValidated && !isCorrect && (
            <div className="text-center">
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-4">
                <p className="text-destructive font-medium">
                  Ce n'est pas tout à fait correct. Les bonnes réponses sont : Rigueur, Curiosité, Esprit d'équipe et Autonomie.
                </p>
              </div>
              <Button size="lg" variant="outline" onClick={handleRetry}>
                Réessayer
              </Button>
            </div>
          )}

          {hasValidated && isCorrect && (
            <div className="text-center">
              <div className="bg-success/10 border border-success/20 rounded-xl p-4 mb-4">
                <p className="text-success font-medium">
                  Excellent ! Vous avez correctement identifié les qualités essentielles pour un stage PFE.
                </p>
              </div>
              <Button size="lg" variant="success" onClick={handleContinue}>
                Passer au niveau suivant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

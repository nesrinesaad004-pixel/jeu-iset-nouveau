import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { LevelHeader } from '@/components/game/LevelHeader';
import { ProgressBar } from '@/components/game/ProgressBar';
import { ArrowRight, Mail, GripVertical, Volume2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const mailBlocks = [
  { id: 'salutation', content: 'Chère Madame Fatma,', order: 1 },
  { id: 'remerciement', content: 'Je vous remercie de votre invitation et vous confirme ma présence à l\'entretien de stage PFE à TechTunis.', order: 2 },
  { id: 'disponibilite', content: 'Je reste disponible pour toute information complémentaire.', order: 3 },
  { id: 'signature', content: 'Cordialement,', order: 4 },
];

export default function Level3Page() {
  const navigate = useNavigate();
  const { gameState, setLevel3Order, completeLevel } = useGame();
  
  const [blocks, setBlocks] = useState(() => 
    [...mailBlocks].sort(() => Math.random() - 0.5)
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFinished, setAudioFinished] = useState(false);
  const [wantsToListen, setWantsToListen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBlocks = [...blocks];
    const draggedBlock = newBlocks[draggedIndex];
    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(index, 0, draggedBlock);
    
    setBlocks(newBlocks);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const checkOrder = () => {
    const correctOrder = mailBlocks.map(b => b.id);
    const currentOrder = blocks.map(b => b.id);
    return correctOrder.every((id, index) => id === currentOrder[index]);
  };

  const handleValidate = () => {
    const correct = checkOrder();
    setIsCorrect(correct);
    setHasValidated(true);
    setLevel3Order(blocks.map(b => b.id));

    if (correct) {
      toast.success('Bravo ! Votre réponse est claire et professionnelle !');
    } else {
      toast.error('L\'ordre n\'est pas correct. Réessayez !');
    }
  };

  const playAudio = () => {
    setIsPlaying(true);
    // Simulate audio playback with speech synthesis
    const fullText = blocks.map(b => b.content).join(' ');
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    
    utterance.onend = () => {
      setIsPlaying(false);
      setAudioFinished(true);
    };

    speechSynthesis.speak(utterance);
  };

  const handleRetry = () => {
    setBlocks([...mailBlocks].sort(() => Math.random() - 0.5));
    setHasValidated(false);
    setIsCorrect(false);
  };

  const handleListenToggle = () => {
    if (!wantsToListen) {
      setWantsToListen(true);
      playAudio();
    }
  };

  const handleContinue = () => {
    completeLevel(3);
    navigate('/niveau-4');
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
          levelNumber={3}
          title="L'Invitation"
          objective="Savoir répondre correctement à un e-mail d'entretien, avec une formulation claire, polie et professionnelle."
        />

        {/* Email Context */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-md animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground">Email reçu de TechTunis</h3>
              <p className="text-sm text-muted-foreground">De: fatma.benali@techtunis.tn</p>
            </div>
          </div>
          <div className="bg-muted rounded-xl p-4 text-muted-foreground">
            <p className="mb-2">Bonjour,</p>
            <p className="mb-2">
              Suite à votre candidature pour un stage PFE, nous avons le plaisir de vous inviter à un entretien 
              dans nos locaux à Tunis le lundi 15 janvier 2025 à 10h00.
            </p>
            <p className="mb-2">
              Merci de confirmer votre présence.
            </p>
            <p>Cordialement,<br />Mme Fatma Ben Ali<br />Responsable RH - TechTunis</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <p className="text-lg text-muted-foreground">
            Glissez-déposez les blocs pour reconstituer un <span className="font-bold text-primary">mail de réponse professionnel</span>
          </p>
        </div>

        {/* Drag & Drop Area */}
        <div className="bg-card border-2 border-dashed border-border rounded-2xl p-6 mb-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="space-y-3">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                draggable={!hasValidated}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300",
                  hasValidated && isCorrect
                    ? "border-success bg-success/5"
                    : hasValidated && !isCorrect
                    ? "border-destructive bg-destructive/5"
                    : "border-border bg-background cursor-grab active:cursor-grabbing hover:border-primary/50",
                  draggedIndex === index && "opacity-50 border-primary"
                )}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <p className="flex-1 text-foreground">{block.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Option (when correct) */}
        {hasValidated && isCorrect && (
          <div className="flex items-center justify-center gap-4 mb-6 animate-fade-in">
            {!wantsToListen ? (
              <Button variant="outline" size="lg" onClick={handleListenToggle} className="gap-2">
                <Volume2 className="h-5 w-5" />
                Écouter mon mail
              </Button>
            ) : (
              <div className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-full",
                isPlaying ? "bg-primary/10" : "bg-muted"
              )}>
                <Volume2 className={cn(
                  "h-5 w-5",
                  isPlaying ? "text-primary animate-pulse" : "text-muted-foreground"
                )} />
                <span className="text-sm font-medium">
                  {isPlaying ? "Lecture en cours..." : "Lecture terminée"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Validation / Actions */}
        <div className="flex flex-col items-center gap-4">
          {!hasValidated && (
            <Button size="lg" onClick={handleValidate}>
              Valider l'ordre
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}

          {hasValidated && !isCorrect && (
            <div className="text-center">
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-4">
                <p className="text-destructive font-medium">
                  L'ordre du mail n'est pas correct. Pensez à la structure : salutation, corps du message, formule de politesse.
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
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <p className="text-success font-semibold">Excellent travail !</p>
                </div>
                <p className="text-success/80">
                  Votre réponse est claire, professionnelle et bien formulée.
                </p>
              </div>
              <Button
                size="lg"
                variant="success"
                onClick={handleContinue}
              >
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

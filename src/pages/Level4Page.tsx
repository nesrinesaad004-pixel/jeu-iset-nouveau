import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { LevelHeader } from '@/components/game/LevelHeader';
import { ProgressBar } from '@/components/game/ProgressBar';
import { ArrowRight, User, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Import avatar images
import avatarProfessionnel from '@/assets/avatars/avatar-professionnel.png';
import avatarDecontracte from '@/assets/avatars/avatar-decontracte.png';
import avatarSportif from '@/assets/avatars/avatar-sportif.png';
import avatarCasual from '@/assets/avatars/avatar-casual.png';

const avatars = [
  { id: 'professionnel', label: 'Professionnel', image: avatarProfessionnel, isCorrect: true },
  { id: 'decontracte', label: 'Décontracté', image: avatarDecontracte, isCorrect: false },
  { id: 'sportif', label: 'Sportif', image: avatarSportif, isCorrect: false },
  { id: 'casual', label: 'Casual', image: avatarCasual, isCorrect: false },
];

const getPitchBlocks = (prenom: string, nom: string, specialite: string) => [
  { id: 'salutation', content: 'Bonjour, merci de me recevoir aujourd\'hui.', order: 1 },
  { id: 'presentation', content: `Je m'appelle ${prenom} ${nom}, étudiant(e) en 3ème année ${specialite}.`, order: 2 },
  { id: 'motivation', content: 'Je suis passionné(e) par mon domaine et je souhaite mettre mes compétences au service de TechTunis.', order: 3 },
  { id: 'conclusion', content: 'Ce stage PFE représente pour moi une opportunité idéale de contribuer à des projets concrets.', order: 4 },
];

export default function Level4Page() {
  const navigate = useNavigate();
  const { gameState, completeLevel } = useGame();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const prenom = gameState.studentInfo?.prenom || 'Prénom';
  const nom = gameState.studentInfo?.nom || 'Nom';
  const specialite = gameState.studentInfo?.specialite || 'Informatique';
  
  const pitchBlocks = getPitchBlocks(prenom, nom, specialite);
  
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [blocks, setBlocks] = useState(() => 
    [...pitchBlocks].sort(() => Math.random() - 0.5)
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasValidated, setHasValidated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [avatarValidated, setAvatarValidated] = useState(false);
  const [avatarCorrect, setAvatarCorrect] = useState(false);

  const handleAvatarSelect = (id: string) => {
    setSelectedAvatar(id);
  };

  const handleAvatarConfirm = () => {
    if (!selectedAvatar) {
      toast.error('Veuillez sélectionner un avatar');
      return;
    }
    
    const selected = avatars.find(a => a.id === selectedAvatar);
    setAvatarValidated(true);
    
    if (selected?.isCorrect) {
      setAvatarCorrect(true);
      toast.success('Excellent choix ! Une tenue professionnelle est essentielle pour un entretien.');
      setTimeout(() => setStep(2), 1500);
    } else {
      setAvatarCorrect(false);
      toast.error('Cette tenue n\'est pas appropriée pour un entretien professionnel.');
    }
  };

  const handleAvatarRetry = () => {
    setSelectedAvatar(null);
    setAvatarValidated(false);
    setAvatarCorrect(false);
  };

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
    const correctOrder = pitchBlocks.map(b => b.id);
    const currentOrder = blocks.map(b => b.id);
    return correctOrder.every((id, index) => id === currentOrder[index]);
  };

  const handleValidate = () => {
    const correct = checkOrder();
    setIsCorrect(correct);
    setHasValidated(true);

    if (correct) {
      toast.success('Excellent ! Votre pitch est parfaitement structuré !');
    } else {
      toast.error('L\'ordre n\'est pas optimal. Réessayez !');
    }
  };

  const handleRetry = () => {
    setBlocks([...pitchBlocks].sort(() => Math.random() - 0.5));
    setHasValidated(false);
    setIsCorrect(false);
  };

  const handleContinue = () => {
    completeLevel(4);
    navigate('/niveau-5');
  };

  const playPitchAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const pitchText = blocks.map(b => b.content).join(' ');
    const utterance = new SpeechSynthesisUtterance(pitchText);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
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
          levelNumber={4}
          title="L'Entretien"
          objective="Adopter une posture professionnelle et construire une présentation personnelle claire et structurée lors du début d'un entretien."
        />

        {/* Step 1: Avatar Selection */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-display font-semibold text-foreground text-center mb-6">
              Choisissez votre avatar pour l'entretien
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => !avatarValidated && handleAvatarSelect(avatar.id)}
                  disabled={avatarValidated}
                  className={cn(
                    "game-card flex flex-col items-center gap-3 py-6 cursor-pointer transition-all",
                    selectedAvatar === avatar.id && !avatarValidated && "selected",
                    selectedAvatar === avatar.id && avatarValidated && avatarCorrect && "border-success bg-success/10",
                    selectedAvatar === avatar.id && avatarValidated && !avatarCorrect && "border-destructive bg-destructive/10",
                    avatarValidated && "cursor-not-allowed opacity-70",
                    avatarValidated && selectedAvatar === avatar.id && "opacity-100"
                  )}
                >
                  <img src={avatar.image} alt={avatar.label} className="w-20 h-20 rounded-full object-cover" />
                  <span className="font-medium text-foreground">{avatar.label}</span>
                  {avatarValidated && avatar.isCorrect && (
                    <span className="text-xs text-success font-medium">✓ Tenue professionnelle</span>
                  )}
                </button>
              ))}
            </div>

            {/* Avatar Validation Feedback */}
            {avatarValidated && !avatarCorrect && (
              <div className="text-center mb-6">
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-4">
                  <p className="text-destructive font-medium">
                    Cette tenue n'est pas appropriée pour un entretien professionnel. Choisissez une tenue professionnelle.
                  </p>
                </div>
                <Button size="lg" variant="outline" onClick={handleAvatarRetry}>
                  Réessayer
                </Button>
              </div>
            )}

            {avatarValidated && avatarCorrect && (
              <div className="text-center mb-6">
                <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                  <p className="text-success font-medium">
                    Excellent choix ! Une tenue professionnelle est essentielle pour faire bonne impression.
                  </p>
                </div>
              </div>
            )}

            {!avatarValidated && (
              <div className="flex justify-center">
                <Button size="lg" onClick={handleAvatarConfirm} disabled={!selectedAvatar}>
                  Confirmer mon avatar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Pitch Order */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-6">
              <img 
                src={avatars.find(a => a.id === selectedAvatar)?.image} 
                alt="Avatar" 
                className="w-16 h-16 rounded-2xl object-cover shadow-lg"
              />
              <div>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Construisez votre pitch de présentation
                </h2>
                <p className="text-muted-foreground">
                  Organisez les éléments dans l'ordre logique
                </p>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div className="bg-card border-2 border-dashed border-border rounded-2xl p-6 mb-8">
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
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {index + 1}
                    </div>
                    <p className="flex-1 text-foreground">{block.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Button */}
            <div className="flex justify-center mb-6">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={playPitchAudio}
                className="gap-2"
              >
                {isPlaying ? (
                  <>
                    <VolumeX className="h-5 w-5" />
                    Arrêter la lecture
                  </>
                ) : (
                  <>
                    <Volume2 className="h-5 w-5" />
                    Écouter mon pitch
                  </>
                )}
              </Button>
            </div>

            {/* Validation / Actions */}
            <div className="flex flex-col items-center gap-4">
              {!hasValidated && (
                <Button size="lg" onClick={handleValidate}>
                  Valider mon pitch
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}

              {hasValidated && !isCorrect && (
                <div className="text-center">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-4">
                    <p className="text-destructive font-medium">
                      L'ordre n'est pas optimal. Commencez par la salutation, puis présentez-vous, expliquez votre motivation et concluez.
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
                      <p className="text-success font-semibold">Parfait !</p>
                    </div>
                    <p className="text-success/80">
                      Votre pitch est clair, structuré et professionnel.
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
        )}
      </div>
    </div>
  );
}

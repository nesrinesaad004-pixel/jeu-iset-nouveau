import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { LevelHeader } from '@/components/game/LevelHeader';
import { ProgressBar } from '@/components/game/ProgressBar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowRight, MessageCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const scenarios = [
  {
    id: 'q1',
    question: 'Votre recruteur vous demande : "Parlez-moi de votre plus grand échec." Que répondez-vous ?',
    options: [
      { id: 'a', label: 'Je n\'ai jamais échoué, je réussis toujours tout.', isCorrect: false },
      { id: 'b', label: 'Lors d\'un projet universitaire, j\'ai sous-estimé le temps nécessaire. J\'ai appris à mieux planifier depuis.', isCorrect: true },
      { id: 'c', label: 'Je préfère ne pas en parler, c\'est personnel.', isCorrect: false },
    ],
  },
  {
    id: 'q2',
    question: 'On vous propose un café avant l\'entretien. Que faites-vous ?',
    options: [
      { id: 'a', label: 'Je refuse poliment mais je remercie.', isCorrect: false },
      { id: 'b', label: 'J\'accepte avec un sourire et je remercie.', isCorrect: true },
      { id: 'c', label: 'Je demande plutôt un jus d\'orange.', isCorrect: false },
    ],
  },
  {
    id: 'q3',
    question: 'Le recruteur vous dit : "Avez-vous des questions ?" Que répondez-vous ?',
    options: [
      { id: 'a', label: 'Non, vous avez tout expliqué clairement.', isCorrect: false },
      { id: 'b', label: 'Combien d\'heures de pause ai-je par jour ?', isCorrect: false },
      { id: 'c', label: 'Oui, quelles sont les technologies utilisées dans vos projets actuels ?', isCorrect: true },
    ],
  },
];

export default function Level5Page() {
  const navigate = useNavigate();
  const { gameState, completeLevel } = useGame();
  
  const [currentScenario, setCurrentScenario] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [hasValidated, setHasValidated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const scenario = scenarios[currentScenario];
  const isLastScenario = currentScenario === scenarios.length - 1;

  const handleValidate = () => {
    if (!selectedAnswer) {
      toast.error('Veuillez sélectionner une réponse');
      return;
    }

    const correct = scenario.options.find(o => o.id === selectedAnswer)?.isCorrect || false;
    setHasValidated(true);
    setIsCorrect(correct);
    setAnswers(prev => ({ ...prev, [scenario.id]: selectedAnswer }));

    if (correct) {
      toast.success('Bonne réponse !');
    } else {
      const correctOption = scenario.options.find(o => o.isCorrect);
      toast.error(`La meilleure réponse était : "${correctOption?.label}"`);
    }
  };

  const handleNext = () => {
    if (isLastScenario) {
      // Calculate final score
      const correctAnswers = Object.entries(answers).filter(([qId, aId]) => {
        const question = scenarios.find(s => s.id === qId);
        return question?.options.find(o => o.id === aId)?.isCorrect;
      }).length + (isCorrect ? 1 : 0);

      completeLevel(5);
      navigate('/resultat');
    } else {
      setCurrentScenario(prev => prev + 1);
      setSelectedAnswer('');
      setHasValidated(false);
      setIsCorrect(false);
    }
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
          levelNumber={5}
          title="Réagir en situation"
          objective="Développer les bons réflexes professionnels face à des situations et questions courantes en entreprise."
        />

        {/* Scenario Progress */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          {scenarios.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index < currentScenario && "bg-success",
                index === currentScenario && "bg-primary w-6",
                index > currentScenario && "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Scenario Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-md animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Situation {currentScenario + 1}/{scenarios.length}</p>
              <h3 className="text-lg font-display font-semibold text-foreground">
                {scenario.question}
              </h3>
            </div>
          </div>

          {/* Options */}
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            disabled={hasValidated}
            className="space-y-3"
          >
            {scenario.options.map((option) => (
              <div
                key={option.id}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer",
                  selectedAnswer === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/50",
                  hasValidated && option.isCorrect && "border-success bg-success/5",
                  hasValidated && selectedAnswer === option.id && !option.isCorrect && "border-destructive bg-destructive/5"
                )}
                onClick={() => !hasValidated && setSelectedAnswer(option.id)}
              >
                <RadioGroupItem value={option.id} id={`${scenario.id}-${option.id}`} />
                <Label htmlFor={`${scenario.id}-${option.id}`} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
                {hasValidated && option.isCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4">
          {!hasValidated && (
            <Button size="lg" onClick={handleValidate} disabled={!selectedAnswer}>
              Valider ma réponse
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}

          {hasValidated && (
            <Button size="lg" variant={isCorrect ? "success" : "default"} onClick={handleNext}>
              {isLastScenario ? "Voir mes résultats" : "Question suivante"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

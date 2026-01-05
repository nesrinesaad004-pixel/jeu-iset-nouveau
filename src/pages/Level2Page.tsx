import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { LevelHeader } from '@/components/game/LevelHeader';
import { ProgressBar } from '@/components/game/ProgressBar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowRight, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const domainOptions = [
  { id: 'A', label: 'Sites e-commerce grand public', isCorrect: false },
  { id: 'B', label: 'Jeux vidéo', isCorrect: false },
  { id: 'C', label: 'Solutions ERP personnalisées et transformation digitale des PME tunisiennes', isCorrect: true },
  { id: 'D', label: 'Cybersécurité', isCorrect: false },
];

const valueOptions = [
  { id: 'innovation', label: 'Innovation', isCorrect: true },
  { id: 'competitivite', label: 'Compétitivité à tout prix', isCorrect: false },
  { id: 'collaboration', label: 'Collaboration', isCorrect: true },
  { id: 'rapidite', label: 'Rapidité avant qualité', isCorrect: false },
  { id: 'rigueur', label: 'Rigueur', isCorrect: true },
  { id: 'travail-individuel', label: 'Travail 100% individuel', isCorrect: false },
  { id: 'proximite', label: 'Proximité client', isCorrect: true },
  { id: 'standardisation', label: 'Standardisation maximale', isCorrect: false },
];

export default function Level2Page() {
  const navigate = useNavigate();
  const { gameState, setLevel2Domain, setLevel2Values, completeLevel } = useGame();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [domainValidated, setDomainValidated] = useState(false);
  const [valuesValidated, setValuesValidated] = useState(false);
  const [domainCorrect, setDomainCorrect] = useState(false);
  const [valuesCorrect, setValuesCorrect] = useState(false);

  const toggleValue = (id: string) => {
    if (valuesValidated) return;
    
    setSelectedValues((prev) => {
      if (prev.includes(id)) {
        return prev.filter((v) => v !== id);
      }
      if (prev.length >= 4) {
        toast.warning('Vous ne pouvez sélectionner que 4 valeurs');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleValidateDomain = () => {
    if (!selectedDomain) {
      toast.error('Veuillez sélectionner une réponse');
      return;
    }

    const correct = domainOptions.find((d) => d.id === selectedDomain)?.isCorrect || false;
    setDomainValidated(true);
    setDomainCorrect(correct);
    setLevel2Domain(selectedDomain);

    if (correct) {
      toast.success('Bonne réponse !');
      setTimeout(() => setStep(2), 1500);
    } else {
      toast.error('Ce n\'est pas la bonne réponse');
    }
  };

  const handleValidateValues = () => {
    if (selectedValues.length !== 4) {
      toast.error('Veuillez sélectionner exactement 4 valeurs');
      return;
    }

    const correctValues = valueOptions.filter((v) => v.isCorrect).map((v) => v.id);
    const allCorrect = correctValues.every((v) => selectedValues.includes(v));

    setValuesValidated(true);
    setValuesCorrect(allCorrect);
    setLevel2Values(selectedValues);

    if (allCorrect) {
      toast.success('Excellent ! Vous connaissez bien TechTunis !');
    } else {
      toast.error('Ce n\'est pas tout à fait correct');
    }
  };

  const handleContinue = () => {
    completeLevel(2);
    navigate('/niveau-3');
  };

  const handleRetryDomain = () => {
    setSelectedDomain('');
    setDomainValidated(false);
  };

  const handleRetryValues = () => {
    setSelectedValues([]);
    setValuesValidated(false);
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
          levelNumber={2}
          title="L'Investigation"
          objective="Apprendre à analyser une entreprise, comprendre son domaine d'activité et identifier ses valeurs essentielles avant un entretien."
        />

        {/* Company Info Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-md animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-foreground">TechTunis</h3>
              <p className="text-sm text-muted-foreground">Entreprise tunisienne • Créée en 2015 • Tunis</p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            TechTunis conçoit et déploie des <strong>solutions ERP personnalisées</strong> ainsi que des applications web et mobiles pour les petites et moyennes entreprises tunisiennes. Notre mission : rendre la transformation digitale accessible, simple et rentable pour les acteurs locaux.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted rounded-lg p-3">
              <span className="text-muted-foreground">✓ Technologies modernes et évolutives</span>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <span className="text-muted-foreground">✓ Travail collaboratif en mode Agile</span>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <span className="text-muted-foreground">✓ Qualité du code et respect des délais</span>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <span className="text-muted-foreground">✓ Proximité client et solutions adaptées</span>
            </div>
          </div>
        </div>

        {/* Step 1: Domain Question */}
        {step === 1 && (
          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">
              Étape 1 – Quel est le domaine d'activité principal de TechTunis ?
            </h2>
            
            <RadioGroup
              value={selectedDomain}
              onValueChange={setSelectedDomain}
              disabled={domainValidated}
              className="space-y-3 mb-6"
            >
              {domainOptions.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer",
                    selectedDomain === option.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/50",
                    domainValidated && option.isCorrect && "border-success bg-success/5",
                    domainValidated && selectedDomain === option.id && !option.isCorrect && "border-destructive bg-destructive/5"
                  )}
                  onClick={() => !domainValidated && setSelectedDomain(option.id)}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer font-medium">
                    {option.id}. {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-center gap-4">
              {!domainValidated && (
                <Button size="lg" onClick={handleValidateDomain} disabled={!selectedDomain}>
                  Valider
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              {domainValidated && !domainCorrect && (
                <Button size="lg" variant="outline" onClick={handleRetryDomain}>
                  Réessayer
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Values Question */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">
              Étape 2 – Sélectionnez les 4 valeurs fondamentales de TechTunis
            </h2>
            
            <p className="text-muted-foreground mb-4">
              {selectedValues.length}/4 sélectionnées
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {valueOptions.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer",
                    selectedValues.includes(option.id)
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/50",
                    valuesValidated && option.isCorrect && selectedValues.includes(option.id) && "border-success bg-success/5",
                    valuesValidated && !option.isCorrect && selectedValues.includes(option.id) && "border-destructive bg-destructive/5"
                  )}
                  onClick={() => toggleValue(option.id)}
                >
                  <Checkbox
                    checked={selectedValues.includes(option.id)}
                    disabled={valuesValidated}
                  />
                  <Label className="flex-1 cursor-pointer font-medium">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4">
              {!valuesValidated && (
                <Button
                  size="lg"
                  onClick={handleValidateValues}
                  disabled={selectedValues.length !== 4}
                >
                  Valider
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}

              {valuesValidated && !valuesCorrect && (
                <div className="text-center">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-4">
                    <p className="text-destructive font-medium">
                      Les bonnes valeurs sont : Innovation, Collaboration, Rigueur et Proximité client.
                    </p>
                  </div>
                  <Button size="lg" variant="outline" onClick={handleRetryValues}>
                    Réessayer
                  </Button>
                </div>
              )}

              {valuesValidated && valuesCorrect && (
                <div className="text-center">
                  <div className="bg-success/10 border border-success/20 rounded-xl p-4 mb-4">
                    <p className="text-success font-medium">
                      Parfait ! Vous êtes prêt(e) pour votre entretien chez TechTunis.
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

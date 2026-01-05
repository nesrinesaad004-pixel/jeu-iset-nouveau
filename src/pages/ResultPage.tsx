import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Trophy, Star, RefreshCcw, CheckCircle, Clock, User, Mail, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ResultPage() {
  const navigate = useNavigate();
  const { gameState, resetGame } = useGame();
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const totalLevels = 5;
  const completedLevels = gameState.completedLevels.length;
  const score = Math.round((completedLevels / totalLevels) * 100);

  const timeElapsed = gameState.startTime
    ? Math.round((Date.now() - gameState.startTime) / 1000 / 60)
    : 0;

  const levelResults = [
    { level: 1, title: "Se connaître", completed: gameState.completedLevels.includes(1) },
    { level: 2, title: "Rechercher l'entreprise", completed: gameState.completedLevels.includes(2) },
    { level: 3, title: "Communiquer", completed: gameState.completedLevels.includes(3) },
    { level: 4, title: "Se présenter", completed: gameState.completedLevels.includes(4) },
    { level: 5, title: "Réagir", completed: gameState.completedLevels.includes(5) },
  ];

  // Sauvegarde + envoi des résultats
  useEffect(() => {
    const saveAndSendResults = async () => {
      if (!gameState.studentInfo || emailSent || sendingEmail) return;

      setSendingEmail(true);
      
      try {
        // 1. Sauvegarde dans Supabase
        const durationSeconds = gameState.startTime
          ? Math.round((Date.now() - gameState.startTime) / 1000)
          : null;

        const { error: dbError } = await supabase
          .from('student_results')
          .insert({
            nom: gameState.studentInfo.nom,
            prenom: gameState.studentInfo.prenom,
            groupe: gameState.studentInfo.groupe,
            niveau: gameState.studentInfo.niveau,
            specialite: gameState.studentInfo.specialite,
            score,
            total_questions: totalLevels,
            duration_seconds: durationSeconds,
            start_time: gameState.startTime ? new Date(gameState.startTime).toISOString() : null,
            end_time: new Date().toISOString(),
            level1_score: gameState.completedLevels.includes(1) ? 100 : 0,
            level2_score: gameState.completedLevels.includes(2) ? 100 : 0,
            level3_score: gameState.completedLevels.includes(3) ? 100 : 0,
            level4_score: gameState.completedLevels.includes(4) ? 100 : 0,
            level5_score: gameState.completedLevels.includes(5) ? 100 : 0,
          });

        if (dbError) {
          console.error('Erreur sauvegarde BDD:', dbError);
        }

        // 2. Envoi d’e-mail via Vercel API (Gmail)
        const studentResult = {
          nom: gameState.studentInfo.nom,
          prenom: gameState.studentInfo.prenom,
          groupe: gameState.studentInfo.groupe,
          niveau: gameState.studentInfo.niveau,
          specialite: gameState.studentInfo.specialite,
          score,
          completedLevels: gameState.completedLevels,
          timeElapsed,
          levelResults,
        };

        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            professorEmail: gameState.studentInfo.professorEmail,
            studentResult,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setEmailSent(true);
          toast.success('Résultats envoyés au professeur !');
        } else {
          toast.error('Email non envoyé. Résultats sauvegardés en base.');
          console.error('Erreur API:', result.error);
        }
      } catch (error) {
        console.error('Erreur globale:', error);
        toast.error('Erreur inattendue. Résultats sauvegardés.');
      } finally {
        setSendingEmail(false);
      }
    };

    saveAndSendResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.studentInfo]);

  const handleRestart = () => {
    resetGame();
    navigate('/');
  };

  const getScoreMessage = () => {
    if (score === 100) return { title: "Félicitations !", message: "Vous êtes prêt(e) pour votre entretien !", emoji: "🎉" };
    if (score >= 80) return { title: "Excellent travail !", message: "Vous avez très bien compris les bases.", emoji: "⭐" };
    if (score >= 60) return { title: "Bon travail !", message: "Continuez à vous entraîner.", emoji: "👍" };
    return { title: "Courage !", message: "La pratique mène à la perfection.", emoji: "💪" };
  };

  const scoreInfo = getScoreMessage();

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-success shadow-lg mb-4">
            <Trophy className="h-10 w-10 text-success-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            {scoreInfo.title} {scoreInfo.emoji}
          </h1>
          <p className="text-muted-foreground">{scoreInfo.message}</p>
        </div>

        {/* Email Status */}
        <div className={cn(
          "flex items-center justify-center gap-2 p-3 rounded-xl mb-6 animate-fade-in",
          emailSent ? "bg-success/10 text-success" : sendingEmail ? "bg-muted" : "bg-muted"
        )}>
          {sendingEmail ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Envoi des résultats au professeur...</span>
            </>
          ) : emailSent ? (
            <>
              <Mail className="h-4 w-4" />
              <span className="text-sm">Résultats envoyés à {gameState.studentInfo?.professorEmail}</span>
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">En attente d'envoi...</span>
            </>
          )}
        </div>

        {/* Score Card */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8 shadow-lg animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="text-center mb-6">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${score * 3.52} 352`}
                  className="text-success transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-4xl font-display font-bold text-foreground">
                {score}%
              </span>
            </div>
            <p className="text-muted-foreground mt-4">Score final</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted rounded-xl p-4 text-center">
              <Clock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{timeElapsed} min</p>
              <p className="text-sm text-muted-foreground">Temps total</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <Star className="h-6 w-6 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{completedLevels}/{totalLevels}</p>
              <p className="text-sm text-muted-foreground">Niveaux complétés</p>
            </div>
          </div>

          {/* Student Info */}
          {gameState.studentInfo && (
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  {gameState.studentInfo.prenom} {gameState.studentInfo.nom}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {gameState.studentInfo.niveau} • {gameState.studentInfo.specialite} • {gameState.studentInfo.groupe}
              </p>
            </div>
          )}

          {/* Level Results */}
          <h3 className="font-display font-semibold text-foreground mb-4">Progression par niveau</h3>
          <div className="space-y-3">
            {levelResults.map((result) => (
              <div
                key={result.level}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border",
                  result.completed
                    ? "border-success/20 bg-success/5"
                    : "border-border bg-background"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      result.completed
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {result.completed ? <CheckCircle className="h-4 w-4" /> : result.level}
                  </div>
                  <span className={cn(
                    "font-medium",
                    result.completed ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {result.title}
                  </span>
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  result.completed ? "text-success" : "text-muted-foreground"
                )}>
                  {result.completed ? "Complété" : "Non complété"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-evaluation */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-md animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h3 className="font-display font-semibold text-foreground mb-4">Auto-évaluation</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Comment évaluez-vous votre performance ?</p>
              <div className="flex gap-2">
                {['Très satisfaisante', 'Satisfaisante', 'À améliorer'].map((option) => (
                  <button
                    key={option}
                    className="flex-1 py-2 px-3 text-sm rounded-lg border border-border bg-background hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Button size="lg" variant="outline" onClick={handleRestart}>
            <RefreshCcw className="mr-2 h-5 w-5" />
            Recommencer
          </Button>
        </div>

        {/* Credit */}
        <p className="text-center mt-8 text-sm text-muted-foreground">
          Bravo pour avoir terminé la simulation d'entretien !
        </p>
      </div>
    </div>
  );
}
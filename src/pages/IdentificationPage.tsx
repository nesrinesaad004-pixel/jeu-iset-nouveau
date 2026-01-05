import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, User, GraduationCap, Mail } from 'lucide-react';
import { toast } from 'sonner';

const specialites = ['Informatique', 'Electrique', 'Mécanique'];

export default function IdentificationPage() {
  const navigate = useNavigate();
  const { setStudentInfo, startGame } = useGame();
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    groupe: '3ème Année',
    niveau: '3ème Année',
    specialite: '',
    professorEmail: 'isetentretien499@gmail.com',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.prenom || !formData.specialite || !formData.professorEmail) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.professorEmail)) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    setStudentInfo(formData);
    startGame();
    toast.success('Bienvenue ' + formData.prenom + ' !');
    navigate('/niveau-1');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg mb-4">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Identification
          </h1>
          <p className="text-muted-foreground">
            Renseignez vos informations pour commencer
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-5">
            {/* Nom & Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-foreground font-medium">
                  Nom
                </Label>
                <Input
                  id="nom"
                  placeholder="Votre nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom" className="text-foreground font-medium">
                  Prénom
                </Label>
                <Input
                  id="prenom"
                  placeholder="Votre prénom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>

            {/* Spécialité */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Spécialité</Label>
              <Select
                value={formData.specialite}
                onValueChange={(value) => setFormData({ ...formData, specialite: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionnez votre spécialité" />
                </SelectTrigger>
                <SelectContent>
                  {specialites.map((specialite) => (
                    <SelectItem key={specialite} value={specialite}>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        {specialite}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email du professeur */}
            <div className="space-y-2">
              <Label htmlFor="professorEmail" className="text-foreground font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email du professeur
              </Label>
              <Input
                id="professorEmail"
                type="email"
                placeholder="professeur@example.com"
                value={formData.professorEmail}
                onChange={(e) => setFormData({ ...formData, professorEmail: e.target.value })}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                Les résultats seront envoyés à cette adresse
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" size="lg" className="w-full">
            Commencer le jeu
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>

        {/* Back link */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          <button
            onClick={() => navigate('/')}
            className="hover:text-primary transition-colors"
          >
            ← Retour à l'accueil
          </button>
        </p>
      </div>
    </div>
  );
}

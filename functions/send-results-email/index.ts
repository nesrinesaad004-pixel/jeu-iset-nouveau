// functions/send-results-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import nodemailer from 'https://esm.sh/nodemailer@6.9.13';

serve(async (req) => {
  try {
    // Vérifie la méthode
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'POST only' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { professorEmail, studentResult } = await req.json();

    // Validation
    if (!professorEmail || !studentResult) {
      return new Response(JSON.stringify({ error: 'Données manquantes' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: Deno.env.get('EMAIL_USER'),
        pass: Deno.env.get('EMAIL_PASS'),
      },
    });

    const mailOptions = {
      from: Deno.env.get('EMAIL_USER'),
      to: professorEmail,
      subject: `Résultats ISET - ${studentResult.prenom} ${studentResult.nom}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #2563eb;">🎯 Résultats du jeu d'entraînement</h2>
          <p><strong>Étudiant :</strong> ${studentResult.prenom} ${studentResult.nom}</p>
          <p><strong>Spécialité :</strong> ${studentResult.specialite}</p>
          <p><strong>Score :</strong> ${studentResult.score}%</p>
          <p><strong>Niveaux complétés :</strong> ${studentResult.completedLevels.join(', ')}</p>
          <hr style="margin: 16px 0;">
          <p style="color: #64748b; font-size: 0.875rem;">
            Ce message a été envoyé automatiquement par le jeu web de l'ISET.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Erreur Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
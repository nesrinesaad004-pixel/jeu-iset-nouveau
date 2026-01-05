// api/send-email.ts
import nodemailer from 'nodemailer';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json();
  const { professorEmail, studentResult } = body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER!,   // isetentretien499@gmail.com
      pass: process.env.EMAIL_PASS!,   // mot de passe d’application
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: professorEmail,
    subject: `Résultats ISET - ${studentResult.prenom} ${studentResult.nom}`,
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: 20px auto;">
        <h2>🎯 Résultats du jeu d'entraînement ISET</h2>
        <p><strong>Étudiant :</strong> ${studentResult.prenom} ${studentResult.nom}</p>
        <p><strong>Spécialité :</strong> ${studentResult.specialite}</p>
        <p><strong>Score :</strong> ${studentResult.score}%</p>
        <hr>
        <p><em>Projet étudiant - ISET</em></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Erreur d’envoi:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
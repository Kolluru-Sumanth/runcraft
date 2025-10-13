const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Create transporter from env vars
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD
  }
});

transporter.verify().then(() => {
  console.log('Mailer configured and ready');
}).catch((err) => {
  console.warn('Mailer verification failed (may be fine in dev):', err.message || err);
});

function loadTemplate(name, vars = {}) {
  try {
    const filePath = path.join(__dirname, '..', 'emails', `${name}.html`);
    let html = fs.readFileSync(filePath, 'utf8');
    Object.keys(vars).forEach(key => {
      const re = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      html = html.replace(re, vars[key] || '');
    });
    return html;
  } catch (err) {
    console.error('Failed to load email template', name, err);
    return '';
  }
}

async function sendPasswordResetEmail({ to, resetUrl, name }) {
  const subject = 'Reset your Runcraft password';
  const html = loadTemplate('passwordReset', { resetUrl, name });
  const text = `Reset your password: ${resetUrl}`;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Runcraft <no-reply@runcraft.app>',
    to,
    subject,
    text,
    html
  });

  return info;
}

module.exports = {
  sendPasswordResetEmail,
  transporter,
  loadTemplate
};

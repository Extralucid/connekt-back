import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (email, userId) => {
  const token = require('crypto').randomBytes(32).toString('hex');
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  
  // Save token to database
  const prisma = require('../config/database');
  await prisma.emailVerification.create({
    data: {
      token,
      userId,
      email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email - Youth Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Youth Platform!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Youth Platform - Empowering the next generation</p>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to Youth Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome aboard, ${name}! 🎉</h2>
        <p>Thank you for joining Youth Platform. We're excited to have you!</p>
        <p>Here's what you can do:</p>
        <ul>
          <li>📝 Create and share blog posts</li>
          <li>💬 Join discussions in forums</li>
          <li>🎧 Listen to podcasts</li>
          <li>📚 Read books and tutorials</li>
          <li>💼 Find job opportunities</li>
        </ul>
        <p>Get started by completing your profile and exploring our community!</p>
        <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Go to Dashboard</a>
        <hr>
        <p style="color: #666; font-size: 12px;">Youth Platform - Empowering the next generation</p>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
};

export {
  sendVerificationEmail,
  sendWelcomeEmail,
};
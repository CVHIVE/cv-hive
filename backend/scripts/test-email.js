// Test sending verification email directly
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('SMTP Config:');
  console.log('  HOST:', process.env.SMTP_HOST);
  console.log('  PORT:', process.env.SMTP_PORT);
  console.log('  USER:', process.env.SMTP_USER);
  console.log('  PASS:', process.env.SMTP_PASS ? process.env.SMTP_PASS.substring(0, 4) + '...' : 'NOT SET');
  console.log('  FROM:', process.env.SMTP_FROM);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('\n✅ SMTP connection verified!\n');

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: 'mohsinkhan.1997@outlook.com',
      subject: 'CV Hive - Test Email',
      html: '<h2>Test Email</h2><p>If you see this, email sending is working!</p>',
    });

    console.log('✅ Email sent!');
    console.log('  messageId:', info.messageId);
    console.log('  response:', info.response);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('  Code:', err.code);
    console.error('  Full error:', err);
  }

  process.exit();
}

testEmail();

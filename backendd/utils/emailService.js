const nodemailer = require('nodemailer');

// Create transporter for Gmail SMTP
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER || 'atlasecom0@gmail.com';
  const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
  
  console.log('🔧 Email Configuration:');
  console.log('EMAIL_USER:', emailUser);
  console.log('EMAIL_PASS:', emailPass ? 'SET' : 'NOT SET');
  
  if (!emailPass) {
    throw new Error('Email password not configured. Please set EMAIL_PASS or GMAIL_APP_PASSWORD environment variable.');
  }
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    },
    // Add additional options for better compatibility
    tls: {
      rejectUnauthorized: false
    }
  });
  
  return transporter;
};

// Send contact form email
const sendContactEmail = async (contactData) => {
  try {
    const { name, email, subject, message } = contactData;
    
    console.log('📧 Attempting to send contact email...');
    console.log('Contact data:', { name, email, subject, message: message.substring(0, 50) + '...' });
    
    const transporter = createTransporter();
    
    // Test the connection first
    console.log('🔌 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'atlasecom0@gmail.com',
      to: 'atlasecom0@gmail.com', // Your Gmail address
      replyTo: email, // Add reply-to field
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Atlas Ecom - Contact Form</h1>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">New Contact Form Submission</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Name:</strong>
                <span style="color: #6b7280; margin-left: 10px;">${name}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Email:</strong>
                <span style="color: #6b7280; margin-left: 10px;">${email}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Subject:</strong>
                <span style="color: #6b7280; margin-left: 10px;">${subject}</span>
              </div>
              
              <div style="margin-bottom: 20px;">
                <strong style="color: #374151;">Message:</strong>
                <div style="color: #6b7280; margin-top: 10px; padding: 15px; background: #f9fafb; border-radius: 4px; white-space: pre-wrap;">${message}</div>
              </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Reply to:</strong> ${email}
              </p>
            </div>
          </div>
          
          <div style="background: #1e293b; padding: 20px; text-align: center;">
            <p style="color: #94a3b8; margin: 0; font-size: 14px;">
              This email was sent from the Atlas Ecom contact form at ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
      text: `
        Atlas Ecom - Contact Form
        
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        
        Message:
        ${message}
        
        Reply to: ${email}
        
        Sent at: ${new Date().toLocaleString()}
      `
    };

    // Send email
    console.log('📤 Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      replyTo: mailOptions.replyTo,
      subject: mailOptions.subject
    });
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Contact email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
    
  } catch (error) {
    console.error('❌ Error sending contact email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send password reset email (existing functionality)
const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'atlasecom0@gmail.com',
      to: email,
      subject: 'Atlas Ecom - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Atlas Ecom</h1>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b;">Password Reset Request</h2>
            <p style="color: #6b7280;">You requested to reset your password. Click the button below to reset it:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #f97316;">${resetUrl}</a>
            </p>
            
            <p style="color: #6b7280; font-size: 14px;">
              This link will expire in 10 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Password reset email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendContactEmail,
  sendPasswordResetEmail
};
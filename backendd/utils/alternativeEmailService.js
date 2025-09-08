// Alternative email service that works without Gmail configuration
// This service logs contact form submissions and can be extended with other email services

const sendContactEmail = async (contactData) => {
  try {
    const { name, email, subject, message } = contactData;
    
    // Log the contact form submission with detailed formatting
    console.log('\n' + '='.repeat(80));
    console.log('📧 NEW CONTACT FORM SUBMISSION');
    console.log('='.repeat(80));
    console.log(`👤 Name: ${name}`);
    console.log(`📧 Email: ${email}`);
    console.log(`📝 Subject: ${subject}`);
    console.log(`💬 Message:`);
    console.log('─'.repeat(40));
    console.log(message);
    console.log('─'.repeat(40));
    console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`);
    console.log(`🌐 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    console.log('='.repeat(80));
    console.log('📋 ACTION REQUIRED: Check this contact form submission');
    console.log('📧 Reply to: ' + email);
    console.log('='.repeat(80) + '\n');
    
    // In a production environment, you could:
    // 1. Save to database
    // 2. Send to Slack/Discord webhook
    // 3. Use a different email service (SendGrid, Mailgun, etc.)
    // 4. Send SMS notification
    
    return {
      success: true,
      message: 'Contact form submission logged successfully',
      method: 'console_log'
    };
    
  } catch (error) {
    console.error('❌ Error in alternative email service:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send password reset email (fallback)
const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🔐 PASSWORD RESET REQUEST');
    console.log('='.repeat(80));
    console.log(`📧 Email: ${email}`);
    console.log(`🔗 Reset URL: ${resetUrl}`);
    console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`);
    console.log('='.repeat(80));
    console.log('📋 ACTION REQUIRED: Send password reset email manually');
    console.log('='.repeat(80) + '\n');
    
    return {
      success: true,
      message: 'Password reset request logged',
      method: 'console_log'
    };
    
  } catch (error) {
    console.error('❌ Error in alternative password reset service:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendContactEmail,
  sendPasswordResetEmail
};

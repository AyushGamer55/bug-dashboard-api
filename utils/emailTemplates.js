const passwordResetTemplate = (resetUrl, userEmail) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Bug Dashboard</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Google Sans', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 400;">Bug Dashboard</h1>
          <p style="color: #e8f0fe; margin: 10px 0 0 0; font-size: 16px;">Professional Bug Tracking System</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #202124; font-size: 24px; font-weight: 400; margin: 0 0 20px 0;">Reset your password</h2>
          
          <p style="color: #5f6368; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
            We received a request to reset the password for your Bug Dashboard account.
          </p>
          
          <p style="color: #5f6368; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
            Click the button below to reset your password. This link will expire in <strong>1 hour</strong>.
          </p>
          
          <!-- Reset Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #1a73e8; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-size: 16px; font-weight: 500; letter-spacing: 0.25px; box-shadow: 0 1px 3px rgba(0,0,0,0.12);">
              Reset Password
            </a>
          </div>
          
          <!-- Alternative Link -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 30px 0;">
            <p style="color: #5f6368; font-size: 14px; margin: 0 0 10px 0;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #1a73e8; font-size: 14px; word-break: break-all; margin: 0; font-family: monospace;">${resetUrl}</p>
          </div>
          
          <!-- Security Notice -->
          <div style="border-left: 4px solid #fbbc04; padding: 15px 20px; margin: 30px 0; background-color: #fef7e0;">
            <h3 style="color: #ea8600; font-size: 16px; margin: 0 0 10px 0; font-weight: 500;">🔒 Security Notice</h3>
            <p style="color: #5f6368; font-size: 14px; margin: 0; line-height: 20px;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <!-- Account Info -->
          <div style="border-top: 1px solid #dadce0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #5f6368; font-size: 14px; margin: 0 0 5px 0;">Account: ${userEmail}</p>
            <p style="color: #5f6368; font-size: 14px; margin: 0;">Requested: ${new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #dadce0;">
          <p style="color: #5f6368; font-size: 12px; margin: 0 0 10px 0; text-align: center;">
            This email was sent by Bug Dashboard. If you have any questions, please contact our support team.
          </p>
          <p style="color: #5f6368; font-size: 12px; margin: 0; text-align: center;">
            © ${new Date().getFullYear()} Bug Dashboard. All rights reserved.
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
};

// Welcome email template (for new registrations)
const welcomeTemplate = (userName, userEmail) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Bug Dashboard</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Google Sans', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 400;">Welcome to Bug Dashboard!</h1>
          <p style="color: #e8f0fe; margin: 10px 0 0 0; font-size: 16px;">Your Professional Bug Tracking System</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #202124; font-size: 24px; font-weight: 400; margin: 0 0 20px 0;">Welcome aboard, ${userName}!</h2>
          
          <p style="color: #5f6368; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
            Thank you for joining Bug Dashboard! We're excited to help you streamline your bug tracking process.
          </p>
          
          <p style="color: #5f6368; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
            Your account has been successfully created with the email: <strong>${userEmail}</strong>
          </p>
          
          <!-- Getting Started -->
          <div style="background-color: #e8f0fe; padding: 20px; border-radius: 4px; margin: 30px 0;">
            <h3 style="color: #1a73e8; font-size: 18px; margin: 0 0 15px 0; font-weight: 500;">🚀 Getting Started</h3>
            <ul style="color: #5f6368; font-size: 14px; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Complete your profile information</li>
              <li style="margin-bottom: 8px;">Create your first project</li>
              <li style="margin-bottom: 8px;">Invite team members to collaborate</li>
              <li style="margin-bottom: 8px;">Start tracking your bugs efficiently!</li>
            </ul>
          </div>
          
          <!-- Account Info -->
          <div style="border-top: 1px solid #dadce0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #5f6368; font-size: 14px; margin: 0 0 5px 0;">Account: ${userEmail}</p>
            <p style="color: #5f6368; font-size: 14px; margin: 0;">Joined: ${new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #dadce0;">
          <p style="color: #5f6368; font-size: 12px; margin: 0 0 10px 0; text-align: center;">
            This email was sent by Bug Dashboard. If you have any questions, please contact our support team.
          </p>
          <p style="color: #5f6368; font-size: 12px; margin: 0; text-align: center;">
            © ${new Date().getFullYear()} Bug Dashboard. All rights reserved.
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  passwordResetTemplate,
  welcomeTemplate
};

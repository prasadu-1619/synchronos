import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    });
  } else {
    // Generic SMTP configuration
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
};

export const sendInvitationEmail = async ({
  to,
  inviterName,
  projectName,
  token,
  role,
  isNewUser = false,
}) => {
  try {
    const transporter = createTransporter();

    const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation/${token}`;
    
    const subject = `You've been invited to join "${projectName}"`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .info-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Project Invitation</h1>
            </div>
            <div class="content">
              <p>Hi there!</p>
              
              <p><strong>${inviterName}</strong> has invited you to join the project:</p>
              
              <div class="info-box">
                <h2>${projectName}</h2>
                <p><strong>Your Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
              </div>

              ${isNewUser ? `
                <p><strong>Welcome!</strong> Since this is your first time, you'll need to create an account. Click the button below to get started:</p>
              ` : `
                <p>Click the button below to accept this invitation and start collaborating:</p>
              `}

              <div style="text-align: center;">
                <a href="${invitationLink}" class="button">
                  ${isNewUser ? 'Create Account & Join Project' : 'Accept Invitation'}
                </a>
              </div>

              <p style="margin-top: 30px; font-size: 12px; color: #666;">
                Or copy and paste this link into your browser:<br>
                <a href="${invitationLink}" style="color: #667eea;">${invitationLink}</a>
              </p>

              <p style="margin-top: 30px; font-size: 12px; color: #999;">
                <strong>Note:</strong> This invitation will expire in 7 days.
              </p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} Froncort. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
${inviterName} has invited you to join "${projectName}"

Your Role: ${role.charAt(0).toUpperCase() + role.slice(1)}

${isNewUser ? 'Since this is your first time, you\'ll need to create an account first.' : ''}

Accept invitation: ${invitationLink}

Note: This invitation will expire in 7 days.
    `;

    const mailOptions = {
      from: `"Synchronos" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export default { sendInvitationEmail };

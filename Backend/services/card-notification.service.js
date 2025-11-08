import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';

  if (emailService === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Generic SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const sendCardAssignedEmail = async (assigneeEmail, assigneeName, cardData, assignedBy, projectName, boardName) => {
  const transporter = createTransporter();

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .card-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #667eea; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 New Task Assigned</h1>
        </div>
        <div class="content">
          <p>Hi ${assigneeName},</p>
          <p>${assignedBy.name} has assigned you a new task on the <strong>${boardName}</strong> board in project <strong>${projectName}</strong>.</p>
          
          <div class="card-details">
            <h3>${cardData.title}</h3>
            ${cardData.description ? `<p>${cardData.description}</p>` : ''}
            
            <div class="detail-row">
              <span class="label">Status:</span> ${cardData.column}
            </div>
            
            ${cardData.priority ? `
            <div class="detail-row">
              <span class="label">Priority:</span> ${cardData.priority}
            </div>
            ` : ''}
            
            ${cardData.dueDate ? `
            <div class="detail-row">
              <span class="label">Due Date:</span> ${new Date(cardData.dueDate).toLocaleDateString()}
            </div>
            ` : ''}
            
            ${cardData.labels && cardData.labels.length > 0 ? `
            <div class="detail-row">
              <span class="label">Labels:</span> ${cardData.labels.map(l => l.name || l).join(', ')}
            </div>
            ` : ''}
          </div>
          
          <p>You can view and manage this task by logging into your account.</p>
          
          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/project/${cardData.projectId}/board/${cardData.board}" class="button">
              View Task
            </a>
          </center>
        </div>
        <div class="footer">
          <p>This is an automated notification from your project management system.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Project Management" <${process.env.EMAIL_USER}>`,
    to: assigneeEmail,
    subject: `New Task Assigned: ${cardData.title}`,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Card assignment email sent successfully to:', assigneeEmail);
  } catch (error) {
    console.error('Failed to send card assignment email:', error);
    throw error;
  }
};

const sendCardStatusChangeEmail = async (recipientEmail, recipientName, cardData, changedBy, oldStatus, newStatus, projectName, boardName) => {
  const transporter = createTransporter();

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .card-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .status-change { display: flex; align-items: center; gap: 10px; margin: 15px 0; }
        .status-badge { padding: 5px 15px; border-radius: 20px; font-weight: bold; }
        .status-old { background: #ffc107; color: #000; }
        .status-new { background: #28a745; color: white; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Task Status Updated</h1>
        </div>
        <div class="content">
          <p>Hi ${recipientName},</p>
          <p>${changedBy.name} has updated the status of a task on the <strong>${boardName}</strong> board in project <strong>${projectName}</strong>.</p>
          
          <div class="card-details">
            <h3>${cardData.title}</h3>
            ${cardData.description ? `<p>${cardData.description}</p>` : ''}
            
            <div class="status-change">
              <span class="status-badge status-old">${oldStatus}</span>
              <span>→</span>
              <span class="status-badge status-new">${newStatus}</span>
            </div>
            
            ${cardData.dueDate ? `
            <p><strong>Due Date:</strong> ${new Date(cardData.dueDate).toLocaleDateString()}</p>
            ` : ''}
          </div>
          
          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/project/${cardData.projectId}/board/${cardData.board}" class="button">
              View Task
            </a>
          </center>
        </div>
        <div class="footer">
          <p>This is an automated notification from your project management system.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Project Management" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `Task Status Updated: ${cardData.title}`,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Card status change email sent successfully to:', recipientEmail);
  } catch (error) {
    console.error('Failed to send card status change email:', error);
    throw error;
  }
};

const sendCardCommentEmail = async (recipientEmail, recipientName, cardData, commenter, comment, projectName, boardName) => {
  const transporter = createTransporter();

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .card-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .comment { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 New Comment</h1>
        </div>
        <div class="content">
          <p>Hi ${recipientName},</p>
          <p>${commenter.name} commented on task <strong>${cardData.title}</strong> in project <strong>${projectName}</strong>.</p>
          
          <div class="card-details">
            <h3>${cardData.title}</h3>
            
            <div class="comment">
              <p><strong>${commenter.name}:</strong></p>
              <p>${comment}</p>
            </div>
          </div>
          
          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/project/${cardData.projectId}/board/${cardData.board}" class="button">
              View Task
            </a>
          </center>
        </div>
        <div class="footer">
          <p>This is an automated notification from your project management system.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Project Management" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `New Comment on: ${cardData.title}`,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Card comment email sent successfully to:', recipientEmail);
  } catch (error) {
    console.error('Failed to send card comment email:', error);
    throw error;
  }
};

export { sendCardAssignedEmail, sendCardStatusChangeEmail, sendCardCommentEmail };

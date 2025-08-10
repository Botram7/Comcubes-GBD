import * as sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const emailEnabled = !!SENDGRID_API_KEY;

if (emailEnabled) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not set - email functionality disabled');
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private readonly fromEmail: string;

  constructor(fromEmail: string = 'noreply@comcubes.com') {
    this.fromEmail = fromEmail;
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    if (!emailEnabled) {
      console.log('Email would be sent to:', params.to, 'Subject:', params.subject);
      return true; // Return true for development purposes
    }
    
    try {
      await sgMail.send({
        to: params.to,
        from: params.from || this.fromEmail,
        subject: params.subject,
        text: params.text,
        html: params.html,
      });
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  async sendContactNotification(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    contactType: string;
  }, adminEmail: string): Promise<boolean> {
    const html = `
      <h2>New Contact Message - COMCUBES</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Contact Type:</strong> ${data.contactType}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${data.message.replace(/\n/g, '<br>')}
      </div>
    `;

    return this.sendEmail({
      to: adminEmail,
      from: this.fromEmail,
      subject: `[COMCUBES] New Contact: ${data.subject}`,
      html,
    });
  }

  async sendContactConfirmation(data: {
    name: string;
    email: string;
    subject: string;
  }): Promise<boolean> {
    const html = `
      <h2>Thank You for Contacting COMCUBES</h2>
      <p>Dear ${data.name},</p>
      <p>We have received your message regarding "<strong>${data.subject}</strong>" and will respond within 24-48 hours.</p>
      <p>Our team at COMCUBES Global Business Directory is committed to providing excellent support.</p>
      <br>
      <p>Best regards,<br>The COMCUBES Team</p>
    `;

    return this.sendEmail({
      to: data.email,
      from: this.fromEmail,
      subject: 'COMCUBES - Message Received',
      html,
    });
  }

  async sendListingConfirmation(data: {
    companyName: string;
    contactEmail: string;
    paymentReference: string;
  }): Promise<boolean> {
    const html = `
      <h2>Company Listing Submission Received - COMCUBES</h2>
      <p>Dear ${data.companyName} Team,</p>
      <p>Thank you for your interest in being listed in the COMCUBES Global Business Directory!</p>
      
      <p><strong>Submission Details:</strong></p>
      <ul>
        <li>Company: ${data.companyName}</li>
        <li>Payment Reference: ${data.paymentReference}</li>
        <li>Status: Under Review</li>
      </ul>
      
      <p>Our team will review your submission and contact you within 2-3 business days with updates.</p>
      
      <br>
      <p>Best regards,<br>The COMCUBES Team</p>
    `;

    return this.sendEmail({
      to: data.contactEmail,
      from: this.fromEmail,
      subject: 'COMCUBES - Listing Submission Received',
      html,
    });
  }
}
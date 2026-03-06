const nodemailer = require('nodemailer');

class Mailer {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT == 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        this.from = `${process.env.EMAIL_FROM_NAME || 'CureLink'} <${process.env.EMAIL_USER}>`;
        this.appName = 'CureLink';
    }

    /**
     * Base HTML template for all emails with premium aesthetics
     */
    _getBaseTemplate(title, preheader, content) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    line-height: 1.6;
                    color: #2D3748;
                    margin: 0;
                    padding: 0;
                    background-color: #F7FAFC;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                }
                .header {
                    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
                    padding: 40px 20px;
                    text-align: center;
                    color: #ffffff;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .content {
                    padding: 40px;
                    background-color: #ffffff;
                }
                .otp-container {
                    background: #F8FAFC;
                    border: 2px solid #E2E8F0;
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    margin: 30px 0;
                }
                .otp-code {
                    font-size: 36px;
                    font-weight: 800;
                    letter-spacing: 10px;
                    color: #2B6CB0;
                    font-family: 'Courier New', Courier, monospace;
                }
                .btn {
                    display: inline-block;
                    padding: 14px 30px;
                    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    margin-top: 25px;
                    box-shadow: 0 4px 6px rgba(53, 122, 189, 0.2);
                    transition: transform 0.2s ease;
                }
                .footer {
                    padding: 30px;
                    text-align: center;
                    font-size: 13px;
                    color: #718096;
                    background: #F7FAFC;
                    border-top: 1px solid #E2E8F0;
                }
                .highlight {
                    color: #3182CE;
                    font-weight: 600;
                }
                @media only screen and (max-width: 600px) {
                    .container {
                        margin: 20px 10px;
                    }
                    .content {
                        padding: 30px 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>
            <div class="container">
                <div class="header">
                    <h1>${this.appName}</h1>
                </div>
                <div class="content">
                    <h2 style="margin-top: 0; color: #1A202C; font-size: 22px;">${title}</h2>
                    ${content}
                </div>
                <div class="footer">
                    <p style="margin-bottom: 10px;">&copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
                    <p>Building a healthier future, together.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Internal send helper
     */
    async _send(to, subject, html, text = '') {
        const mailOptions = {
            from: this.from,
            to,
            subject,
            text,
            html,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Mailer Service Error:', error);
            return false;
        }
    }

    /**
     * 1. Registration OTP
     */
    async sendVerificationOTP(user, otp) {
        const title = 'Verify Your Account';
        const preheader = 'Your verification code for CureLink is inside.';
        const content = `
            <p>Hi <span class="highlight">${user.firstName}</span>,</p>
            <p>Welcome to <strong>${this.appName}</strong>! We're thrilled to have you join our community.</p>
            <p>To get started, please use the verification code below to confirm your email address:</p>
            <div class="otp-container">
                <div class="otp-code">${otp}</div>
            </div>
            <p style="font-size: 14px; color: #4A5568;">This code is valid for <span class="highlight">10 minutes</span>. For your security, please do not share this code with anyone.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
        `;

        const html = this._getBaseTemplate(title, preheader, content);
        const text = `Welcome to CureLink! Your verification code is: ${otp}. It expires in 10 minutes.`;

        return await this._send(user.email, `${this.appName} - Verify Your Account`, html, text);
    }

    /**
     * 2. Resend OTP
     */
    async sendResendOTP(user, otp) {
        const title = 'New Verification Code';
        const preheader = 'Here is your new verification code.';
        const content = `
            <p>Hello <span class="highlight">${user.firstName}</span>,</p>
            <p>You requested a new verification code for your <strong>${this.appName}</strong> account.</p>
            <div class="otp-container">
                <div class="otp-code">${otp}</div>
            </div>
            <p style="font-size: 14px; color: #4A5568;">This code remains valid for <span class="highlight">10 minutes</span>.</p>
            <p>Keeping your account secure is our top priority.</p>
        `;

        const html = this._getBaseTemplate(title, preheader, content);
        const text = `Your new CureLink verification code is: ${otp}. It expires in 10 minutes.`;

        return await this._send(user.email, `${this.appName} - New Verification Code`, html, text);
    }

    /**
     * 3. Welcome Email (After successful verification)
     */
    async sendWelcomeEmail(user) {
        const title = 'Welcome to the Family!';
        const preheader = 'Your account is verified. Welcome to CureLink!';
        const content = `
            <p>Hi <span class="highlight">${user.firstName}</span>,</p>
            <p>Your account has been successfully verified. You are now a full member of the <strong>${this.appName}</strong> family!</p>
            <p>You can now explore all the features we offer to help you manage your health journey more effectively.</p>
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || '#'}" class="btn">Get Started Now</a>
            </div>
            <p style="margin-top: 30px;">If you have any questions, our support team is always here to help.</p>
        `;

        const html = this._getBaseTemplate(title, preheader, content);
        const text = `Welcome to CureLink, ${user.firstName}! Your account is now verified.`;

        return await this._send(user.email, `Welcome to ${this.appName}!`, html, text);
    }

    /**
     * 4. Forgot Password Email (Future proofing)
     */
    async sendForgotPassword(user, otp) {
        const title = 'Reset Your Password';
        const preheader = 'Password reset request for your account.';
        const content = `
            <p>Hello <span class="highlight">${user.firstName}</span>,</p>
            <p>We received a request to reset the password for your <strong>${this.appName}</strong> account.</p>
            <p>Use the code below to set a new password:</p>
            <div class="otp-container">
                <div class="otp-code">${otp}</div>
            </div>
            <p style="font-size: 14px; color: #4A5568;">If you did not request this, please ignore this email or contact support if you have concerns.</p>
        `;

        const html = this._getBaseTemplate(title, preheader, content);
        const text = `Password Reset Request. Your code is: ${otp}`;

        return await this._send(user.email, `${this.appName} - Reset Your Password`, html, text);
    }
}

module.exports = new Mailer();

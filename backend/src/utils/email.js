const nodemailer = require('nodemailer');

let cachedTransporter;

const getTransporter = () => {
    if (cachedTransporter) return cachedTransporter;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
        throw new Error('SMTP environment variables are not fully configured');
    }

    cachedTransporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });

    return cachedTransporter;
};

const sendMail = async ({ to, subject, html, text }) => {
    const transporter = getTransporter();
    const from = process.env.SMTP_FROM;
    await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text
    });
};

module.exports = { sendMail };

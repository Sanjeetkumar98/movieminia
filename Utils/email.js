const nodemailer = require('nodemailer');

const sendEmail = async (option) => {
    const transpoter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const emailOption = {
        from: 'Movie supprt<movie@gmail.com>',
        to: option.email,
        subject: option.subject,
        text: option.message
    }

    await transpoter.sendMail(emailOption);

}

module.exports = sendEmail;
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Gmail's SMTP server
  port: 587, // Port for TLS/STARTTLS (587 is commonly used)
  secure: false, // Use TLS, set to true for SSL on port 465
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  // logger:true,
  // debug:true
});

const sendVerificationMail = async (mail, token) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: mail,
    subject: "Verify your email",
    html: `<div>
  <h1>Verify your email</h1>
  <p>To complete your WhimsyChat registration, please click on the bottom below,</p>
  <a href="${process.env.FRONTEND_URL}/verify-email/${token}" traget='_blank'>
  <button style="background-color:#4cc9ff; border:none;padding:0.75rem;color:white;width:150px;font-size:1.15rem">Verify email</button>
  </a>
  <p>This link is valid for 1 day and can only be used once.</p>
  <p>If this was not requested by you, simply ignore this mail.</p>
</div>`,
  };
  try {
    const response = await transporter.sendMail(mailOptions);
    return response
  } catch (error) {
    throw new Error (error)
  }
};

module.exports = sendVerificationMail;

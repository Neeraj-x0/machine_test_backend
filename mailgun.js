const Mailgun = require("mailgun.js");
const formData = require("form-data");
require("dotenv").config();
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
  url: "https://api.mailgun.net",
});

const sendMail = async (to, subject, text, name,token) => {
  const resetlink = `http://localhost:5173/forgot/?token=${token}`;
  const data = {
    from: process.env.MAILGUN_FROM_EMAIL,
    to,
    subject,
    text,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .header img {
      width: 100px;
    }
    .content {
      text-align: center;
    }
    .content h1 {
      color: #333333;
    }
    .content p {
      color: #666666;
      line-height: 1.5;
    }
    .content a {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      color: #ffffff;
      background-color: #007BFF;
      text-decoration: none;
      border-radius: 5px;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      color: #999999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://res.cloudinary.com/dyfhbqtjm/image/upload/f_auto,q_auto/twiaxek4wpafurdbx2cj" alt="Logo">
    </div>
    <div class="content">
      <h1>Reset Your Password</h1>
      <p>Hi ${name},</p>
      <p>It looks like you requested a new password. You'll need to use the button below to activate it. If you didn't make this request, you can ignore this email.</p>
      <a href="${resetlink}">Reset Password</a>
      <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
      <p>${resetlink}</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 Your Company. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`,
  };

  try {
    const body = await mg.messages.create(process.env.MAILGUN_DOMAIN, data);
    console.log("Email sent successfully:", body);
  } catch (error) {
    console.log("Error sending email:", error);
  }
};

module.exports = sendMail;

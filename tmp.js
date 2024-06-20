const sendEmail = require("./mailgun");

sendEmail("krishnaneeraj773@gmail.com", "Hello", "Hello", "Hello")
  .then(() => {
    console.log("Email sent successfully");
  })
  .catch((error) => {
    console.log("Error sending email:", error);
  });

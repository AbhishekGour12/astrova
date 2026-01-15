import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "aggour124421@gmail.com",
    pass: process.env.EMAIL_PASS || "vupf wimf scix xtse",
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: "myastrova@gmail.com",
    to,
    subject,
    html,
  });
};

export default sendEmail;

const bcrypt = require("bcryptjs");
const userRepo = require("../repositories/user.repository");
const sendEmailEvent = require("../kafka/producer");
const { sendMail } = require("../utils/sendEmail");

const addUser = async (name, email, password, role,isActive) => {
  const existingUser = await userRepo.findUserByEmail(email);
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("name, email, password, role, isActive from user service",name, email, password, role,isActive);
  const user = await userRepo.createUser({

    name,
    email,
    password: hashedPassword,
    role,
    isActive :true
  });

  const emailPayload = {
    to: email,
    subject: "Welcome to Role_Base System",
    html: `
      <h2>Hello ${name},</h2>
      <p>Your account has been successfully created.</p>
      <p><strong>Role:</strong> ${role}</p>
      <p>You can now log in using your email ${email}.</p>
      <br/>
      <p>Regards,<br/>RBA Team</p>
    `,
  };

  // 🔥 Kafka first, fallback to Nodemailer
  try {
    await sendEmailEvent("email-topic", emailPayload);
    console.log("📩 Email event sent to Kafka");
  } catch (err) {
    console.error("⚠️ Kafka down, sending email via Nodemailer");

    try {
      await sendMail(emailPayload);
      console.log("✅ Email sent via Nodemailer");
    } catch (mailErr) {
      console.error("❌ Email failed completely", mailErr);
      // ❗ do NOT throw – user is already created
    }
  }

  return user;
};

// ✅ Get users list
const getUserList = async (loggedInUserId) => {
  return await userRepo.getAllUsersExcept(loggedInUserId);
};

module.exports = { addUser, getUserList };

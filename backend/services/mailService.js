import nodemailer from "nodemailer";

const user = process.env.NODEMAILER_USER;
const pass = process.env.NODEMAILER_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user, pass },
});

// For send lost pet email.
const sendLostPetEmail = async (
  ownerEmail,
  ownerName,
  senderEmail,
  senderName,
  petName,
  message
) => {
  const mailOptions = {
    from: user,
    to: ownerEmail,
    cc: senderEmail,
    subject: `Update on ${petName} - Lost Pet Information`,
    html: `
        <p>Dear ${ownerName},</p>

        <p>You have received an update regarding your lost pet, <strong>${petName}</strong>.</p>

        <p><strong>Reporter Name:</strong> ${senderName}</p>
        <p><strong>Reporter Email:</strong> ${senderEmail}</p>
        <p><strong>Message:</strong> ${message}</p>

        <p>The sender has provided information that may help in locating ${petName}. Please respond to them directly at <a href="mailto:${senderEmail}">${senderEmail}</a> to continue the conversation.</p>

        <p>We hope this brings you closer to finding ${petName}!</p>

        <p>Best regards,</p>
        <p><strong>PetHaven Team</strong></p>
      `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully", info: result };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Error sending email", error };
  }
};

// For send adopt pet email.
const sendAdoptPetEmail = async (
  ownerEmail,
  ownerName,
  senderEmail,
  senderName,
  petName,
  message
) => {
  const mailOptions = {
    from: user,
    to: ownerEmail,
    cc: senderEmail,
    subject: `Adoption Inquiry for ${petName}`,
    html: `
        <p>Dear ${ownerName},</p>

        <p>You have received an adoption inquiry for your pet, <strong>${petName}</strong>.</p>

        <p><strong>Requester Name:</strong> ${senderName}</p>
        <p><strong>Requester Email:</strong> ${senderEmail}</p>
        <p><strong>Message:</strong> ${message}</p>

        <p>The sender is interested in adopting ${petName}. Please respond to them directly at <a href="mailto:${senderEmail}">${senderEmail}</a> to continue the conversation.</p>

        <p>Best regards,</p>
        <p><strong>PetHaven Team</strong></p>
      `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully", info: result };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Error sending email", error };
  }
};

export { sendLostPetEmail, sendAdoptPetEmail };

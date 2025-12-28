import Remedy from "../models/Remedy.js";
import RemedyBooking from "../models/RemedyBooking.js";
import sendEmail from "../utils/sendEmail.js";

/* ================= CREATE ================= */
export const createRemedy = async (req, res) => {
  try {
    const remedy = await Remedy.create({
      title: req.body.title,
      price: req.body.price,
      category: req.body.category,
      description: req.body.description,
      image: `/uploads/products/${req.file.filename}`,
      duration: req.body.duration,
    });

    res.json(remedy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */
export const updateRemedy = async (req, res) => {
  try {
    const remedy = await Remedy.findById(req.params.id);
    if (!remedy) return res.status(404).json({ message: "Remedy not found" });

    remedy.title = req.body.title ?? remedy.title;
    remedy.price = req.body.price ?? remedy.price;
    remedy.category = req.body.category ?? remedy.category;
    remedy.description = req.body.description ?? remedy.description;

    if (req.file) {
      remedy.image = `/uploads/${req.file.filename}`;
    }

    await remedy.save();
    res.json(remedy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE ================= */
export const deleteRemedy = async (req, res) => {
  try {
    await Remedy.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= LIST ================= */
export const getAllRemedies = async (req, res) => {
  const remedies = await Remedy.find().sort({ createdAt: -1 });
  res.json(remedies);
};



export const bookRemedy = async (req, res) => {
  try {
    const {
      remedyId,
      paymentId,
      name,
      email,
      phone,
      category,
      description,
      duration
    } = req.body;
    console.log(req.body)

    const remedy = await Remedy.findById(remedyId);
    if (!remedy) {
      return res.status(404).json({ message: "Remedy not found" });
    }

    /* ================= SAVE BOOKING ================= */

    const booking = await RemedyBooking.create({
      remedyId,
      userId: req.user._id,
      paymentId,
      form: {
        name,
        email,
        phone,
        problem: category,
        message: description,
        duration: remedy.duration
      },
      status: "paid",
    });

    /* ================= EMAIL TO ADMIN ================= */

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "🕉️ New Remedy Booking Received",
      html: `
        <h2>New Remedy Booking</h2>
        <p><strong>Remedy:</strong> ${remedy.title}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Problem:</strong> ${category}</p>
        <p><strong>Message:</strong> ${description}</p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        <p><strong>Duration:</strong> ${remedy.duration}</p>
      `,
    });

    /* ================= EMAIL TO USER ================= */

    await sendEmail({
      to: email,
      subject: "✅ Your Remedy Booking is Confirmed",
      html: `
        <h2>Remedy Booked Successfully 🙏</h2>

        <p>Dear <strong>${name}</strong>,</p>

        <p>Your remedy <strong>${remedy.title}</strong> has been booked successfully.</p>

        <p>Our expert astrologer team will review your details and contact you shortly.</p>

        <hr />

        <p><strong>Booking Details:</strong></p>
        <ul>
          <li><strong>Remedy:</strong> ${remedy.title}</li>
          <li><strong>Payment ID:</strong> ${paymentId}</li>
          <li><strong>Duration:</strong> ${remedy.duration}</li>
          <li><strong>Status:</strong> Confirmed</li>
        </ul>

        <p>If you have any questions, feel free to reply to this email.</p>

        <p>✨ Wishing you positivity and success ✨</p>

        <p><strong>Team MyAstrova</strong></p>
      `,
    });

    /* ================= RESPONSE ================= */

    res.json({
      success: true,
      message: "Remedy booked successfully. Confirmation email sent.",
      booking,
    });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
};

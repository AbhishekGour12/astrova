// controllers/contactController.js
import Contact from "../models/Contact.js";

import sendEmail from "../utils/sendEmail.js";

// Submit contact form
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message, astrologerInterest } = req.body;
    console.log(name)
    // Simple validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }
    
    
    
    
    
    // Create contact record
    const contact = await Contact.create({
      name,
      email,
      phone: phone || "",
      subject,
      message,
      astrologerInterest: astrologerInterest || false,
      userId: req.user?._id // if user is logged in
    });
    
    // Send notification emails (optional)
    await sendNotificationEmails(contact);
    
    res.status(201).json({
      success: true,
      message: "Thank you for contacting us! We'll get back to you soon.",
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        astrologerInterest: contact.astrologerInterest
      }
    });
    
  } catch (error) {
    console.log("Contact form submission error:", error.message);
    
    // Handle duplicate submissions or validation errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate submission detected"
      });
    }
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors[0] || "Validation error"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later."
    });
  }
};

// Get all contact messages (for admin)
export const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build filter
    let filter = {};
    
    if (status && ["pending", "read", "replied", "closed"].includes(status)) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } }
      ];
    }
    
    // Get contacts with pagination
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select("-__v");
    
    const total = await Contact.countDocuments(filter);
    
    res.json({
      success: true,
      data: contacts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
    
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts"
    });
  }
};

// Get single contact (for admin)
export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findById(id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }
    
    res.json({
      success: true,
      data: contact
    });
    
  } catch (error) {
    console.error("Get contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact"
    });
  }
};

// Update contact status (for admin)
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, replyMessage } = req.body;
    
    if (!status || !["pending", "read", "replied", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }
    
    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    // Send reply email if replyMessage is provided
    if (status === "replied" && replyMessage && contact.email) {
      await sendReplyEmail(contact, replyMessage);
    }
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }
    
    res.json({
      success: true,
      message: "Status updated successfully",
      data: contact
    });
    
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update contact"
    });
  }
};
const sendReplyEmail = async (contact, replyMessage) => {
  try {
    const emailOptions = {
      to: contact.email,
      subject: `Re: Your contact inquiry - MyAstrova`,
      html: `
        <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 25px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border: 1px solid #e0e0e0;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #C06014;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #C06014;
            margin-bottom: 5px;
        }
        .greeting {
            font-size: 18px;
            color: #003D33;
            margin: 15px 0;
        }
        .reply-box {
            background-color: #F7F3E9;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #00695C;
            margin: 15px 0;
        }
        .signature {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            color: #888;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MyAstrova</div>
            <div style="color: #666; font-size: 14px;">Reply to your inquiry</div>
        </div>
        
        <div class="greeting">
            Dear <strong>${contact.name}</strong>,
        </div>
        
        <p>Thank you for contacting MyAstrova. Here's our response to your inquiry:</p>
        
        <div class="reply-box">
            <strong>📝 Our Response:</strong>
            <p style="margin-top: 10px;">${replyMessage}</p>
        </div>
        
        <p>If you have any further questions, feel free to reply to this email.</p>
        
        <div class="signature">
            <p><strong>Best regards,</strong><br>
            The MyAstrova Support Team<br>
            <a href="mailto:support@myastrova.com" style="color: #C06014;">support@myastrova.com</a></p>
        </div>
        
        <div class="footer">
            <p>This is an automated response. Please do not reply to this email if you need further assistance.</p>
            <p>&copy; ${new Date().getFullYear()} MyAstrova. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
      `
    };
    
    // Send email using your existing sendEmail middleware
    await sendEmail(emailOptions);
    
    console.log(`✅ Reply email sent to ${contact.email}`);
    
  } catch (error) {
    console.error("Reply email sending error:", error);
    // Don't throw error - just log it
  }
};

// Delete contact (for admin)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findByIdAndDelete(id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }
    
    res.json({
      success: true,
      message: "Contact deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete contact"
    });
  }
};

// Helper function to send emails (optional)
// Helper function to send emails using your existing sendEmail middleware
const sendNotificationEmails = async (contact) => {
  try {
    // Email to admin
    const adminMailOptions = {
      to: process.env.ADMIN_EMAIL || "admin@myastrova.com",
      subject: `📩 New Contact Form Submission: ${contact.subject}`,
      html: `
        <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            border: 1px solid #e0e0e0;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #C06014;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #C06014;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        .field {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #00695C;
        }
        .field strong {
            color: #003D33;
            display: block;
            margin-bottom: 5px;
        }
        .field-value {
            color: #555;
        }
        .message-box {
            background-color: #F7F3E9;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #B2C5B2;
            margin: 15px 0;
        }
        .badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin: 5px 0;
        }
        .badge-yes {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .badge-no {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 14px;
        }
        .action-btn {
            display: inline-block;
            background-color: #C06014;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
        }
        .timestamp {
            color: #888;
            font-size: 12px;
            text-align: right;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MyAstrova</div>
            <div class="subtitle">New Contact Form Submission Received</div>
        </div>
        
        <div class="content">
            <p>A user has submitted a contact form on the website. Here are the details:</p>
            
            <div class="field">
                <strong>👤 Name</strong>
                <div class="field-value">${contact.name}</div>
            </div>
            
            <div class="field">
                <strong>📧 Email</strong>
                <div class="field-value">${contact.email}</div>
            </div>
            
            <div class="field">
                <strong>📱 Phone</strong>
                <div class="field-value">${contact.phone || 'Not provided'}</div>
            </div>
            
            <div class="field">
                <strong>🏷️ Subject</strong>
                <div class="field-value">${contact.subject.charAt(0).toUpperCase() + contact.subject.slice(1)}</div>
            </div>
            
            <div class="field">
                <strong>🔮 Astrologer Interest</strong>
                <div class="field-value">
                    <span class="badge ${contact.astrologerInterest ? 'badge-yes' : 'badge-no'}">
                        ${contact.astrologerInterest ? '✓ Yes - Interested' : '✗ No'}
                    </span>
                </div>
            </div>
            
            <div class="message-box">
                <strong>📝 Message:</strong>
                <p>${contact.message}</p>
            </div>
            
            <div class="timestamp">
                📅 Submitted: ${contact.createdAt.toLocaleString('en-IN', { 
                    timeZone: 'Asia/Kolkata',
                    dateStyle: 'medium', 
                    timeStyle: 'short' 
                })}
            </div>
        </div>
        
        <div class="footer">
            <p>You can manage this contact from the admin panel:</p>
            <a href="${process.env.ADMIN_URL || 'https://admin.myastrova.com'}/contacts" class="action-btn">
                View in Admin Panel
            </a>
            <p style="margin-top: 20px;">
                <small>This is an automated notification. Please do not reply to this email.</small>
            </p>
        </div>
    </div>
</body>
</html>
      `
    };
    
    // Auto-reply to user
    const userMailOptions = {
      to: contact.email,
      subject: '🙏 Thank You for Contacting MyAstrova',
      html: `
        <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Contacting MyAstrova</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            border: 1px solid #e0e0e0;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #C06014;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #C06014;
            margin-bottom: 10px;
        }
        .welcome-text {
            font-size: 20px;
            color: #003D33;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #444;
        }
        .message-summary {
            background-color: #F7F3E9;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #C06014;
            margin: 20px 0;
        }
        .summary-title {
            color: #C06014;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .summary-item {
            margin-bottom: 10px;
        }
        .astrologer-interest {
            background-color: #e8f5e9;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #4caf50;
            margin: 20px 0;
            display: ${contact.astrologerInterest ? 'block' : 'none'};
        }
        .contact-info {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2196f3;
            margin: 20px 0;
            text-align: center;
        }
        .phone-number {
            font-size: 24px;
            font-weight: bold;
            color: #003D33;
            margin: 10px 0;
        }
        .hours {
            color: #666;
            font-size: 14px;
        }
        .next-steps {
            margin: 30px 0;
        }
        .step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        .step-icon {
            width: 30px;
            height: 30px;
            background-color: #C06014;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            flex-shrink: 0;
            font-weight: bold;
        }
        .step-content {
            flex: 1;
        }
        .step-title {
            font-weight: bold;
            color: #003D33;
            margin-bottom: 5px;
        }
        .step-description {
            color: #666;
        }
        .cta-button {
            display: block;
            width: 100%;
            background-color: #C06014;
            color: white;
            text-align: center;
            padding: 15px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            transition: background-color 0.3s;
        }
        .cta-button:hover {
            background-color: #D47C3A;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 14px;
        }
        .social-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 20px 0;
        }
        .social-link {
            color: #C06014;
            text-decoration: none;
            font-weight: bold;
        }
        .disclaimer {
            font-size: 12px;
            color: #999;
            margin-top: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MyAstrova</div>
            <div class="welcome-text">Thank You for Contacting Us!</div>
            <div class="subtitle">Your spiritual journey begins here</div>
        </div>
        
        <div class="content">
            <div class="greeting">
                Dear <strong>${contact.name}</strong>,
            </div>
            
            <p>We have successfully received your message and truly appreciate you taking the time to reach out to us. Our dedicated team will review your inquiry and get back to you within <strong>24 hours</strong>.</p>
            
            <div class="message-summary">
                <div class="summary-title">📋 Your Message Summary:</div>
                <div class="summary-item">
                    <strong>Subject:</strong> ${contact.subject.charAt(0).toUpperCase() + contact.subject.slice(1)}
                </div>
                <div class="summary-item">
                    <strong>Submitted:</strong> ${contact.createdAt.toLocaleString('en-IN', { 
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                    })}
                </div>
            </div>
            
            <div class="astrologer-interest" id="astrologerSection">
                <strong>🎯 Astrologer Application Noted!</strong>
                <p>We have registered your interest in joining as an astrologer. Our astrologer relations team will contact you with detailed information about the application process, requirements, and benefits within 2-3 business days.</p>
            </div>
            
            <div class="next-steps">
                <div class="step-title">📅 What happens next?</div>
                
                <div class="step">
                    <div class="step-icon">1</div>
                    <div class="step-content">
                        <div class="step-title">Review Process</div>
                        <div class="step-description">Our support team will review your message and assign it to the appropriate department.</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-icon">2</div>
                    <div class="step-content">
                        <div class="step-title">Response Timeline</div>
                        <div class="step-description">You will receive a detailed response from our team within 24 hours via email.</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-icon">3</div>
                    <div class="step-content">
                        <div class="step-title">Follow-up</div>
                        <div class="step-description">If needed, we may reach out for additional information to better assist you.</div>
                    </div>
                </div>
            </div>
            
            <div class="contact-info">
                <strong>📞 Need Immediate Assistance?</strong>
                <div class="phone-number">+91 98765 43210</div>
                <div class="hours">Available Monday-Saturday: 9 AM - 9 PM IST</div>
                <p style="margin-top: 10px; font-size: 14px;">For registered users, 24/7 emergency spiritual support is available.</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'https://myastrova.com'}/astrologers" class="cta-button">
                🔮 Explore Our Expert Astrologers
            </a>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <a href="${process.env.FRONTEND_URL || 'https://myastrova.com'}/contact" class="social-link">Contact Us</a>
                <a href="${process.env.FRONTEND_URL || 'https://myastrova.com'}/faq" class="social-link">FAQ</a>
                <a href="${process.env.FRONTEND_URL || 'https://myastrova.com'}/privacy" class="social-link">Privacy Policy</a>
                <a href="${process.env.FRONTEND_URL || 'https://myastrova.com'}/terms" class="social-link">Terms</a>
            </div>
            
            <p>
                Best regards,<br>
                <strong>The MyAstrova Team</strong><br>
                <em>Guiding your spiritual journey with celestial wisdom</em>
            </p>
            
            <div class="disclaimer">
                This is an automated message. Please do not reply to this email directly.<br>
                If you have further questions, please contact us through our website.
            </div>
        </div>
    </div>
    
    <script>
        // Show astrologer interest section if applicable
        const astrologerInterest = ${contact.astrologerInterest};
        if (astrologerInterest) {
            document.getElementById('astrologerSection').style.display = 'block';
        }
    </script>
</body>
</html>
      `
    };
    
    // Import your existing sendEmail middleware
   
    // Send emails using your existing middleware
    
      // Send to admin
      await sendEmail(adminMailOptions);
      
      // Send auto-reply to user
      await sendEmail(userMailOptions);
      
      console.log(`✅ Contact emails sent to admin and ${contact.email}`);
   
    
    
  } catch (error) {
    console.error("Email sending error:", error);
    // Don't throw error to prevent form submission failure
  }
};
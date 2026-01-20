import User  from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import axios from 'axios'
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";



// Input Validation Helper

const otpStore = new Map();

    const Signup = async (req, res) =>{
    const { name, phone } = req.body;
    

    try {
        const existingUser = await User.findOne( { phone: phone});
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this contact" });
        }
      
        const newUser = new User({ username: name, phone });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Assuming required imports (twilio, jwt, isE164) are present at the top of the file

// Assuming required imports (twilio, jwt, isE164) are present at the top of the file

const Login = async (req, res) => {
    const { phone, otp } = req.body;
    
    // 1. Input Validation and Formatting
   

    if (!phone || !otp ) {
        return res.status(400).json({ success: false, message: 'Missing phone number or code, or invalid phone format.' });
    }
    
    // 2. Twilio Configuration Check (CRITICAL)
   

    try {
        const record = otpStore.get(phone);

  if (!record) {
    return res.status(400).json({ success: false, message: "OTP expired or not found" });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(formattedPhone);
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  if (record.otp.toString() !== otp.toString()) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

     otpStore.delete(phone);
 

        // Initialize Twilio client
        
        
        // Find User Record (Essential for JWT payload and database lookup)
        // NOTE: You must include logic here to find the user by phone number
        const user = await User.findOne({ phone: phone }); 
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

      
        // 3. Perform Verification Check - Isolated Try/Catch Block for Twilio API call
        
            // This captures the 404 error if Twilio fails the API call itself.
           

        // 4. Handle Verification Result
      
            // SUCCESS: Generate JWT and return response
            // Assuming 'User' model is imported and used for authentication
            const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: '10d' });
           // console.log(token)
            // You should return the user role here for frontend routing
            res.status(200).json({ message: "Login successful", token, data: user }); 
        
    } catch (error) {
        // 5. Handle Final Internal Errors (DB access, JWT failure, etc.)
        console.error("Final Error logging in user:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};


const userProfile = async (req, res) =>{
    try {
        const token = req.params.token;
        let user = jwt.decode(token);
       
        const result = await User.findById(user.id);
      
        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User profile retrieved successfully", data: result});
    } catch (error) {
        console.error("Error retrieving user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


const deleteUser = async(req, res) =>{
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const user  = async(req, res) =>{
    const phone = req.params.phone;
   
   const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
   
   
    try{
        const existingUser = await User.findOne({phone: formattedPhone});
        
        if(!existingUser){
            return res.status(200).json({success: false, message: "User not found with this contact"});
        }
        else{
            return res.status(200).json({success: true, message: "User not found with this contact"});

        }
        
    }catch(err){
        console.error("Error finding user:", err);
        res.status(500).json({ message: "Internal server error" });
    }

}
const requestotp = async( req, res) =>{
    const phone = req.params.phone;
   
  
   
    try{
        
    if (!phone) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format. Must be E.164 (+CCNNNNNNNNN).' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);

    // 2️⃣ Store OTP temporarily (5 mins expiry)
    otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
    
     // Country code (91)
const countryCode = phone.substring(1, 3);

// Mobile number
const mobile = phone.substring(3);
    // 3️⃣ Send SMS via CPaaS API
    const response = await axios.get (`https://cpaas.socialteaser.com/restapi/request.php?authkey=6aa45940ce7d45f2&mobile=${mobile}&country_code=${countryCode}&sid=29289&name=Twinkle&otp=${otp}` );
      
       // const result = await User.findOneAndUpdate({phone: phone.email}, {otp: otp});
       // console.log(result)
       return res.status(200).json({ 
            success: true, 
            message: 'Verification request sent.',
           
            // WARNING: Do NOT send the Verification SID back to the client. The Twilio Verify API handles the binding automatically.
        });
        
    }catch(err){
        console.log(err.message)
        //console.error("E
        // rror sending OTP:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }


}

const convertTo24Hour = (hour, meridiem) => {
  let h = Number(hour);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return h;
};
 const updateAstroProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;
   
 const getLatLngFromCity = async (city) => {
  if (!city) return null;

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    city
  )}&format=json&limit=1`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "myastrova/1.0 (contact@myastrova.com)",
      "Accept": "application/json",
    },
  });

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("🌐 Nominatim raw response:", text);
    throw new Error("Location service error");
  }

  if (!Array.isArray(data) || !data.length) {
    throw new Error("Location not found");
  }

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };
};


    const geo = await getLatLngFromCity(data.birthCity);
   

   const hour24 = convertTo24Hour(
      data.birthHour,
      data.birthMeridiem
    );

    await User.findByIdAndUpdate(userId, {
      astroProfile: {
        fullName: data.fullName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        birthDetails: {
          day: new Date(data.dateOfBirth).getDate(),
          month: new Date(data.dateOfBirth).getMonth() + 1,
          year: new Date(data.dateOfBirth).getFullYear(),
          hour: hour24,
          minute: Number(data.birthMinute),
        },
        birthPlace: {
          city: data.birthCity,
          state: data.birthState,
          country: data.birthCountry || "India",
          latitude: geo.lat,
          longitude: geo.lon,
          timezone: 5.5,
        },
        maritalStatus: data.maritalStatus,
        occupation: data.occupation,
        problemAreas: data.problemAreas,
      },
      isProfileComplete: true,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
    console.log(err.message)
  }
};

const getwalletBalance = async(req, res) =>{
  const userId = req.user.id;
 
  const result = await User.findById(userId);
  if(result){
    res.send({balance: result.walletBalance})
  }
}






/**
 * @desc Add balance to wallet after payment success
 * @route POST /api/wallet/add
 * body: { amount }
 */
 const addMoneyToWallet = async (req, res) => {
  try {
    let { amount } = req.body;

    amount = Number(amount);

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ SAFE DEFAULT
    user.walletBalance = Number(user.walletBalance || 0) + amount;

    await user.save();

    res.json({
      success: true,
      balance: user.walletBalance,
      addedAmount: amount,
    });

  } catch (err) {
    console.error("Wallet update error:", err);
    res.status(500).json({ message: "Wallet update failed" });
  }
};

const meetRequest = async (req, res) => {
  try {
    const {
      astrologerId,
      astrologerEmail,
      astrologerName,
      userName,
      userEmail,
      userPhone,
      message,
      service
    } = req.body;

    // Validate required fields
    if (!astrologerEmail || !userName || !userEmail || !userPhone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create email template
    const emailSubject = `New Meeting Request from ${userName}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #C06014, #003D33); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-item { margin-bottom: 10px; }
          .label { font-weight: bold; color: #003D33; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 24px; background: #C06014; color: white; text-decoration: none; border-radius: 5px; }
          .user-profile { background: #F7F3E9; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔮 New Meeting Request</h1>
            <p>MyAstrova</p>
          </div>
          <div class="content">
            <h2>Dear ${astrologerName},</h2>
            <p>You have received a new meeting request from a client:</p>
            
            <div class="user-profile">
              <h3>👤 Client Details:</h3>
              <div class="details">
                <div class="detail-item">
                  <span class="label">Name:</span> ${userName}
                </div>
                <div class="detail-item">
                  <span class="label">Email:</span> ${userEmail}
                </div>
                <div class="detail-item">
                  <span class="label">Phone:</span> ${userPhone}
                </div>
                <div class="detail-item">
                  <span class="label">Service:</span> ${service || 'Personal Meeting'}
                </div>
                ${message ? `
                <div class="detail-item">
                  <span class="label">Message:</span> ${message}
                </div>
                ` : ''}
                <div class="detail-item">
                  <span class="label">Request Time:</span> ${new Date().toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    dateStyle: 'full',
                    timeStyle: 'long'
                  })}
                </div>
              </div>
            </div>
            
            <p><strong>Please contact the client within 24 hours to schedule the meeting.</strong></p>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="mailto:${userEmail}" class="btn">
                📧 Contact Client
              </a>
            </div>
            
            <p style="margin-top: 30px;">
              <strong>Note:</strong> This is an automated message. Please do not reply to this email.
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} MyAstrova. All rights reserved.</p>
            <p>This email was sent from the MyAstrova platform.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to astrologer
    await sendEmail({
      to: astrologerEmail,
      subject: emailSubject,
      html: emailHtml
    });

    // Also send confirmation email to user
    const userConfirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00695C, #003D33); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .success-icon { color: #4CAF50; font-size: 48px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Meeting Request Confirmation</h1>
          </div>
          <div class="content">
            <div class="success-icon">✓</div>
            <h2>Dear ${userName},</h2>
            <p>Your meeting request has been successfully sent to <strong>${astrologerName}</strong>.</p>
            
            <div class="details">
              <p><strong>What happens next?</strong></p>
              <ol>
                <li>The astrologer will review your request</li>
                <li>They will contact you within 24 hours via email or phone</li>
                <li>You'll discuss and finalize the meeting details</li>
                <li>The meeting can be scheduled at your mutual convenience</li>
              </ol>
              
              <p><strong>Astrologer Contact:</strong> ${astrologerEmail}</p>
              ${message ? `<p><strong>Your Message:</strong> ${message}</p>` : ''}
            </div>
            
            <p>If you don't hear back within 24 hours, please contact our support team.</p>
            
            <p>Best regards,<br>
            MyAstrova Team</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} MyAstrova</p>
            <p>Thank you for choosing our services!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: userEmail,
      subject: `Meeting Request Confirmation - ${astrologerName}`,
      html: userConfirmationHtml
    });

    // Optionally, save the meeting request to database
    // You can create a MeetingRequest model if needed
    // const meetingRequest = await MeetingRequest.create({ ... });

    res.status(200).json({
      success: true,
      message: 'Meeting request sent successfully',
      data: {
        astrologerName,
        astrologerEmail,
        userEmail,
        sentAt: new Date()
      }
    });

  } catch (error) {
    console.error('Meeting request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send meeting request',
      error: error.message
    });
  }
}

export { Signup, Login, userProfile,  deleteUser, user, requestotp, updateAstroProfile, getwalletBalance, addMoneyToWallet, meetRequest };

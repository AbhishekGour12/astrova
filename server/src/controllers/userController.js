import User  from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import axios from 'axios'





// Input Validation Helper

const otpStore = new Map();

    const Signup = async (req, res) =>{
    const { name, phone } = req.body;
    console.log(phone)

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
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '6h' });
            console.log(token)
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
        console.log(result)
        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User profile retrieved successfully", data: result});
    } catch (error) {
        console.error("Error retrieving user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const updateUser = async (req, res) =>{
    try {
        const userId = req.user.id;
        const { username, phone } = req.body;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user fields
        user.username = username || user.username;
        user.phone = phone || user.phone;
       

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        console.error("Error updating user:", error);
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
    console.log(phone)
   
   const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
   console.log(formattedPhone)
   
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
    console.log(phone)
   
   console.log(process.env.CPAAS_API_KEY)
  
   
    try{
        
    if (!phone) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format. Must be E.164 (+CCNNNNNNNNN).' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);

    // 2️⃣ Store OTP temporarily (5 mins expiry)
    otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
    console.log(otpStore)
     // Country code (91)
const countryCode = phone.substring(1, 3);

// Mobile number
const mobile = phone.substring(3);
    // 3️⃣ Send SMS via CPaaS API
    const response = await axios.get (`https://cpaas.socialteaser.com/restapi/request.php?authkey=6aa45940ce7d45f2&mobile=${mobile}&country_code=${countryCode}&sid=29289&name=Twinkle&otp=${otp}` );
       console.log(response.data)
   
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


export { Signup, Login, userProfile, updateUser, deleteUser, user, requestotp };

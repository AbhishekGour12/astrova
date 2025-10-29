import User  from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import sendOTP from "../middleware/sendOTP.js";
import twilio  from 'twilio'






// Input Validation Helper
const isE164 = (number) => /^\+[1-9]\d{10,14}$/.test(number);

    const Signup = async (req, res) =>{
    const { name, phone } = req.body;
    console.log(req.body)

    try {
        const existingUser = await User.findOne( { phone: phone});
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }
      
        const newUser = new User({ username: name, phone });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const Login = async (req, res) =>{
    const { phone, otp } = req.body;
     const formattedPhone = formData.phone.startsWith("+") ? formData.phone : `+91${formData.phone}`;
    try {
        
        if (!phone || !otp || !isE164(formattedPhone)) {
        return res.status(400).json({ success: false, message: 'Missing phone number or code, or invalid phone format.' });
    }
    
    const client = twilio( process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    const VERIFY_SERVICE_ID = process.env.TWILIO_VERIFY_SERVICE_SID;
   

    const verificationCheck = await client.verify.v2.services(VERIFY_SERVICE_ID)
            .verificationChecks
            .create({ to: formattedPhone, code: otp }); 

     if (verificationCheck.status === 'approved') {
            // SUCCESS! User is verified.
             const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: '1h' });
             res.status(200).json({ message: "Login successful", token });
        } else {
            // Code is incorrect or expired (status will be 'pending' or 'failed')
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid or expired OTP code.',
                status: verificationCheck.status 
            });
        }
        /**  
        if(user.otp === Number(otp)){
      
        }else{
            res.status(400).json({message: "Invalid OTP"});
        }
            */
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const userProfile = async (req, res) =>{
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User profile retrieved successfully", user });
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
    const phone = req.params;
   
   
    try{
        const existingUser = await User.findOne({phone: phone.phone});
        
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
    const phone = req.params;
     const formattedPhone = phone.phone.startsWith("+") ? phone.phone : `+91${phone.phone}`;
   
    const client = twilio( process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
   console.log(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
   const VERIFY_SERVICE_ID = process.env.TWILIO_VERIFY_SERVICE_SID;
   
    try{
        
    if (!phone.phone || !isE164(formattedPhone)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format. Must be E.164 (+CCNNNNNNNNN).' });
    }

       const verification = await client.verify.v2
      .services(VERIFY_SERVICE_ID)
      .verifications.create({
        to: formattedPhone,
        channel: "sms",
      });
   
       // const result = await User.findOneAndUpdate({phone: phone.email}, {otp: otp});
       // console.log(result)
       return res.status(200).json({ 
            success: true, 
            message: 'Verification request sent.',
            status: verification.status,
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

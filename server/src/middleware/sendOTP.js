import nodemailer from 'nodemailer';

let sendOTP = async(to, subject, htmlContent) =>{
    try{
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: "aggour124421@gmail.com",
                pass: "vupf wimf scix xtse"
            }
        })
        
        const mailOptions = {
            from: 'balakhana78@gmail.com',
            to, 
            subject,
            html: htmlContent,
        }

        const info = await transporter.sendMail(mailOptions);
        console.log("message sent successfully"+info.messageId)
    }catch(err){
        console.log(err.message)
    }


}
export default sendOTP;

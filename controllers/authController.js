const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt =  require('bcryptjs');
const jwt = require('jsonwebtoken');
const {sendOTPEmail} = require('../utils/email');

const generateToken = (id, role) =>{
   return jwt.sign({id, role}, process.env.JWT_SECRET, {expiresIn: '7d'});
}

//Register Users
exports.registerUser = async (req, res) =>{
 const {name, email, password} = req.body;   
 
 let userExists = await User.findOne({email});
 if(userExists){
    return res.status(400).json({error: 'User already exists'});
 }

 const salt = await bcrypt.genSalt(10);
 const hashedPassword = await bcrypt.hash(password, salt);
 
 try{
    const user = await User.create({
      name, 
      email, 
      password: hashedPassword,
      role:"user",
      isVerified : false
   });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`OTP for ${email}: ${otp}`);
    await OTP.create({email, otp, action : 'account_verification'})
    await sendOTPEmail(email, otp, "account_verification");
     
    res.status(201).json({
      message : 'User registered successfully. Please check your email',
      email  : user.email 
   });


 } catch(error) {
    res.status(400).json({error : error.message});
 }
};

//Login user
exports.loginUser = async (req , res) =>{
   try {
      const { email, password} = req.body;

      let user = await User.findOne({email});
      if(!user){
         return res.status(400).json({error : 'Invalid credentials, please signup first'});
      }

      const isMatch =  await bcrypt.compare(password, user.password);
      if(!isMatch){
         return res.status(400).json({error : 'Invalid credentials'});
      }

      if(!user.isVerified && user.role === 'user'){
         const otp = Math.floor(100000 + Math.random() * 900000).toString();
         await OTP.deleteMany({email, action: 'account_verification'}); //remove old OTPs
         await OTP.create({email, otp, action: 'account_verification'});
         await sendOTPEmail(email, otp, 'account_verification');
          return res.status(400).json({
            error: 'Account not verified . A new OTP has been send to your email',
            needsVerification: true
          }) ;
      }
     
      res.json({
      message: 'Login Successfull',
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role) 
      });
   } catch (error) {
      console.error('Error in loginUser:', error);
      res.status(500).json({ error: error.message || 'Server Error' });
   }
};

//verify otp
exports.verifyOtp = async (req, res) =>{
   try {
      const {email,otp} = req.body;
      const otpRecord = await OTP.findOne({email, otp, action : 'account_verification'}); 

      if(!otpRecord){
         return res.status(400).json({error: 'Invalid or expired OTP'});
      }

      // Check if expired (older than 2 minutes)
      const now = new Date();
      const expirationTime = new Date(otpRecord.createdAt.getTime() + 2 * 60 * 1000);
      if (now > expirationTime) {
         await OTP.deleteOne({ _id: otpRecord._id });
         return res.status(400).json({error: 'Invalid or expired OTP'});
      }

      const user =  await User.findOneAndUpdate(
         {email},
         {isVerified : true},
          {new : true}
      );
       await OTP.deleteMany({
            email,
           action: "account_verification"
        });//remobe used
      res.json(
         {
            message : 'Account verified successfully. You can now log in.',
            _id : user._id,
            name : user.name,
            email : user.email,
            role : user.role,
            token : generateToken(user._id, user.role)         
         }
      ); 
   } catch (error) {
      console.error('Error in verifyOtp:', error);
      res.status(500).json({ error: error.message || 'Server Error' });
   }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
   try {
      const { email } = req.body;
      if (!email) {
         return res.status(400).json({ error: 'Email is required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
         return res.status(404).json({ error: 'No user found with this email address' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Password reset OTP for ${email}: ${otp}`);
      await OTP.deleteMany({ email, action: 'password_reset' });
      await OTP.create({ email, otp, action: 'password_reset' });
      await sendOTPEmail(email, otp, 'password_reset');

      res.json({ message: 'Password reset code has been sent to your email.' });
   } catch (error) {
      console.error('Error in forgotPassword:', error);
      res.status(500).json({ error: error.message || 'Server Error' });
   }
};

// Reset Password
exports.resetPassword = async (req, res) => {
   try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
         return res.status(400).json({ error: 'Email, OTP, and new password are required' });
      }

      const otpRecord = await OTP.findOne({ email, otp, action: 'password_reset' });
      if (!otpRecord) {
         return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Check if expired (older than 2 minutes)
      const now = new Date();
      const expirationTime = new Date(otpRecord.createdAt.getTime() + 2 * 60 * 1000);
      if (now > expirationTime) {
         await OTP.deleteOne({ _id: otpRecord._id });
         return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      const user = await User.findOne({ email });
      if (!user) {
         return res.status(404).json({ error: 'User not found' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      user.isVerified = true;
      await user.save();

      await OTP.deleteMany({ email, action: 'password_reset' });

      res.json({ message: 'Password has been reset successfully. You can now log in.' });
   } catch (error) {
      console.error('Error in resetPassword:', error);
      res.status(500).json({ error: error.message || 'Server Error' });
   }
};
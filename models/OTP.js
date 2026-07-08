const mongoose= require('mongoose');

const otpSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
    },
    otp : {
        type  : String,
        requied : true,
    },
    action:{
        type : String,
        enum: ['account_verification','event_booking','password_reset'],
        required  :true,
    },
    createdAt: {
        type : Date,
        default : Date.now,
        expires : 120  // otp expires after 2 minutes (120 seconds)
    }
});

module.exports = mongoose.model('OTP' , otpSchema);


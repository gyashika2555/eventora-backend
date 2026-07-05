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
        enum: ['account_verification','event_booking'],
        required  :true,
    },
    createdAt: {
        type : Date,
        default : Date.now,
        expires : 300  //otp requires after 5 seconds
    }
});

module.exports = mongoose.model('OTP' , otpSchema);


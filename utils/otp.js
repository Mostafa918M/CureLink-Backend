const crypto = require('crypto');


module.exports.generateOTP = (length = 6)=>{
    const otp = crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length)).toString();
    return otp;
}
